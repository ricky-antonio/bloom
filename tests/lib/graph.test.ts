import { describe, it, expect } from 'vitest'
import {
  createCoreNode,
  addExpansionNodes,
  recentreGraph,
  pruneGraph,
  exportGraph,
} from '../../lib/graph'
import type { ConceptNode, ConceptEdge, GraphState, ExpansionResponse } from '../../lib/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeEmptyState(overrides: Partial<GraphState> = {}): GraphState {
  return {
    nodes: [],
    edges: [],
    activeNodeId: null,
    seedConcept: 'test',
    isExpanding: false,
    expansionNodeId: null,
    ...overrides,
  }
}

const FULL_EXPANSION: ExpansionResponse = {
  ring1: [
    { label: 'alpha', category: 'awareness', reason: 'r' },
    { label: 'beta', category: 'identity', reason: 'r' },
    { label: 'gamma', category: 'experiential', reason: 'r' },
    { label: 'delta', category: 'awareness', reason: 'r' },
    { label: 'epsilon', category: 'identity', reason: 'r' },
    { label: 'zeta', category: 'experiential', reason: 'r' },
  ],
  ring2: [
    { label: 'alpha-a', parentLabel: 'alpha', category: 'awareness' },
    { label: 'alpha-b', parentLabel: 'alpha', category: 'awareness' },
    { label: 'beta-a', parentLabel: 'beta', category: 'identity' },
    { label: 'beta-b', parentLabel: 'beta', category: 'identity' },
    { label: 'gamma-a', parentLabel: 'gamma', category: 'experiential' },
    { label: 'gamma-b', parentLabel: 'gamma', category: 'experiential' },
    { label: 'delta-a', parentLabel: 'delta', category: 'awareness' },
    { label: 'delta-b', parentLabel: 'delta', category: 'awareness' },
    { label: 'epsilon-a', parentLabel: 'epsilon', category: 'identity' },
    { label: 'epsilon-b', parentLabel: 'epsilon', category: 'identity' },
    { label: 'zeta-a', parentLabel: 'zeta', category: 'experiential' },
    { label: 'zeta-b', parentLabel: 'zeta', category: 'experiential' },
  ],
}

function makeRecentreState(): GraphState {
  const core = createCoreNode('root', 0)
  // ring1 nodes: alpha is the future new core; beta and gamma are connected to it
  const ring1Nodes: ConceptNode[] = [
    { id: 'alpha', label: 'alpha', ring: 'ring1', semanticDistance: 'direct', category: 'awareness', fx: null, fy: null, depth: 1, expanded: false },
    { id: 'beta', label: 'beta', ring: 'ring1', semanticDistance: 'direct', category: 'identity', fx: null, fy: null, depth: 1, expanded: false },
    { id: 'gamma', label: 'gamma', ring: 'ring1', semanticDistance: 'direct', category: 'experiential', fx: null, fy: null, depth: 1, expanded: false },
    { id: 'delta', label: 'delta', ring: 'ring1', semanticDistance: 'direct', category: 'awareness', fx: null, fy: null, depth: 1, expanded: false },
    { id: 'epsilon', label: 'epsilon', ring: 'ring1', semanticDistance: 'direct', category: 'identity', fx: null, fy: null, depth: 1, expanded: false },
    { id: 'zeta', label: 'zeta', ring: 'ring1', semanticDistance: 'direct', category: 'experiential', fx: null, fy: null, depth: 1, expanded: false },
  ]
  // Edges: all ring1 nodes connect to root core
  const edges: ConceptEdge[] = ring1Nodes.map((n) => ({
    id: `${n.id}--root`,
    source: n.id,
    target: 'root',
    ring: 'ring1',
  }))
  // alpha also connects to beta and gamma (to test "connected to new core" logic via shared edges)
  edges.push({ id: 'beta--alpha', source: 'beta', target: 'alpha', ring: 'ring1' })
  edges.push({ id: 'gamma--alpha', source: 'gamma', target: 'alpha', ring: 'ring1' })

  return makeEmptyState({
    nodes: [core, ...ring1Nodes],
    edges,
    seedConcept: 'root',
  })
}

