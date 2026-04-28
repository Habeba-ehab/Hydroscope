import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { INITIAL_EDGES, INITIAL_NODES } from './treeData'
import { NH, NW, makeEdgePath, edgeMidpoint } from './helpers'
import type { BacteriaResult, TreeEdge, TreeNode } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  result: BacteriaResult
  nodes:  TreeNode[]
  edges:  TreeEdge[]
  onBack: () => void
}

// ─── Mini tree snapshot ───────────────────────────────────────────────────────

function TreeSnapshot({ nodes, edges }: { nodes: TreeNode[]; edges: TreeEdge[] }) {
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
  const edgeById = Object.fromEntries(edges.map(e => [e.id, e]))

  // Compute bounding box of only the active/completed nodes so the path fills the view
  const pathNodes = nodes.filter(n => n.status === 'active' || n.status === 'completed')
  const pad = 60
  const minX = Math.min(...pathNodes.map(n => n.x - NW[n.type] / 2)) - pad
  const minY = Math.min(...pathNodes.map(n => n.y - NH[n.type] / 2)) - pad
  const maxX = Math.max(...pathNodes.map(n => n.x + NW[n.type] / 2)) + pad
  const maxY = Math.max(...pathNodes.map(n => n.y + NH[n.type] / 2)) + pad
  const vb   = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <svg
      className="w-full h-full"
      viewBox={vb}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {INITIAL_EDGES.map(ie => {
        const edge = edgeById[ie.id]
        const src  = INITIAL_NODES.find(n => n.id === ie.sourceId)!
        const tgt  = INITIAL_NODES.find(n => n.id === ie.targetId)!
        const d    = makeEdgePath(src, tgt)
        const mid  = edgeMidpoint(src, tgt)

        const isDone  = edge.status === 'completed'
        const isFaded = edge.status === 'faded'
        const stroke  = isDone ? '#2e6da4' : '#E5E7EB'
        const width   = isDone ? 3 : 1.5
        const opacity = isFaded ? 0.12 : 1
        const labelW  = Math.max(ie.label.length * 5.5 + 16, 56)

        return (
          <g key={ie.id} opacity={opacity}>
            <path d={d} stroke={stroke} strokeWidth={width} fill="none" strokeLinecap="round" />
            {!isFaded && (
              <g>
                <rect x={mid.x - labelW / 2} y={mid.y - 9} width={labelW} height={18} rx={5} fill="#F0F8FF" />
                <text x={mid.x} y={mid.y + 4} textAnchor="middle" fontSize={9} fontFamily="DM Sans, sans-serif" fill="#0F3052">
                  {ie.label}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Nodes */}
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

        let fill = '#F9FAFB', stroke = '#D1D5DB', textFill = '#56748B'
        if (isCompleted) { fill = '#2e6da4'; stroke = '#2e6da4'; textFill = '#FFFFFF' }
        if (isActive)    { fill = '#0F3052'; stroke = '#0F3052'; textFill = '#FFFFFF' }
        if (isFaded)     { fill = '#F9FAFB'; stroke = '#E5E7EB'; textFill = '#D1D5DB' }

        return (
          <g key={initN.id} opacity={isFaded ? 0.12 : 1}>
            <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <text
              x={n.x} y={n.y - (initN.sublabel ? 7 : 0)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={n.type === 'root' ? 13 : 11} fontWeight={600}
              fontFamily="DM Sans, sans-serif" fill={textFill}
            >
              {n.label}
            </text>
            {initN.sublabel && (
              <text
                x={n.x} y={n.y + 8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontFamily="DM Sans, sans-serif" fill={textFill} opacity={0.75}
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultPopup({ result, nodes, edges, onBack }: Props) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<'image' | 'tree' | null>(null)

  useEffect(() => {
    setUploadedImage(sessionStorage.getItem('analyzeImage'))
  }, [])

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm px-4"
      style={{ animation: 'fadeInUp 0.4s ease both' }}
    >
      {/* ── Lightbox — portalled to body so it escapes all stacking contexts ── */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 p-8 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {lightbox === 'image' && uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded sample"
              className="max-w-[80vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()} 
            />
          )}
          {lightbox === 'tree' && (
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-[50vw] max-h-[80vh] overflow-auto cursor-default"
              onClick={e => e.stopPropagation()}
            > 
              <TreeSnapshot nodes={nodes} edges={edges} /> 
            </div>
          )}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>,
        document.body
      )}

      <div className="bg-white rounded-3xl shadow-2xl p-5 max-w-2xl w-full">

        {/* ── Images row ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">

          {/* Uploaded microscope image */}
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-wide">
              Uploaded Sample
            </p>
            <div
              className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-4/3 flex items-center justify-center cursor-zoom-in group relative"
              onClick={() => uploadedImage && setLightbox('image')}
            >
              {uploadedImage
                ? <img src={uploadedImage} alt="Uploaded sample" className="w-full h-full object-cover" />
                : <span className="font-body text-xs text-gray-300">No image</span>
              }
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Tree path snapshot */}
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-wide">
              Identification Path
            </p>
            <div
              className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-4/3 flex items-center justify-center p-2 cursor-zoom-in group relative"
              onClick={() => setLightbox('tree')}
            >
              <TreeSnapshot nodes={nodes} edges={edges} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-navy opacity-0 group-hover:opacity-60 transition-opacity drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── Result info ── */}

        <h2 className="font-heading text-lg font-bold text-navy text-center mb-0.5">
          {result.bacteriaName}
        </h2>
        <p className="font-body text-xs text-lightnavy text-center mb-4">
          Identified via biochemical profile
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
          {result.badges.map(b => (
            <span key={b.label} className={`font-body text-xs px-3 py-1 rounded-full ${b.colour}`}>
              {b.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="font-body text-xs text-lightnavy leading-relaxed text-center mb-5">
          {result.description}
        </p>

        {/* CTA */}
        <div className="flex justify-center">
        <button
          onClick={onBack}
          className="bg-navy text-white rounded-full px-8 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Another Sample
        </button>
        </div>

      </div>
    </div>
  )
}
