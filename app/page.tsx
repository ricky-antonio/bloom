'use client'

import { useCallback, useRef, useState } from 'react'
import { GraphProvider, useGraphState } from '@/lib/context/GraphContext'
import { exportGraph } from '@/lib/graph'
import { useKeyboard } from '@/lib/hooks/useKeyboard'
import ConceptGraph from '@/components/graph/ConceptGraph'
import type { ConceptGraphHandle } from '@/components/graph/ConceptGraph'
import SearchBar from '@/components/ui/SearchBar'
import Toolbar from '@/components/layout/Toolbar'
import DetailPanel from '@/components/ui/DetailPanel'
import Legend from '@/components/ui/Legend'
import ZoomControls from '@/components/ui/ZoomControls'

function HomeContent() {
  const { state, dispatch } = useGraphState()
  const graphRef = useRef<ConceptGraphHandle>(null)
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const depth = state.nodes.length > 0
    ? Math.max(...state.nodes.map(n => n.depth))
    : 0

  function handleSearch(concept: string) {
    if (state.nodes.some(n => n.ring === 'core' && n.label.toLowerCase() === concept.toLowerCase())) {
      const coreNode = state.nodes.find(n => n.ring === 'core')
      if (coreNode) {
        dispatch({ type: 'SELECT_NODE', nodeId: coreNode.id })
        setTimeout(() => dispatch({ type: 'SELECT_NODE', nodeId: null }), 600)
      }
      return
    }
    dispatch({ type: 'CLEAR_GRAPH' })
    setTimeout(() => {
      dispatch({ type: 'EXPAND_CONCEPT', concept, nodeId: concept.toLowerCase().trim(), depth: 0 })
    }, 0)
  }

  const handleClearRequest = useCallback(() => {
    setIsConfirmingClear(true)
    clearTimerRef.current = setTimeout(() => setIsConfirmingClear(false), 4000)
  }, [])

  function handleConfirmClear() {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    dispatch({ type: 'CLEAR_GRAPH' })
    setIsConfirmingClear(false)
  }

  function handleCancelClear() {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    setIsConfirmingClear(false)
  }

  function handleExport() {
    const json = exportGraph(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bloom-${state.seedConcept || 'graph'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleNewConcept() {
    const input = document.querySelector<HTMLInputElement>('[aria-label="Enter a concept to explore"]')
    input?.focus()
  }

  const handleExpand = useCallback((nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return
    dispatch({ type: 'SELECT_NODE', nodeId: null })
    dispatch({ type: 'RECENTRE', nodeId })
    dispatch({ type: 'EXPAND_CONCEPT', concept: node.label, depth: node.depth, nodeId })
  }, [state.nodes, dispatch])

  function handleAddTag(label: string, parentNodeId: string) {
    dispatch({ type: 'ADD_TAG_NODE', label, parentNodeId })
  }

  function handleDefinitionLoaded(nodeId: string, definition: string, relatedTags: string[]) {
    dispatch({ type: 'SET_DEFINITION', nodeId, definition, relatedTags })
  }

  const handleEscape = useCallback(() => {
    dispatch({ type: 'SELECT_NODE', nodeId: null })
    ;(document.activeElement as HTMLElement | null)?.blur()
  }, [dispatch])

  const handleSpace = useCallback(() => {
    graphRef.current?.resetZoom()
  }, [])

  const handleNavigate = useCallback((nodeId: string) => {
    dispatch({ type: 'SELECT_NODE', nodeId })
  }, [dispatch])

  useKeyboard({
    activeNodeId: state.activeNodeId,
    isSearchFocused,
    nodes: state.nodes,
    edges: state.edges,
    onEscape: handleEscape,
    onSpace: handleSpace,
    onClearGraph: handleClearRequest,
    onExpandNode: handleExpand,
    onNavigate: handleNavigate,
  })

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FDF8F2 0%, #F5F0E8 45%, #F0EEF5 100%)',
        position: 'relative',
      }}
    >
      {/* Ambient colour washes */}
      <div
        style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,219,187,0.16) 0%, transparent 70%)',
          top: -80, left: -80, pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(186,221,255,0.13) 0%, transparent 70%)',
          bottom: -50, right: 220, pointerEvents: 'none', zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(186,255,245,0.10) 0%, transparent 70%)',
          top: '28%', right: 240, pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Toolbar */}
      <Toolbar
        seedConcept={state.seedConcept}
        nodeCount={state.nodes.length}
        depth={depth}
        onSave={handleExport}
        onExport={handleExport}
        onNewConcept={handleNewConcept}
        isConfirmingClear={isConfirmingClear}
        onConfirmClear={handleConfirmClear}
        onCancelClear={handleCancelClear}
        onClearRequest={handleClearRequest}
      />

      {/* Search input — centred, below toolbar */}
      <div
        style={{
          position: 'fixed',
          top: 68,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
      >
        <SearchBar
          onSubmit={handleSearch}
          disabled={state.isExpanding}
          onFocusChange={setIsSearchFocused}
        />
      </div>

      {/* Graph canvas */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <ConceptGraph
          ref={graphRef}
          onConceptSubmit={handleSearch}
          onExpansionComplete={() => { setTimeout(() => graphRef.current?.resetZoom(), 600) }}
        />
      </div>

      {/* Detail panel (fixed right) */}
      <DetailPanel
        onExpand={handleExpand}
        onAddTag={handleAddTag}
        onDefinitionLoaded={handleDefinitionLoaded}
      />

      {/* Legend */}
      <Legend />

      {/* Zoom controls */}
      <ZoomControls
        onZoomIn={() => graphRef.current?.zoomIn()}
        onZoomOut={() => graphRef.current?.zoomOut()}
        onReset={() => graphRef.current?.resetZoom()}
      />
    </div>
  )
}

export default function Home() {
  return (
    <GraphProvider>
      <HomeContent />
    </GraphProvider>
  )
}
