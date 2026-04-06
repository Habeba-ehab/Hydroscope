import { forwardRef } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_EDGES, INITIAL_NODES } from '../analyze-tree/treeData'
import { NH, NW, edgeMidpoint, makeEdgePath } from '../analyze-tree/helpers'

// ─── Step labels shown ABOVE each test / medium / root node ───────────────────

const STEP_HINTS: Record<string, string> = {
  gram_stain: 'Step 1 · Gram stain',
  catalase:   'Step 2 · Catalase (H₂O₂)',
  oxidase:    'Step 2 · Oxidase test',
  tcbs:       'Step 3 · TCBS agar',
  macconkey:  'Step 3 · MacConkey agar',
  motility:   'Step 4 · Motility (SIM)',
  tsi:        'Step 4 · TSI agar',
  imvic:      'Step 5 · IMViC',
}

// ─── Component ────────────────────────────────────────────────────────────────
// Forwards the SVG ref so the parent (Guide.tsx) can drive the PNG download.

const GuideTree = forwardRef<SVGSVGElement>(function GuideTree(_, ref) {
  return (
    // min-width 1400px → bigger on mobile, fully visible on desktop
    <svg
      ref={ref}
      viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
      style={{ display: 'block', width: 'max(100%, 1400px)' }}
    >
      {/* ── Edges ────────────────────────────────────────────────────────── */}
      {INITIAL_EDGES.map(edge => {
        const src = INITIAL_NODES.find(n => n.id === edge.sourceId)!
        const tgt = INITIAL_NODES.find(n => n.id === edge.targetId)!
        const d   = makeEdgePath(src, tgt)
        const mid = edgeMidpoint(src, tgt)
        const lW  = Math.max(edge.label.length * 5.4 + 20, 60)
        return (
          <g key={edge.id}>
            <path d={d} stroke="#D1D5DB" strokeWidth={1.5} fill="none" />
            <path d={d} stroke="#2e6da4" strokeWidth={1.5} fill="none" opacity={0.35} />
            <rect x={mid.x - lW / 2} y={mid.y - 9.5} width={lW} height={19} rx={5} fill="#F0F8FF" stroke="#BFDBFE" strokeWidth={0.6} />
            <text x={mid.x} y={mid.y + 4.5} textAnchor="middle" fontSize={9} fontWeight={600} fontFamily="DM Sans, sans-serif" fill="#0F3052">
              {edge.label}
            </text>
          </g>
        )
      })}

      {/* ── Nodes ────────────────────────────────────────────────────────── */}
      {INITIAL_NODES.map(node => {
        const w        = NW[node.type]
        const h        = NH[node.type]
        const rx       = node.type === 'result' ? h / 2 : 10
        const x        = node.x - w / 2
        const y        = node.y - h / 2
        const hint     = STEP_HINTS[node.id]
        const sub      = node.sublabel
        const isResult = node.type === 'result'
        const isRoot   = node.type === 'root'

        const fill   = isResult ? '#F0F8FF' : (isRoot ? '#0F3052' : '#2e6da4')
        const stroke = isResult ? '#2e6da4' : 'none'
        const tFill  = isResult ? '#0F3052' : '#FFFFFF'
        const showSub = isResult && !!sub

        const hintCy = y - 18
        const hintW  = hint ? Math.max(hint.length * 5.6 + 20, 80) : 0

        return (
          <g key={node.id}>
            {hint && (
              <g>
                <rect
                  x={node.x - hintW / 2} y={hintCy - 8}
                  width={hintW} height={16} rx={5}
                  fill="#EFF6FF" stroke="#93C5FD" strokeWidth={0.8}
                />
                <text
                  x={node.x} y={hintCy + 0.5}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={9.5} fontFamily="DM Sans, sans-serif"
                  fill="#1D4ED8"
                >
                  {hint}
                </text>
              </g>
            )}

            <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={isResult ? 1.5 : 0} />

            <text
              x={node.x} y={node.y - (showSub ? 7 : 0)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isRoot ? 13 : 11} fontWeight={700}
              fontFamily="DM Sans, sans-serif" fill={tFill}
            >
              {node.label}
            </text>

            {showSub && (
              <text
                x={node.x} y={node.y + 8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8.5} fontFamily="DM Sans, sans-serif"
                fill={tFill} opacity={0.75}
              >
                {sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
})

export default GuideTree
