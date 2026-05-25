'use client'

import React, { createContext, useContext, useReducer } from 'react'
import type { GraphState, GraphAction, ConceptNode, ConceptEdge } from '../types'
import { createCoreNode, recentreGraph } from '../graph'

const initialState: GraphState = {
  nodes: [],
  edges: [],
  activeNodeId: null,
  seedConcept: '',
  isExpanding: false,
  expansionNodeId: null,
}

function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'EXPAND_CONCEPT': {
      if (state.nodes.length === 0) {
        const coreNode = createCoreNode(action.concept, action.depth)
        return {
          ...state,
          nodes: [coreNode],
          isExpanding: true,
          expansionNodeId: action.nodeId ?? coreNode.id,
          seedConcept: action.concept,
        }
      }
      return {
        ...state,
        isExpanding: true,
        expansionNodeId: action.nodeId ?? null,
        seedConcept: action.concept,
      }
    }

    case 'ADD_EXPANSION_NODES': {
      return {
        ...state,
        nodes: action.nodes,
        edges: action.edges,
        isExpanding: false,
        expansionNodeId: null,
      }
    }

    case 'SELECT_NODE': {
      return { ...state, activeNodeId: action.nodeId }
    }

    case 'SET_DEFINITION': {
      const nodes = state.nodes.map((node) =>
        node.id === action.nodeId
          ? { ...node, definition: action.definition, relatedTags: action.relatedTags }
          : node
      )
      return { ...state, nodes }
    }

    case 'RECENTRE': {
      return recentreGraph(state, action.nodeId)
    }

    case 'CLEAR_GRAPH': {
      return { ...initialState }
    }

    case 'SET_EXPANDING': {
      return {
        ...state,
        isExpanding: !!action.nodeId,
        expansionNodeId: action.nodeId,
      }
    }

    case 'ADD_TAG_NODE': {
      const parent = state.nodes.find((n) => n.id === action.parentNodeId)
      const newNode: ConceptNode = {
        id: action.label.toLowerCase().trim(),
        label: action.label,
        ring: 'ring1',
        semanticDistance: 'direct',
        category: 'awareness',
        depth: (parent?.depth ?? 0) + 1,
        parentId: action.parentNodeId,
        fx: null,
        fy: null,
        expanded: false,
      }
      const newEdge: ConceptEdge = {
        id: `${newNode.id}--${action.parentNodeId}`,
        source: newNode.id,
        target: action.parentNodeId,
        ring: 'ring1',
      }
      return {
        ...state,
        nodes: [...state.nodes, newNode],
        edges: [...state.edges, newEdge],
      }
    }

    default: {
      return state
    }
  }
}

interface GraphContextValue {
  state: GraphState
  dispatch: React.Dispatch<GraphAction>
}

export const GraphStateContext = createContext<GraphContextValue>({
  state: initialState,
  dispatch: () => undefined,
})

export function GraphProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(graphReducer, initialState)
  return (
    <GraphStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphStateContext.Provider>
  )
}

export function useGraphState(): GraphContextValue {
  return useContext(GraphStateContext)
}
