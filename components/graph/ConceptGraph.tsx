'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useGraphState } from '@/lib/context/GraphContext'
import { addExpansionNodes } from '@/lib/graph'
import { parseExpansionResponse } from '@/lib/ai/expand'
import { createSimulation } from '@/lib/force'
import type { ConceptNode, ConceptEdge, GraphState } from '@/lib/types'
import GraphCanvas from './GraphCanvas'
import GraphNode from './GraphNode'
import GraphEdge from './GraphEdge'

export default function ConceptGraph() {
  const { state, dispatch } = useGraphState()

  // d3 internal: simulation and d3 module stored in refs, never React state
  const d3Ref = useRef<any>(null) // d3 internal
  const simulationRef = useRef<any>(null) // d3 internal

  // Always-current refs for tick handler and async callbacks — avoids stale closures
  const nodesRef = useRef<ConceptNode[]>(state.nodes)
  const edgesRef = useRef<ConceptEdge[]>(state.edges)
  const stateRef = useRef<GraphState>(state)

  // Keep refs in sync with state — defined first so they run before simulation effects
  useEffect(() => { nodesRef.current = state.nodes }, [state.nodes])
  useEffect(() => { edgesRef.current = state.edges }, [state.edges])
  useEffect(() => { stateRef.current = state }, [state])

  // Tick handler — reads refs at call time, updates DOM directly, never touches React state
  const tickHandler = useCallback(function tick() {
    const nodes = nodesRef.current
    const edges = edgesRef.current

    nodes.forEach(node => {
      if (isNaN(node.x ?? 0)) { node.x = 0; node.vx = 0 }
      if (isNaN(node.y ?? 0)) { node.y = 0; node.vy = 0 }
    })

    nodes.forEach(node => {
      const el = document.querySelector(`[data-node-id="${node.id}"]`)
      if (el) el.setAttribute('transform', `translate(${node.x ?? 0},${node.y ?? 0})`)
    })

    edges.forEach(edge => {
      const el = document.querySelector(`[data-edge-id="${edge.id}"]`) as SVGLineElement | null
      if (!el) return
      const src = edge.source as any // d3 internal: forceLink mutates source/target to node objects
      const tgt = edge.target as any // d3 internal
      el.setAttribute('x1', String(src.x ?? 0))
      el.setAttribute('y1', String(src.y ?? 0))
      el.setAttribute('x2', String(tgt.x ?? 0))
      el.setAttribute('y2', String(tgt.y ?? 0))
    })
  }, [])

  // Effect 1 — Load D3 once on mount
  useEffect(() => {
    let cancelled = false

    void import('d3').then(d3 => {
      if (cancelled) return
      d3Ref.current = d3
      // Rare case: nodes arrived before d3 finished loading (e.g. SSR hydration)
      if (nodesRef.current.length > 0 && !simulationRef.current) {
        simulationRef.current = createSimulation(d3, nodesRef.current, edgesRef.current)
        simulationRef.current.on('tick', tickHandler)
      }
    })

    return () => {
      cancelled = true
      simulationRef.current?.stop()
      simulationRef.current = null
    }
  }, [tickHandler])

  // Effect 2 — Restart simulation when graph structure changes (nodes/edges added or removed)
  useEffect(() => {
    const d3 = d3Ref.current
    if (!d3 || nodesRef.current.length === 0) return

    if (simulationRef.current) {
      simulationRef.current.nodes(nodesRef.current)
      simulationRef.current.force('link')?.links(edgesRef.current)
      simulationRef.current.alpha(0.4).restart()
    } else {
      simulationRef.current = createSimulation(d3, nodesRef.current, edgesRef.current)
      simulationRef.current.on('tick', tickHandler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nodes.length, state.edges.length, tickHandler])

  // Effect 3 — Call /api/expand when isExpanding becomes true
  useEffect(() => {
    if (!state.isExpanding || !state.expansionNodeId) return

    const node = stateRef.current.nodes.find(n => n.id === state.expansionNodeId)
    if (!node) return

    const capturedNode = node
    const controller = new AbortController()

    async function expand() {
      try {
        const response = await fetch('/api/expand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concept: capturedNode.label, depth: capturedNode.depth }),
          signal: controller.signal,
        })

        if (controller.signal.aborted) return

        if (!response.ok) {
          dispatch({ type: 'SET_EXPANDING', nodeId: null })
          toast.error("Couldn't reach the AI. Try again.")
          return
        }

        if (controller.signal.aborted) return

        const { text } = await response.json() as { text: string }

        if (controller.signal.aborted) return

        const parsed = parseExpansionResponse(text)
        const { nodes: newNodes, edges: newEdges } = addExpansionNodes(
          stateRef.current,
          parsed,
          capturedNode.id,
          capturedNode.depth + 1
        )

        dispatch({ type: 'ADD_EXPANSION_NODES', nodes: newNodes, edges: newEdges })
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        dispatch({ type: 'SET_EXPANDING', nodeId: null })
        toast.error("Couldn't reach the AI. Try again.")
      }
    }

    void expand()

    return () => {
      controller.abort()
    }
  }, [state.isExpanding, state.expansionNodeId, dispatch])

  const handleSelect = useCallback(
    (nodeId: string) => dispatch({ type: 'SELECT_NODE', nodeId }),
    [dispatch]
  )

  const handleDeselect = useCallback(
    () => dispatch({ type: 'SELECT_NODE', nodeId: null }),
    [dispatch]
  )

  const nodeComponents = useMemo(
    () =>
      state.nodes.map(node => (
        <GraphNode
          key={node.id}
          node={node}
          isSelected={state.activeNodeId === node.id}
          isExpanding={state.isExpanding && state.expansionNodeId === node.id}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
        />
      )),
    [state.nodes, state.activeNodeId, state.isExpanding, state.expansionNodeId, handleSelect, handleDeselect]
  )

  const edgeComponents = useMemo(
    () =>
      state.edges.map(edge => {
        const srcId =
          typeof edge.source === 'string'
            ? edge.source
            : (edge.source as ConceptNode).id
        const tgtId =
          typeof edge.target === 'string'
            ? edge.target
            : (edge.target as ConceptNode).id
        const isHighlighted =
          state.activeNodeId !== null &&
          (srcId === state.activeNodeId || tgtId === state.activeNodeId)
        return <GraphEdge key={edge.id} edge={edge} isHighlighted={isHighlighted} />
      }),
    [state.edges, state.activeNodeId]
  )

  const isEmpty = state.nodes.length === 0 && !state.isExpanding
  const isFirstLoad = state.isExpanding && state.nodes.length <= 1

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isEmpty && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <p style={{ color: '#8AABBC', fontSize: 14 }}>Enter a concept to explore</p>
        </div>
      )}
      {isFirstLoad && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <p style={{ color: '#496580', fontSize: 14 }}>Loading bloom…</p>
        </div>
      )}
      <GraphCanvas>
        <g className="edges">{edgeComponents}</g>
        <g className="nodes">{nodeComponents}</g>
      </GraphCanvas>
    </div>
  )
}
