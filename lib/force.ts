import type { ConceptNode, ConceptEdge, NodeRing, Category } from './types'

// Sector targets match ring1 link distance so cluster force and link force agree on position
const CLUSTER_X: Record<Category, number> = { awareness: -160, identity: 160, experiential: 0 }
const CLUSTER_Y: Record<Category, number> = { awareness: 0,    identity: 0,   experiential: 160 }

export function getLinkDistance(ring: NodeRing): number {
  return { core: 0, ring1: 160, ring2: 170, ring3: 260 }[ring]
}

export function getChargeStrength(ring: NodeRing): number {
  return { core: -500, ring1: -220, ring2: -100, ring3: -50 }[ring]
}

export function getCollisionRadius(ring: NodeRing): number {
  return { core: 50, ring1: 42, ring2: 32, ring3: 22 }[ring]
}

// d3 is injected by the caller via dynamic import — never imported at module level
export function createSimulation(d3: any, nodes: ConceptNode[], edges: ConceptEdge[]): any { // d3 internal
  return d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(edges)
        .id((d: any) => d.id) // d3 internal
        .distance((d: any) => getLinkDistance(d.ring)) // d3 internal
        .strength(0.7)
    )
    .force(
      'charge',
      d3.forceManyBody().strength((d: any) => getChargeStrength((d as ConceptNode).ring)) // d3 internal
    )
    // No forceCenter — the core node is fixed at (0,0) via fx/fy, so the graph won't drift
    .force(
      'collide',
      d3.forceCollide().radius((d: any) => getCollisionRadius((d as ConceptNode).ring)) // d3 internal
    )
    .force(
      'clusterX',
      d3.forceX((d: any) => CLUSTER_X[(d as ConceptNode).category] ?? 0) // d3 internal
        .strength((d: any) => { // d3 internal
          const ring = (d as ConceptNode).ring
          if (ring === 'ring1') return 0.5
          if (ring === 'ring2') return 0.08
          return 0
        })
    )
    .force(
      'clusterY',
      d3.forceY((d: any) => CLUSTER_Y[(d as ConceptNode).category] ?? 0) // d3 internal
        .strength((d: any) => { // d3 internal
          const ring = (d as ConceptNode).ring
          if (ring === 'ring1') return 0.5
          if (ring === 'ring2') return 0.08
          return 0
        })
    )
    .alphaDecay(0.03)
    .velocityDecay(0.45)
}
