import { useRef } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, INITIAL_EDGES, INITIAL_NODES } from './treeData'
import { NH, NW, edgeMidpoint, makeEdgePath } from './helpers'

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

export default function GuideTree() {
  const svgRef = useRef<SVGSVGElement>(null)

  // ── Download full tree as PNG ──────────────────────────────────────────────
  function download() {
    const svg   = svgRef.current!
    const clone = svg.cloneNode(true) as SVGSVGElement
    const W = CANVAS_WIDTH * 2, H = CANVAS_HEIGHT * 2
    clone.setAttribute('viewBox', `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`)
    clone.setAttribute('width',  String(W))
    clone.setAttribute('height', String(H))
    const svgStr = new XMLSerializer().serializeToString(clone)
    const img    = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)
      ctx.drawImage(img, 0, 0)
      const a   = document.createElement('a')
      a.download = 'hydroscope-identification-guide.png'
      a.href     = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Download button row */}
      <div className="flex justify-end px-6 py-3">
        <button
          onClick={download}
          className="flex items-center gap-2 bg-navy text-white rounded-full pl-3 pr-4 py-2 font-body text-sm font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </button>
      </div>

      {/* Static tree — fills full page width, height is proportional */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        style={{ display: 'block', width: 'max(100%, 1100px)' }}
      >
        {/* ── Edges ──────────────────────────────────────────────────────── */}
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

        {/* ── Nodes ──────────────────────────────────────────────────────── */}
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

          // Step badge centre sits 18px above the node top edge
          const hintCy = y - 18
          const hintW  = hint ? Math.max(hint.length * 5.6 + 20, 80) : 0

          return (
            <g key={node.id}>

              {/* Step badge above the node */}
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

              {/* Node body */}
              <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={isResult ? 1.5 : 0} />

              {/* Primary label */}
              <text
                x={node.x} y={node.y - (showSub ? 7 : 0)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isRoot ? 13 : 11} fontWeight={700}
                fontFamily="DM Sans, sans-serif" fill={tFill}
              >
                {node.label}
              </text>

              {/* Sub-label (result nodes only) */}
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
    </div>
  )
}