function makeOversizedState(): { nodes: ConceptNode[]; edges: ConceptEdge[] } {
  const core = createCoreNode('seed', 0)
  const ring1: ConceptNode[] = Array.from({ length: 6 }, (_, i) => ({
    id: `r1-${i}`,
    label: `r1-${i}`,
    ring: 'ring1',
    semanticDistance: 'direct',
    category: 'awareness',
    fx: null,
    fy: null,
    depth: 1,
    expanded: false,
  }))

  const ring3NoDef: ConceptNode[] = Array.from({ length: 20 }, (_, i) => ({
    id: `r3nd-${i}`,
    label: `r3nd-${i}`,
    ring: 'ring3',
    semanticDistance: 'distant',
    category: 'awareness',
    fx: null,
    fy: null,
    depth: 2,
    expanded: false,
  }))

  const ring3WithDef: ConceptNode[] = Array.from({ length: 5 }, (_, i) => ({
    id: `r3d-${i}`,
    label: `r3d-${i}`,
    ring: 'ring3',
    semanticDistance: 'distant',
    category: 'awareness',
    fx: null,
    fy: null,
    depth: 2,
    expanded: false,
    definition: 'some definition',
  }))

  const ring2: ConceptNode[] = Array.from({ length: 15 }, (_, i) => ({
    id: `r2-${i}`,
    label: `r2-${i}`,
    ring: 'ring2',
    semanticDistance: 'adjacent',
    category: 'awareness',
    fx: null,
    fy: null,
    depth: 2 + i, // varying depths so pruning is deterministic
    expanded: false,
  }))

  // Total: 1 + 6 + 20 + 5 + 15 = 47 nodes
  const nodes: ConceptNode[] = [core, ...ring1, ...ring3NoDef, ...ring3WithDef, ...ring2]

  const edges: ConceptEdge[] = [
    ...ring1.map((n) => ({ id: `${n.id}--seed`, source: n.id, target: 'seed', ring: 'ring1' as const })),
    ...ring3NoDef.map((n) => ({ id: `${n.id}--r1-0`, source: n.id, target: 'r1-0', ring: 'ring3' as const })),
    ...ring3WithDef.map((n) => ({ id: `${n.id}--r1-0`, source: n.id, target: 'r1-0', ring: 'ring3' as const })),
    ...ring2.map((n) => ({ id: `${n.id}--r1-0`, source: n.id, target: 'r1-0', ring: 'ring2' as const })),
  ]

  return { nodes, edges }
}

// ─── createCoreNode ───────────────────────────────────────────────────────────

describe('createCoreNode', () => {
  it('returns node with ring core and fx=0 fy=0', () => {
    const node = createCoreNode('Curiosity', 0)
    expect(node.ring).toBe('core')
    expect(node.fx).toBe(0)
    expect(node.fy).toBe(0)
    expect(node.semanticDistance).toBe('direct')
    expect(node.category).toBe('awareness')
    expect(node.expanded).toBe(false)
  })

  it('sets depth correctly', () => {
    expect(createCoreNode('foo', 0).depth).toBe(0)
    expect(createCoreNode('foo', 3).depth).toBe(3)
  })
})

// ─── addExpansionNodes ────────────────────────────────────────────────────────

