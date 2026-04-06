import type { MutableRefObject } from 'react'
import { INITIAL_EDGES, INITIAL_NODES } from './treeData'
import type { TreeEdge, TreeNode, ViewBox } from './types'
import { NH, NW, edgeMidpoint, makeEdgePath } from './helpers'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  viewBox:        ViewBox
  nodes:          TreeNode[]
  edges:          TreeEdge[]
  dashOffsets:    Record<string, number>
  edgeLens:       MutableRefObject<Record<string, number>>
  registerEdgeEl: (id: string, el: SVGPathElement | null) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TreeSvg({ viewBox, nodes, edges, dashOffsets, edgeLens, registerEdgeEl }: Props) {
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
  const edgeById = Object.fromEntries(edges.map(e => [e.id, e]))

  return (
    <svg
      className="w-full h-full"
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
    >
      {/* ── Shared SVG filters ─────────────────────────────────────────── */}
      <defs>
        <filter id="dt-glow-navy" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#0F3052" floodOpacity="0.45"/>
        </filter>
        <filter id="dt-glow-blue" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#2e6da4" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* ── Edges ──────────────────────────────────────────────────────── */}
      {INITIAL_EDGES.map(ie => {
        const edge = edgeById[ie.id]
        const src  = INITIAL_NODES.find(n => n.id === ie.sourceId)!
        const tgt  = INITIAL_NODES.find(n => n.id === ie.targetId)!
        const d    = makeEdgePath(src, tgt)
        const mid  = edgeMidpoint(src, tgt)

        const isAnim   = edge.status === 'animating'
        const isDone   = edge.status === 'completed'
        const isFaded  = edge.status === 'faded'
        const isActive = isAnim || isDone

        const strokeColor = isActive ? '#2e6da4' : '#D1D5DB'
        const strokeWidth = isActive ? 2.5 : 1.5
        const gOpacity    = isFaded ? 0.1 : 1

        const len     = edgeLens.current[ie.id] ?? 99999
        const dOffset = dashOffsets[ie.id] ?? len
        const labelW  = Math.max(ie.label.length * 5.5 + 16, 56)

        return (
          <g key={ie.id} style={{ opacity: gOpacity, transition: 'opacity 0.45s' }}>
            {/* Static grey rail — always behind the animated stroke */}
            <path d={d} stroke="#E5E7EB" strokeWidth={1.5} fill="none"/>

            {/* Animated / coloured stroke */}
            <path
              ref={el => registerEdgeEl(ie.id, el)}
              d={d}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={isAnim ? len : undefined}
              strokeDashoffset={isAnim ? dOffset : undefined}
              filter={isDone ? 'url(#dt-glow-blue)' : undefined}
            />

            {/* Edge label — hidden while faded */}
            {!isFaded && (
              <g>
                <rect
                  x={mid.x - labelW / 2} y={mid.y - 9}
                  width={labelW} height={18} rx={5}
                  fill="#F0F8FF"
                />
                <text
                  x={mid.x} y={mid.y + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="DM Sans, sans-serif"
                  fill="#0F3052"
                >
                  {ie.label}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* ── Nodes ──────────────────────────────────────────────────────── */}
      {INITIAL_NODES.map(initN => {
        const n  = nodeById[initN.id]
        const w  = NW[n.type]
        const h  = NH[n.type]
        const rx = n.type === 'result' ? h / 2 : 9
        const x  = n.x - w / 2
        const y  = n.y - h / 2

        const isActive    = n.status === 'active'
        const isCompleted = n.status === 'completed'
        const isFaded     = n.status === 'faded'

        // Colour scheme — status overrides type default
        let fill = '#F9FAFB', stroke = '#D1D5DB', text = '#56748B'
        if (isCompleted) { fill = '#2e6da4'; stroke = '#2e6da4'; text = '#FFFFFF' }
        if (isActive)    { fill = '#0F3052'; stroke = '#0F3052'; text = '#FFFFFF' }
        if (isFaded)     { fill = '#F9FAFB'; stroke = '#E5E7EB'; text = '#D1D5DB' }

        const gOpacity = isFaded ? 0.12 : 1

        return (
          <g key={initN.id} style={{ opacity: gOpacity, transition: 'opacity 0.5s' }}>

            {/* Single fading pulse ring — active node only */}
            {isActive && (
              <rect
                x={x - 7} y={y - 7}
                width={w + 14} height={h + 14}
                rx={rx + 7}
                fill="none"
                stroke="#0F3052"
                strokeWidth={1.5}
                style={{ animation: 'svgPulse 2.2s ease-in-out infinite' }}
              />
            )}

            {/* Node body */}
            <rect
              x={x} y={y} width={w} height={h} rx={rx}
              fill={fill}
              stroke={stroke}
              strokeWidth={isActive || isCompleted ? 0 : 1.5}
              filter={isActive ? 'url(#dt-glow-navy)' : undefined}
              style={{ transition: 'fill 0.3s, stroke 0.3s' }}
            />

            {/* Primary label */}
            <text
              x={n.x} y={n.y - (initN.sublabel ? 7 : 0)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={n.type === 'root' ? 13 : 11}
              fontWeight={600}
              fontFamily="DM Sans, sans-serif"
              fill={text}
            >
              {n.label}
            </text>

            {/* Optional sub-label */}
            {initN.sublabel && (
              <text
                x={n.x} y={n.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontFamily="DM Sans, sans-serif"
                fill={text}
                opacity={0.75}
              >
                {initN.sublabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
