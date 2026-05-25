import { Toaster } from 'react-hot-toast'
import { GraphProvider } from '@/lib/context/GraphContext'
import ConceptGraph from '@/components/graph/ConceptGraph'

export default function Home() {
  return (
    <GraphProvider>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <main
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#F7F4F0',
        }}
      >
        <ConceptGraph />
      </main>
    </GraphProvider>
  )
}
