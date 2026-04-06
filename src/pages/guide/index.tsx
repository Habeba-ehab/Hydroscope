import { useRef, useEffect } from 'react'
import { LuDownload } from 'react-icons/lu'
import GuideTree from './GuideTree'
import WaterSafetyInfo from './WaterSafetyInfo'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../analyze-tree/treeData'

export default function Guide() {
  const svgRef    = useRef<SVGSVGElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Center the tree horizontally on load — gram_stain is at x=50% of the canvas
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
    }
  }, [])

  // ── Download full tree as PNG ────────────────────────────────────────────
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

  return (
    // overflow-x-hidden prevents a page-level horizontal scrollbar
    <main className="overflow-x-hidden" style={{ animation: 'fadeInUp 0.4s ease both' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 md:px-10 pt-5 pb-4 border-b border-gray-100">
        <div>
          <p className="font-body text-lightnavy text-sm font-semibold tracking-widest uppercase mb-1">
            · Reference Guide ·
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy leading-tight">
            Bacterial Identification Tree
          </h1>
          <p className="font-body text-sm text-lightnavy mt-1">
            A complete flowchart of all identification steps and outcomes.
          </p>
        </div>

        {/* Download — always visible, pinned to the right of the header */}
        <button
          onClick={download}
          className="shrink-0 mt-2 flex items-center gap-2 bg-navy text-white rounded-full px-3 py-2 font-body font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <LuDownload className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Download</span>
        </button>
      </div>

      {/* Tree — no body padding anymore so goes naturally edge-to-edge */}
      <div ref={scrollRef} className="overflow-x-auto">
        <GuideTree ref={svgRef} />
      </div>

      {/* Water safety background info */}
      <WaterSafetyInfo />

    </main>
  )
}