describe('addExpansionNodes', () => {
  it('adds 6 ring1 and 12 ring2 nodes', () => {
    const core = createCoreNode('root', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'root' })
    const result = addExpansionNodes(state, FULL_EXPANSION, 'root', 1)
    const ring1Count = result.nodes.filter((n) => n.ring === 'ring1').length
    const ring2Count = result.nodes.filter((n) => n.ring === 'ring2').length
    expect(ring1Count).toBe(6)
    expect(ring2Count).toBe(12)
  })

  it('assigns correct semanticDistance to ring1 nodes', () => {
    const core = createCoreNode('root', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'root' })
    const result = addExpansionNodes(state, FULL_EXPANSION, 'root', 1)
    const ring1Nodes = result.nodes.filter((n) => n.ring === 'ring1')
    expect(ring1Nodes.every((n) => n.semanticDistance === 'direct')).toBe(true)
  })

  it('assigns correct semanticDistance to ring2 nodes', () => {
    const core = createCoreNode('root', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'root' })
    const result = addExpansionNodes(state, FULL_EXPANSION, 'root', 1)
    const ring2Nodes = result.nodes.filter((n) => n.ring === 'ring2')
    expect(ring2Nodes.every((n) => n.semanticDistance === 'adjacent')).toBe(true)
  })

  it('deduplicates nodes with same label as existing nodes', () => {
    const core = createCoreNode('root', 0)
    const existing: ConceptNode = {
      id: 'alpha',
      label: 'alpha',
      ring: 'ring1',
      semanticDistance: 'direct',
      category: 'awareness',
      fx: null,
      fy: null,
      depth: 1,
      expanded: false,
    }
    const state = makeEmptyState({ nodes: [core, existing], seedConcept: 'root' })
    const result = addExpansionNodes(state, FULL_EXPANSION, 'root', 1)
    const alphaNodes = result.nodes.filter((n) => n.id === 'alpha')
    expect(alphaNodes).toHaveLength(1)
    // Should have 5 new ring1 nodes (alpha was skipped) + 1 existing
    const ring1Count = result.nodes.filter((n) => n.ring === 'ring1').length
    expect(ring1Count).toBe(6) // 5 new + 1 existing
  })

  it('creates edges connecting ring1 to core and ring2 to ring1', () => {
    const core = createCoreNode('root', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'root' })
    const result = addExpansionNodes(state, FULL_EXPANSION, 'root', 1)

    const ring1Ids = new Set(result.nodes.filter((n) => n.ring === 'ring1').map((n) => n.id))
    const ring2Ids = new Set(result.nodes.filter((n) => n.ring === 'ring2').map((n) => n.id))

    for (const edge of result.edges) {
      const src = edge.source as string
      const tgt = edge.target as string
      if (ring1Ids.has(src)) {
        // ring1 → core
        expect(tgt).toBe('root')
      } else if (ring2Ids.has(src)) {
        // ring2 → ring1
        expect(ring1Ids.has(tgt)).toBe(true)
      }
    }
  })
})

// ─── recentreGraph ────────────────────────────────────────────────────────────

