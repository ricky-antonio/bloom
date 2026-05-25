import type { ConceptNode, ConceptEdge, NodeRing } from './types'

export function getLinkDistance(ring: NodeRing): number {
  return { core: 0, ring1: 160, ring2: 260, ring3: 340 }[ring]
}

export function getChargeStrength(ring: NodeRing): number {
  return { core: -600, ring1: -300, ring2: -150, ring3: -80 }[ring]
}

export function getCollisionRadius(ring: NodeRing): number {
  return { core: 52, ring1: 44, ring2: 32, ring3: 24 }[ring]
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
        .strength(0.4)
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
    .alphaDecay(0.02)
    .velocityDecay(0.4)
}
