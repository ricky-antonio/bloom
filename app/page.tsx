'use client'

import { Toaster } from 'react-hot-toast'
import { GraphProvider, useGraphState } from '@/lib/context/GraphContext'
import ConceptGraph from '@/components/graph/ConceptGraph'
import SearchBar from '@/components/ui/SearchBar'

function HomeContent() {
  const { state, dispatch } = useGraphState()

  function handleSearch(concept: string) {
    dispatch({ type: 'CLEAR_GRAPH' })
    dispatch({ type: 'EXPAND_CONCEPT', concept, depth: 0, nodeId: concept.toLowerCase().trim() })
  }

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#F7F4F0',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: 50,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          fontWeight: 700,
          fontSize: 13,
          color: '#496580',
        }}
      >
        bloom
      </div>
      <div
        style={{
          position: 'fixed',
          top: 58,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
      >
        <SearchBar onSubmit={handleSearch} disabled={state.isExpanding} />
      </div>
      <ConceptGraph />
    </main>
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
