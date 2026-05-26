export type NodeRing = 'core' | 'ring1' | 'ring2' | 'ring3'
export type SemanticDistance = 'direct' | 'adjacent' | 'tangential' | 'distant'
export type Category = 'awareness' | 'identity' | 'experiential'

export interface ConceptNode {
  id: string
  label: string
  ring: NodeRing
  semanticDistance: SemanticDistance
  category: Category
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
  definition?: string
  definitionPreloaded?: true
  relatedTags?: string[]
  expanded?: boolean
  parentId?: string
  depth: number
}

export interface ConceptEdge {
  id: string
  source: string
  target: string
  ring: NodeRing
}

export interface GraphState {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  activeNodeId: string | null
  seedConcept: string
  isExpanding: boolean
  expansionNodeId: string | null
}

export type GraphAction =
  | { type: 'EXPAND_CONCEPT'; concept: string; nodeId?: string; depth: number }
  | { type: 'ADD_EXPANSION_NODES'; nodes: ConceptNode[]; edges: ConceptEdge[] }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'SET_DEFINITION'; nodeId: string; definition: string; relatedTags: string[] }
  | { type: 'RECENTRE'; nodeId: string }
  | { type: 'CLEAR_GRAPH' }
  | { type: 'SET_EXPANDING'; nodeId: string | null }
  | { type: 'ADD_TAG_NODE'; label: string; parentNodeId: string }

export interface ExpansionResponse {
  ring1: Array<{
    label: string
    category: Category
    reason: string
    definition?: string
  }>
  ring2: Array<{
    label: string
    parentLabel: string
    category: Category
  }>
}

export interface DefinitionResponse {
  definition: string
  relatedTags: [string, string, string, string]
}

export interface AppError {
  code:
    | 'MISSING_CONCEPT'
    | 'CONCEPT_TOO_LONG'
    | 'RATE_LIMITED'
    | 'AI_PARSE_FAILURE'
    | 'AI_NETWORK_FAILURE'
    | 'GRAPH_NO_RING1'
  message: string
  retryable: boolean
}

export const EXPANSION_FALLBACK: ExpansionResponse = {
  ring1: [
    { label: 'meaning', category: 'awareness', reason: 'Fundamental to the concept.' },
    { label: 'context', category: 'awareness', reason: 'Shapes how it is understood.' },
    { label: 'feeling', category: 'experiential', reason: 'The lived experience of it.' },
    { label: 'identity', category: 'identity', reason: 'How it relates to self.' },
    { label: 'change', category: 'experiential', reason: 'How it evolves over time.' },
    { label: 'connection', category: 'identity', reason: 'How it relates to others.' },
  ],
  ring2: [
    { label: 'interpretation', parentLabel: 'meaning', category: 'awareness' },
    { label: 'purpose', parentLabel: 'meaning', category: 'awareness' },
    { label: 'environment', parentLabel: 'context', category: 'awareness' },
    { label: 'perspective', parentLabel: 'context', category: 'awareness' },
    { label: 'emotion', parentLabel: 'feeling', category: 'experiential' },
    { label: 'sensation', parentLabel: 'feeling', category: 'experiential' },
    { label: 'self', parentLabel: 'identity', category: 'identity' },
    { label: 'values', parentLabel: 'identity', category: 'identity' },
    { label: 'growth', parentLabel: 'change', category: 'experiential' },
    { label: 'transition', parentLabel: 'change', category: 'experiential' },
    { label: 'relationship', parentLabel: 'connection', category: 'identity' },
    { label: 'belonging', parentLabel: 'connection', category: 'identity' },
  ],
}

export const DEFINITION_FALLBACK: DefinitionResponse = {
  definition: 'An idea worth exploring. Click any connected concept to go deeper.',
  relatedTags: ['meaning', 'context', 'feeling', 'connection'],
}
