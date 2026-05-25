import type {
  ConceptNode,
  ConceptEdge,
  GraphState,
  ExpansionResponse,
  NodeRing,
} from './types'

export function createCoreNode(concept: string, depth: number): ConceptNode {
  return {
    id: concept.toLowerCase().trim(),
    label: concept.trim(),
    ring: 'core',
    semanticDistance: 'direct',
    category: 'awareness',
    fx: 0,
    fy: 0,
    depth,
    expanded: false,
  }
}

export function addExpansionNodes(
  state: GraphState,
  expansion: ExpansionResponse,
  parentId: string,
  depth: number
): { nodes: ConceptNode[]; edges: ConceptEdge[] } {
  const existingIds = new Set(state.nodes.map((n) => n.id))

  const ring1Nodes: ConceptNode[] = []
  for (const item of expansion.ring1) {
    const id = item.label.toLowerCase().trim()
    if (existingIds.has(id)) continue
    existingIds.add(id)
    ring1Nodes.push({
      id,
      label: item.label.trim(),
      ring: 'ring1',
      semanticDistance: 'direct',
      category: item.category,
      fx: null,
      fy: null,
      depth,
      expanded: false,
      parentId,
    })
  }

  const ring2Nodes: ConceptNode[] = []
  for (const item of expansion.ring2) {
    const id = item.label.toLowerCase().trim()
    if (existingIds.has(id)) continue

    const parentRing1 = ring1Nodes.find(
      (n) => n.label.toLowerCase() === item.parentLabel.toLowerCase()
    )
    const ring2ParentId = parentRing1?.id ?? parentId

    existingIds.add(id)
    ring2Nodes.push({
      id,
      label: item.label.trim(),
      ring: 'ring2',
      semanticDistance: 'adjacent',
      category: item.category,
      fx: null,
      fy: null,
      depth,
      expanded: false,
      parentId: ring2ParentId,
    })
  }

  const newEdges: ConceptEdge[] = []

  for (const node of ring1Nodes) {
    newEdges.push({
      id: `${node.id}--${parentId}`,
      source: node.id,
      target: parentId,
      ring: 'ring1',
    })
  }

  for (const node of ring2Nodes) {
    const ring1Parent = ring1Nodes.find((n) => n.id === node.parentId)
    const targetId = ring1Parent?.id ?? parentId
    newEdges.push({
      id: `${node.id}--${targetId}`,
      source: node.id,
      target: targetId,
      ring: 'ring2',
    })
  }

  return {
    nodes: [...state.nodes, ...ring1Nodes, ...ring2Nodes],
    edges: [...state.edges, ...newEdges],
  }
}

export function recentreGraph(state: GraphState, nodeId: string): GraphState {
  const targetNode = state.nodes.find((n) => n.id === nodeId)
  if (!targetNode) return state

  const oldCore = state.nodes.find((n) => n.ring === 'core')

  // IDs of nodes directly connected to the new core via existing edges
  const connectedToNewCore = new Set<string>()
  for (const edge of state.edges) {
    const src = typeof edge.source === 'string' ? edge.source : (edge.source as ConceptNode).id
    const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as ConceptNode).id
    if (src === nodeId) connectedToNewCore.add(tgt)
    if (tgt === nodeId) connectedToNewCore.add(src)
  }

  const updatedNodes = state.nodes.map((node): ConceptNode => {
    if (node.id === nodeId) {
      return { ...node, ring: 'core', fx: 0, fy: 0 }
    }
    if (oldCore && node.id === oldCore.id) {
      return { ...node, ring: 'ring2', fx: null, fy: null }
    }
    if (node.ring === 'ring1') {
      return {
        ...node,
        ring: connectedToNewCore.has(node.id) ? 'ring2' : 'ring3',
      }
    }
    if (node.ring === 'ring2') {
      return { ...node, ring: 'ring3' }
    }
    return node
  })

  const { nodes: prunedNodes, edges: prunedEdges } = pruneGraph(
    updatedNodes,
    state.edges
  )

  return {
    ...state,
    nodes: prunedNodes,
    edges: prunedEdges,
    activeNodeId: null,
  }
}

export function pruneGraph(
  nodes: ConceptNode[],
  edges: ConceptEdge[]
): { nodes: ConceptNode[]; edges: ConceptEdge[] } {
  if (nodes.length <= 40) return { nodes, edges }

  const mustKeep = (n: ConceptNode) => n.ring === 'core' || n.ring === 'ring1'

  // Build candidate list sorted most-expendable first
  const ring3NoDef = nodes.filter((n) => n.ring === 'ring3' && !n.expanded && n.definition === undefined)
  const ring3WithDef = nodes.filter((n) => n.ring === 'ring3' && (n.expanded === true || n.definition !== undefined))
  // ring2 sorted by depth descending (furthest from new core pruned first)
  const ring2 = nodes
    .filter((n) => n.ring === 'ring2')
    .sort((a, b) => b.depth - a.depth)

  const candidates = [...ring3NoDef, ...ring3WithDef, ...ring2]

  let kept = nodes.filter(mustKeep)
  const toKeepExtra: ConceptNode[] = []

  for (const node of nodes) {
    if (mustKeep(node)) continue
    toKeepExtra.push(node)
  }

  // We have kept.length protected nodes; now add from non-protected until cap
  const prunedNodes: ConceptNode[] = [...kept]
  const removedIds = new Set<string>()

  // Add extras in order: ring2 and ring3 that are NOT in candidates (which are most expendable)
  // Actually, candidates are sorted from most to least expendable; we keep from the end
  const protectedIds = new Set(kept.map((n) => n.id))
  const candidateIds = new Set(candidates.map((n) => n.id))

  // Non-candidate, non-protected nodes (ring1 already protected, but ring2/ring3 not in candidates... actually all ring2/ring3 are in candidates)
  // Just iterate candidates in reverse (least expendable first) and add until cap
  const reversed = [...candidates].reverse()
  for (const node of reversed) {
    if (prunedNodes.length >= 40) {
      removedIds.add(node.id)
    } else {
      prunedNodes.push(node)
    }
  }

  const keepIds = new Set(prunedNodes.map((n) => n.id))
  const prunedEdges = edges.filter((e) => {
    const src = typeof e.source === 'string' ? e.source : (e.source as ConceptNode).id
    const tgt = typeof e.target === 'string' ? e.target : (e.target as ConceptNode).id
    return keepIds.has(src) && keepIds.has(tgt)
  })

  return { nodes: prunedNodes, edges: prunedEdges }
}

export function exportGraph(state: GraphState): string {
  const exportData = {
    seed: state.seedConcept,
    exportedAt: new Date().toISOString(),
    nodes: state.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      ring: n.ring,
      category: n.category,
      semanticDistance: n.semanticDistance,
      depth: n.depth,
      definition: n.definition ?? null,
    })),
    edges: state.edges.map((e) => {
      const src = typeof e.source === 'string' ? e.source : (e.source as ConceptNode).id
      const tgt = typeof e.target === 'string' ? e.target : (e.target as ConceptNode).id
      return { source: src, target: tgt, ring: e.ring }
    }),
  }
  return JSON.stringify(exportData, null, 2)
}