describe('recentreGraph', () => {
  it('promotes target node to core with fx=0 fy=0', () => {
    const state = makeRecentreState()
    const result = recentreGraph(state, 'alpha')
    const newCore = result.nodes.find((n) => n.id === 'alpha')
    expect(newCore?.ring).toBe('core')
    expect(newCore?.fx).toBe(0)
    expect(newCore?.fy).toBe(0)
  })

  it('demotes old core to ring2 and releases its fixed position', () => {
    const state = makeRecentreState()
    const result = recentreGraph(state, 'alpha')
    const oldCore = result.nodes.find((n) => n.id === 'root')
    expect(oldCore?.ring).toBe('ring2')
    expect(oldCore?.fx).toBeNull()
    expect(oldCore?.fy).toBeNull()
  })

  it('reclassifies connected old ring1 nodes as ring2', () => {
    const state = makeRecentreState()
    // beta and gamma have edges to alpha, so they should become ring2
    const result = recentreGraph(state, 'alpha')
    const beta = result.nodes.find((n) => n.id === 'beta')
    const gamma = result.nodes.find((n) => n.id === 'gamma')
    expect(beta?.ring).toBe('ring2')
    expect(gamma?.ring).toBe('ring2')
  })

  it('reclassifies disconnected old ring1 nodes as ring3', () => {
    const state = makeRecentreState()
    // delta, epsilon, zeta connect only to root (not to alpha), so they become ring3
    const result = recentreGraph(state, 'alpha')
    const delta = result.nodes.find((n) => n.id === 'delta')
    const epsilon = result.nodes.find((n) => n.id === 'epsilon')
    const zeta = result.nodes.find((n) => n.id === 'zeta')
    expect(delta?.ring).toBe('ring3')
    expect(epsilon?.ring).toBe('ring3')
    expect(zeta?.ring).toBe('ring3')
  })

  it('sets activeNodeId to null', () => {
    const state = { ...makeRecentreState(), activeNodeId: 'beta' }
    const result = recentreGraph(state, 'alpha')
    expect(result.activeNodeId).toBeNull()
  })

  it('recentreGraph where target node is ring2 promotes it to core', () => {
    const core = createCoreNode('root', 0)
    const ring1Node: ConceptNode = {
      id: 'mid',
      label: 'mid',
      ring: 'ring1',
      semanticDistance: 'direct',
      category: 'awareness',
      fx: null,
      fy: null,
      depth: 1,
      expanded: false,
    }
    const ring2Target: ConceptNode = {
      id: 'target',
      label: 'target',
      ring: 'ring2',
      semanticDistance: 'adjacent',
      category: 'identity',
      fx: null,
      fy: null,
      depth: 2,
      expanded: false,
    }
    const ring2Other: ConceptNode = {
      id: 'other',
      label: 'other',
      ring: 'ring2',
      semanticDistance: 'adjacent',
      category: 'experiential',
      fx: null,
      fy: null,
      depth: 2,
      expanded: false,
    }
    const edges: ConceptEdge[] = [
      { id: 'mid--root', source: 'mid', target: 'root', ring: 'ring1' },
      { id: 'target--mid', source: 'target', target: 'mid', ring: 'ring2' },
      { id: 'other--mid', source: 'other', target: 'mid', ring: 'ring2' },
    ]
    const state = makeEmptyState({
      nodes: [core, ring1Node, ring2Target, ring2Other],
      edges,
      seedConcept: 'root',
    })
    const result = recentreGraph(state, 'target')
    const newCore = result.nodes.find((n) => n.id === 'target')
    expect(newCore?.ring).toBe('core')
    expect(newCore?.fx).toBe(0)
    expect(newCore?.fy).toBe(0)
    // ring2 nodes that are not the new core should become ring3
    const otherNode = result.nodes.find((n) => n.id === 'other')
    expect(otherNode?.ring).toBe('ring3')
  })
})

// ─── pruneGraph ───────────────────────────────────────────────────────────────

