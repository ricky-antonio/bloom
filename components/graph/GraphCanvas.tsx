'use client'

import React, { useRef, useEffect, useImperativeHandle } from 'react'
import type * as D3 from 'd3'

export interface GraphCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

interface GraphCanvasProps {
  children: React.ReactNode
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
}

const GraphCanvas = React.forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas({ children, onZoomIn, onZoomOut, onResetZoom }, ref) {
    const svgRef = useRef<SVGSVGElement>(null)
    const gDomRef = useRef<SVGGElement>(null)
    const innerGroupRef = useRef<D3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
    const zoomBehaviourRef = useRef<D3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
    const d3Ref = useRef<typeof D3 | null>(null)

    useEffect(() => {
      let cancelled = false

      void import('d3').then(d3 => {
        if (cancelled) return
        const svgEl = svgRef.current
        const gEl = gDomRef.current
        if (!svgEl || !gEl) return

        d3Ref.current = d3
        innerGroupRef.current = d3.select(gEl)

        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.3, 2.5])
          .on('zoom', event => {
            innerGroupRef.current?.attr('transform', event.transform.toString())
          })

        zoomBehaviourRef.current = zoom
        d3.select(svgEl).call(zoom)

        // Centre and zoom so the graph fills the canvas comfortably at first load
        const { width, height } = svgEl.getBoundingClientRect()
        if (width > 0 && height > 0) {
          d3.select(svgEl).call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9)
          )
        }
      })

      return () => {
        cancelled = true
      }
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => {
          const svgEl = svgRef.current
          const zoom = zoomBehaviourRef.current
          const d3 = d3Ref.current
          if (!svgEl || !zoom || !d3) return
          // d3 internal: selection parent type differs from ZoomBehavior generic but is runtime-compatible
          zoom.scaleBy(d3.select(svgEl) as unknown as D3.Selection<SVGSVGElement, unknown, null, undefined>, 1.5)
          onZoomIn?.()
        },
        zoomOut: () => {
          const svgEl = svgRef.current
          const zoom = zoomBehaviourRef.current
          const d3 = d3Ref.current
          if (!svgEl || !zoom || !d3) return
          // d3 internal: selection parent type differs from ZoomBehavior generic but is runtime-compatible
          zoom.scaleBy(d3.select(svgEl) as unknown as D3.Selection<SVGSVGElement, unknown, null, undefined>, 1 / 1.5)
          onZoomOut?.()
        },
        resetZoom: () => {
          const svgEl = svgRef.current
          const zoom = zoomBehaviourRef.current
          const d3 = d3Ref.current
          if (!svgEl || !zoom || !d3) return
          d3.select(svgEl).call(sel => zoom.transform(
            // d3 internal: selection parent type differs from ZoomBehavior generic but is runtime-compatible
            sel as unknown as D3.Selection<SVGSVGElement, unknown, null, undefined>,
            d3.zoomIdentity
          ))
          onResetZoom?.()
        },
      }),
      [onZoomIn, onZoomOut, onResetZoom]
    )

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ background: 'transparent' }}
      >
        <g ref={gDomRef} style={{ pointerEvents: 'none' }}>
          {children}
        </g>
      </svg>
    )
  }
)

GraphCanvas.displayName = 'GraphCanvas'
export default GraphCanvas
