'use client'

import { useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { GraphProvider, useGraphState } from '@/lib/context/GraphContext'
import { exportGraph } from '@/lib/graph'
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

  function handleSearch(concept: string) {
    dispatch({ type: 'CLEAR_GRAPH' })
    dispatch({ type: 'EXPAND_CONCEPT', concept, depth: 0, nodeId: concept.toLowerCase().trim() })
  }

  function handleClear() {
    dispatch({ type: 'CLEAR_GRAPH' })
  }

  function handleExport() {
    const json = exportGraph(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bloom-${state.seedConcept || 'graph'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExpand(nodeId: string) {
    const node = state.nodes.find(n => n.id === nodeId)
    if (!node) return
    dispatch({ type: 'SELECT_NODE', nodeId: null })
    dispatch({ type: 'RECENTRE', nodeId })
    dispatch({ type: 'EXPAND_CONCEPT', concept: node.label, depth: node.depth, nodeId })
  }

  function handleAddTag(label: string, parentNodeId: string) {
    dispatch({ type: 'ADD_TAG_NODE', label, parentNodeId })
  }

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
        onClear={handleClear}
        onExport={handleExport}
      />

      {/* Search input — centred, below toolbar */}
      <div
        style={{
          position: 'fixed',
          top: 64,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
      >
        <SearchBar onSubmit={handleSearch} disabled={state.isExpanding} />
      </div>

      {/* Graph canvas */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <ConceptGraph ref={graphRef} onConceptSubmit={handleSearch} />
      </div>

      {/* Detail panel (fixed right) */}
      <DetailPanel
        onExpand={handleExpand}
        onAddTag={handleAddTag}
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
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <HomeContent />
    </GraphProvider>
  )
}
