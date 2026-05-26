'use client'

import { useEffect } from 'react'
import type { ConceptNode, ConceptEdge } from '@/lib/types'

interface UseKeyboardProps {
  activeNodeId: string | null
  isSearchFocused: boolean
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  onEscape: () => void
  onSpace: () => void
  onClearGraph: () => void
  onExpandNode: (nodeId: string) => void
  onNavigate: (nodeId: string) => void
}

function getNextNode(
  key: string,
  activeNodeId: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[]
): string | null {
  const activeNode = nodes.find((n) => n.id === activeNodeId)
  if (!activeNode) return null

  const connectedIds = new Set<string>()
  for (const edge of edges) {
    const src = typeof edge.source === 'string' ? edge.source : (edge.source as ConceptNode).id
    const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as ConceptNode).id
    if (src === activeNodeId) connectedIds.add(tgt)
    if (tgt === activeNodeId) connectedIds.add(src)
  }

  const connected = nodes.filter((n) => connectedIds.has(n.id) && n.x != null && n.y != null)
  if (connected.length === 0) return null

  const ax = activeNode.x ?? 0
  const ay = activeNode.y ?? 0

  // Sort clockwise from 12 o'clock (atan2(dx, -dy) normalised to [0, 2π])
  const sorted = [...connected].sort((a, b) => {
    const angleA = (Math.atan2((a.x ?? 0) - ax, -((a.y ?? 0) - ay)) + 2 * Math.PI) % (2 * Math.PI)
    const angleB = (Math.atan2((b.x ?? 0) - ax, -((b.y ?? 0) - ay)) + 2 * Math.PI) % (2 * Math.PI)
    return angleA - angleB
  })

  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return sorted[0].id
  }
  return sorted[sorted.length - 1].id
}

export function useKeyboard({
  activeNodeId,
  isSearchFocused,
  nodes,
  edges,
  onEscape,
  onSpace,
  onClearGraph,
  onExpandNode,
  onNavigate,
}: UseKeyboardProps): void {
  // isSearchFocused is accepted for interface completeness; actual blocking uses e.target check
  void isSearchFocused

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Escape always fires — blurs search or closes panel
      if (e.key === 'Escape') {
        onEscape()
        return
      }

      // All other shortcuts: blocked when input is focused
      if (isInput) return

      if (e.key === ' ') {
        e.preventDefault()
        onSpace()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        onClearGraph()
        return
      }

      if (e.key === 'e' || e.key === 'E') {
        if (activeNodeId) {
          e.preventDefault()
          onExpandNode(activeNodeId)
        }
        return
      }

      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (!activeNodeId) return
        e.preventDefault()
        const nextId = getNextNode(e.key, activeNodeId, nodes, edges)
        if (nextId) onNavigate(nextId)
        return
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeNodeId, nodes, edges, onEscape, onSpace, onClearGraph, onExpandNode, onNavigate])
}
