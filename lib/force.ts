import type { ConceptNode, ConceptEdge, NodeRing } from './types'

export function getLinkDistance(ring: NodeRing): number {
  return { core: 0, ring1: 110, ring2: 190, ring3: 270 }[ring]
}

export function getChargeStrength(ring: NodeRing): number {
  return { core: -400, ring1: -200, ring2: -120, ring3: -80 }[ring]
}

export function getCollisionRadius(ring: NodeRing): number {
  return { core: 52, ring1: 40, ring2: 30, ring3: 24 }[ring]
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
    .force('center', d3.forceCenter(0, 0))
    .force(
      'collide',
      d3.forceCollide().radius((d: any) => getCollisionRadius((d as ConceptNode).ring)) // d3 internal
    )
    .alphaDecay(0.02)
    .velocityDecay(0.4)
}