describe('pruneGraph', () => {
  it('never returns more than 40 nodes', () => {
    const { nodes, edges } = makeOversizedState()
    expect(nodes.length).toBeGreaterThan(40)
    const result = pruneGraph(nodes, edges)
    expect(result.nodes.length).toBeLessThanOrEqual(40)
  })

  it('never prunes core nodes', () => {
    const { nodes, edges } = makeOversizedState()
    const result = pruneGraph(nodes, edges)
    const coreNodes = result.nodes.filter((n) => n.ring === 'core')
    expect(coreNodes).toHaveLength(1)
    expect(coreNodes[0].id).toBe('seed')
  })

  it('never prunes ring1 nodes', () => {
    const { nodes, edges } = makeOversizedState()
    const result = pruneGraph(nodes, edges)
    const ring1Nodes = result.nodes.filter((n) => n.ring === 'ring1')
    expect(ring1Nodes).toHaveLength(6)
  })

  it('prunes ring3 nodes without definition before those with definition', () => {
    const { nodes, edges } = makeOversizedState()
    // 47 nodes total; need to prune 7
    // ring3NoDef (20) are most expendable, ring3WithDef (5) are next
    // After pruning 7 from ring3NoDef, ring3WithDef should all remain
    const result = pruneGraph(nodes, edges)
    const ring3WithDef = result.nodes.filter((n) => n.ring === 'ring3' && n.definition !== undefined)
    // All 5 ring3 with definition should survive
    expect(ring3WithDef).toHaveLength(5)
  })

  it('removes orphaned edges after node pruning', () => {
    const { nodes, edges } = makeOversizedState()
    const result = pruneGraph(nodes, edges)
    const remainingIds = new Set(result.nodes.map((n) => n.id))
    for (const edge of result.edges) {
      const src = typeof edge.source === 'string' ? edge.source : (edge.source as ConceptNode).id
      const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as ConceptNode).id
      expect(remainingIds.has(src)).toBe(true)
      expect(remainingIds.has(tgt)).toBe(true)
    }
  })

  it('pruneGraph with exactly 40 nodes does not prune any node', () => {
    const core = createCoreNode('seed', 0)
    const ring1: ConceptNode[] = Array.from({ length: 6 }, (_, i) => ({
      id: `r1-${i}`,
      label: `r1-${i}`,
      ring: 'ring1' as const,
      semanticDistance: 'direct' as const,
      category: 'awareness' as const,
      fx: null,
      fy: null,
      depth: 1,
      expanded: false,
    }))
    const ring2: ConceptNode[] = Array.from({ length: 33 }, (_, i) => ({
      id: `r2-${i}`,
      label: `r2-${i}`,
      ring: 'ring2' as const,
      semanticDistance: 'adjacent' as const,
      category: 'awareness' as const,
      fx: null,
      fy: null,
      depth: 2,
      expanded: false,
    }))
    const nodes: ConceptNode[] = [core, ...ring1, ...ring2]
    expect(nodes.length).toBe(40)
    const result = pruneGraph(nodes, [])
    expect(result.nodes).toHaveLength(40)
  })

  it('pruneGraph with 41 nodes prunes exactly one node', () => {
    const core = createCoreNode('seed', 0)
    const ring1: ConceptNode[] = Array.from({ length: 6 }, (_, i) => ({
      id: `r1-${i}`,
      label: `r1-${i}`,
      ring: 'ring1' as const,
      semanticDistance: 'direct' as const,
      category: 'awareness' as const,
      fx: null,
      fy: null,
      depth: 1,
      expanded: false,
    }))
    const ring2: ConceptNode[] = Array.from({ length: 33 }, (_, i) => ({
      id: `r2-${i}`,
      label: `r2-${i}`,
      ring: 'ring2' as const,
      semanticDistance: 'adjacent' as const,
      category: 'awareness' as const,
      fx: null,
      fy: null,
      depth: 2,
      expanded: false,
    }))
    const ring3Extra: ConceptNode = {
      id: 'r3-extra',
      label: 'r3-extra',
      ring: 'ring3',
      semanticDistance: 'distant',
      category: 'awareness',
      fx: null,
      fy: null,
      depth: 3,
      expanded: false,
    }
    const nodes: ConceptNode[] = [core, ...ring1, ...ring2, ring3Extra]
    expect(nodes.length).toBe(41)
    const result = pruneGraph(nodes, [])
    expect(result.nodes).toHaveLength(40)
  })
})

// ─── exportGraph ─────────────────────────────────────────────────────────────

describe('exportGraph', () => {
  it('returns valid JSON', () => {
    const core = createCoreNode('curiosity', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'curiosity' })
    const result = exportGraph(state)
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('includes seed and exportedAt fields', () => {
    const core = createCoreNode('curiosity', 0)
    const state = makeEmptyState({ nodes: [core], seedConcept: 'curiosity' })
    const parsed = JSON.parse(exportGraph(state))
    expect(parsed.seed).toBe('curiosity')
    expect(typeof parsed.exportedAt).toBe('string')
    expect(() => new Date(parsed.exportedAt)).not.toThrow()
  })

  it('safely extracts edge source and target as strings when D3 resolves them to objects', () => {
    const core = createCoreNode('foo', 0)
    const node: ConceptNode = {
      id: 'bar',
      label: 'bar',
      ring: 'ring1',
      semanticDistance: 'direct',
      category: 'awareness',
      fx: null,
      fy: null,
      depth: 1,
      expanded: false,
    }
    // Simulate D3 resolving source/target to node objects
    const edge: ConceptEdge = {
      id: 'bar--foo',
      source: { id: 'bar' } as unknown as string,
      target: { id: 'foo' } as unknown as string,
      ring: 'ring1',
    }
    const state = makeEmptyState({ nodes: [core, node], edges: [edge], seedConcept: 'foo' })
    const parsed = JSON.parse(exportGraph(state))
    expect(parsed.edges[0].source).toBe('bar')
    expect(parsed.edges[0].target).toBe('foo')
  })
})
