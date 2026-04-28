import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  INITIAL_EDGES,
  INITIAL_NODES,
  INITIAL_VIEWBOX,
  RESULT_MAP,
  RESULT_NODE_IDS,
  STEP_CARDS,
  getViewBoxForNode,
} from './treeData'
import type { BacteriaResult, TreeEdge, TreeNode, ViewBox } from './types'
import {
  EDGE_ANIM_MS,
  getDescEdges,
  getDescendants,
  lerpViewBox,
} from './helpers'
import TreeSvg      from './TreeSvg'
import FloatingCard from './FloatingCard'
import AiCard       from './AiCard'
import StepCard     from './StepCard'
import ResultPopup      from './ResultPopup'
import GramResultPopup, { type GramApiResult } from './GramResultPopup'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props { onBack: () => void }

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Top-level orchestrator for the interactive bacterial-identification tree.
 * Owns all state and animation logic; delegates rendering to sub-components.
 */
export default function DecisionTree({ onBack }: Props) {

  // DOM refs for SVG edge paths (needed to read path lengths for animation)
  const edgeEls  = useRef<Record<string, SVGPathElement | null>>({})
  const edgeLens = useRef<Record<string, number>>({})
  const edgeRafs = useRef<Record<string, number>>({})

  // ── Mobile detection ─────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const isMobileRef = useRef(isMobile)

  useEffect(() => {
    const handler = () => {
      const m = window.innerWidth < 768
      isMobileRef.current = m
      setIsMobile(m)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // ── Tree state ───────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<TreeNode[]>(INITIAL_NODES)
  const [edges, setEdges] = useState<TreeEdge[]>(INITIAL_EDGES)

  const [activeId,     setActiveId    ] = useState<string | null>(null)
  const activeIdRef    = useRef<string | null>(null)
  const activePathRef  = useRef<string[]>([])
  const activeEPathRef = useRef<string[]>([])

  // ── ViewBox lerp ─────────────────────────────────────────────────────────
  // On mobile skip the full-tree overview — start already zoomed to gram_stain
  const _gn     = INITIAL_NODES.find(n => n.id === 'gram_stain')!
  const _initVB: ViewBox = isMobileRef.current
    ? { x: _gn.x - 95, y: _gn.y - 142, width: 380, height: 285 }
    : INITIAL_VIEWBOX
  const [viewBox, setViewBox] = useState<ViewBox>(_initVB)
  const vbNow = useRef<ViewBox>(_initVB)
  const vbTgt = useRef<ViewBox>(_initVB)
  const vbRaf = useRef<number | null>(null)

  // ── Edge draw animation ──────────────────────────────────────────────────
  const [dashOffsets,     setDashOffsets    ] = useState<Record<string, number>>({})
  const [animatingEdgeId, setAnimatingEdgeId] = useState<string | null>(null)

  // ── UI phase ─────────────────────────────────────────────────────────────
  const [aiDeciding,    setAiDeciding   ] = useState(false)
  const [result,        setResult       ] = useState<BacteriaResult | null>(null)
  const [showResult,    setShowResult   ] = useState(false)
  const [invalidImage,  setInvalidImage ] = useState(false)
  const [historyDepth,  setHistoryDepth ] = useState(0)
  const [gramPopup,     setGramPopup    ] = useState<{ data: GramApiResult; positive: boolean } | null>(null)

  // ── ViewBox smooth pan ───────────────────────────────────────────────────
  const panTo = useCallback((target: ViewBox) => {
    vbTgt.current = target
    if (vbRaf.current !== null) return   // already running; target has been updated

    function tick() {
      const next = lerpViewBox(vbNow.current, vbTgt.current, 0.07)
      vbNow.current = next
      setViewBox({ ...next })
      const d = Math.abs(next.x      - vbTgt.current.x)
              + Math.abs(next.y      - vbTgt.current.y)
              + Math.abs(next.width  - vbTgt.current.width)
              + Math.abs(next.height - vbTgt.current.height)
      if (d > 0.4) {
        vbRaf.current = requestAnimationFrame(tick)
      } else {
        vbNow.current = { ...vbTgt.current }
        setViewBox({ ...vbTgt.current })
        vbRaf.current = null
      }
    }
    vbRaf.current = requestAnimationFrame(tick)
  }, [])

  // ── Activate a node ──────────────────────────────────────────────────────
  const activateNode = useCallback((nodeId: string, path: string[], ePath: string[]) => {
    activeIdRef.current    = nodeId
    activePathRef.current  = path
    activeEPathRef.current = ePath
    setActiveId(nodeId)

    const node = INITIAL_NODES.find(n => n.id === nodeId)!
    if (isMobileRef.current) {
      // Node at 25% from left so the card (50px gap + w-44) fits in the remaining 75%
      panTo({ x: node.x - 380 * 0.25, y: node.y - 285 * 0.5, width: 380, height: 285 })
    } else {
      panTo(getViewBoxForNode(node))
    }

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId)      return { ...n, status: 'active' }
      if (path.includes(n.id)) return { ...n, status: 'completed' }
      return n
    }))

    if (RESULT_NODE_IDS.has(nodeId)) {
      setResult(RESULT_MAP[nodeId])
      setTimeout(() => setShowResult(true), 700)
    }
  }, [panTo])

  // ── Edge traversal: draw the edge, then activate the target node ─────────
  const traverseEdge = useCallback((
    edgeId:   string,
    targetId: string,
    path:     string[],
    ePath:    string[],
  ) => {
    setAnimatingEdgeId(edgeId)
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, status: 'animating' } : e))

    requestAnimationFrame(() => {
      const el = edgeEls.current[edgeId]
      if (!el) {
        // Fallback if the ref isn't available yet
        setTimeout(() => { setAnimatingEdgeId(null); activateNode(targetId, path, ePath) }, EDGE_ANIM_MS)
        return
      }

      const len = el.getTotalLength()
      edgeLens.current[edgeId] = len
      setDashOffsets(prev => ({ ...prev, [edgeId]: len }))

      const t0 = performance.now()
      function tick(now: number) {
        const progress = Math.min((now - t0) / EDGE_ANIM_MS, 1)
        const eased    = 1 - Math.pow(1 - progress, 3)   // ease-out cubic
        setDashOffsets(prev => ({ ...prev, [edgeId]: len * (1 - eased) }))

        if (progress < 1) {
          edgeRafs.current[edgeId] = requestAnimationFrame(tick)
        } else {
          delete edgeRafs.current[edgeId]
          setDashOffsets(prev => ({ ...prev, [edgeId]: 0 }))
          setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, status: 'completed' } : e))
          setAnimatingEdgeId(null)
          activateNode(targetId, path, ePath)
        }
      }
      edgeRafs.current[edgeId] = requestAnimationFrame(tick)
    })
  }, [activateNode])

  // ── User picks a step option ─────────────────────────────────────────────
  const pickOption = useCallback((edgeId: string, targetNodeId: string) => {
    const curId = activeIdRef.current!
    const path  = [...activePathRef.current,  targetNodeId]
    const ePath = [...activeEPathRef.current, edgeId]

    // Fade sibling branches and all their descendants
    const fadedNodes = new Set<string>()
    const fadedEdges = new Set<string>()
    INITIAL_EDGES
      .filter(e => e.sourceId === curId && e.targetId !== targetNodeId)
      .forEach(e => {
        fadedEdges.add(e.id)
        fadedNodes.add(e.targetId)
        getDescendants(e.targetId).forEach(id => fadedNodes.add(id))
        getDescEdges(e.targetId).forEach(id => fadedEdges.add(id))
      })

    setNodes(prev => prev.map(n => {
      if (n.id === curId)        return { ...n, status: 'completed' }
      if (fadedNodes.has(n.id)) return { ...n, status: 'faded' }
      return n
    }))
    setEdges(prev => prev.map(e => {
      if (fadedEdges.has(e.id)) return { ...e, status: 'faded' }
      return e
    }))

    setHistoryDepth(d => d + 1)
    traverseEdge(edgeId, targetNodeId, path, ePath)
  }, [traverseEdge])

  // ── Go back one user step ────────────────────────────────────────────────
  const goBack = useCallback(() => {
    const path  = activePathRef.current
    const ePath = activeEPathRef.current
    if (path.length <= 2) return // nothing the user can undo (gram_stain was AI)

    const currentId  = path[path.length - 1]
    const previousId = path[path.length - 2]
    const lastEdgeId = ePath[ePath.length - 1]

    // Un-fade siblings that were faded when we made this choice
    const unfadeNodes = new Set<string>()
    const unfadeEdges = new Set<string>()
    INITIAL_EDGES
      .filter(e => e.sourceId === previousId && e.targetId !== currentId)
      .forEach(e => {
        unfadeEdges.add(e.id)
        unfadeNodes.add(e.targetId)
        getDescendants(e.targetId).forEach(id => unfadeNodes.add(id))
        getDescEdges(e.targetId).forEach(id => unfadeEdges.add(id))
      })

    const currentDesc      = getDescendants(currentId)
    const currentDescEdges = getDescEdges(currentId)

    activePathRef.current  = path.slice(0, -1)
    activeEPathRef.current = ePath.slice(0, -1)
    activeIdRef.current    = previousId
    setActiveId(previousId)
    setHistoryDepth(d => d - 1)

    setNodes(prev => prev.map(n => {
      if (n.id === previousId)                               return { ...n, status: 'active' }
      if (n.id === currentId || currentDesc.includes(n.id)) return { ...n, status: 'idle' }
      if (unfadeNodes.has(n.id))                            return { ...n, status: 'idle' }
      return n
    }))
    setEdges(prev => prev.map(e => {
      if (e.id === lastEdgeId)                              return { ...e, status: 'idle' }
      if (currentDescEdges.includes(e.id))                  return { ...e, status: 'idle' }
      if (unfadeEdges.has(e.id))                            return { ...e, status: 'idle' }
      return e
    }))
    setDashOffsets(prev => { const n = { ...prev }; delete n[lastEdgeId]; return n })

    const prevNode = INITIAL_NODES.find(n => n.id === previousId)!
    if (isMobileRef.current) {
      panTo({ x: prevNode.x - 380 * 0.25, y: prevNode.y - 285 * 0.5, width: 380, height: 285 })
    } else {
      panTo(getViewBoxForNode(prevNode))
    }
  }, [panTo])

  // ── Proceed after gram popup (continue or override) ─────────────────────
  const proceedWithGram = useCallback((positive: boolean) => {
    setGramPopup(null)
    const edgeId      = positive ? 'e_gram_catalase' : 'e_gram_oxidase'
    const targetId    = positive ? 'catalase'        : 'oxidase'
    const otherEdgeId = positive ? 'e_gram_oxidase'  : 'e_gram_catalase'
    const otherTarget = positive ? 'oxidase'         : 'catalase'
    const fadedD  = getDescendants(otherTarget)
    const fadedDE = getDescEdges(otherTarget)
    setNodes(prev => prev.map(n => {
      if (n.id === 'gram_stain')                          return { ...n, status: 'completed' }
      if (n.id === otherTarget || fadedD.includes(n.id)) return { ...n, status: 'faded' }
      return n
    }))
    setEdges(prev => prev.map(e => {
      if (e.id === otherEdgeId || fadedDE.includes(e.id)) return { ...e, status: 'faded' }
      return e
    }))
    traverseEdge(edgeId, targetId, ['gram_stain', targetId], [edgeId])
  }, [traverseEdge])

  // ── Freeze all animations the moment the result popup opens ─────────────
  useEffect(() => {
    if (!showResult) return
    if (vbRaf.current !== null) { cancelAnimationFrame(vbRaf.current); vbRaf.current = null }
    Object.values(edgeRafs.current).forEach(id => cancelAnimationFrame(id))
    edgeRafs.current = {}
  }, [showResult])

  // ── Stable refs so the mount effect doesn't go stale ────────────────────
  const traverseRef = useRef(traverseEdge)
  traverseRef.current = traverseEdge
  const panToRef = useRef(panTo)
  panToRef.current = panTo

  // ── Mount: show gram_stain → AI auto-decides ─────────────────────────────
  useEffect(() => {
    let alive = true
    const gramNode = INITIAL_NODES.find(n => n.id === 'gram_stain')!

    setNodes(prev => prev.map(n => n.id === 'gram_stain' ? { ...n, status: 'active' } : n))
    setActiveId('gram_stain')
    activeIdRef.current   = 'gram_stain'
    activePathRef.current = ['gram_stain']

    // On desktop: brief pause so the user sees the full tree, then zoom in.
    // On mobile: already zoomed in at mount, so no pan needed.
    const t1 = setTimeout(() => {
      if (!isMobileRef.current) {
        panToRef.current({ x: gramNode.x - 460, y: gramNode.y - 160, width: 920, height: 620 })
      }
    }, 350)

    // Show AI card only after the pan has settled (~1700 ms total)
    const t_ai = setTimeout(() => setAiDeciding(true), 1700)

    // Start API call immediately; also enforce a minimum wait of 3500 ms
    const apiCall = (async () => {
      try {
        const dataUrl = sessionStorage.getItem('analyzeImage')
        if (!dataUrl) return null
        const [header, b64] = dataUrl.split(',')
        const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
        const bytes = atob(b64)
        const arr = new Uint8Array(bytes.length)
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
        const blob = new Blob([arr], { type: mime })
        const form = new FormData()
        form.append('file', blob, 'image.jpg')
        const res = await axios.post(
          'https://kenzykhaled55-gram-api.hf.space/predict-gram',
          form,
        )
        const data = res.data as GramApiResult
        if (data.prediction !== 'gram_positive' && data.prediction !== 'gram_negative') return 'invalid'
        return { data, positive: data.prediction === 'gram_positive' }
      } catch {
        return null // fallback to random
      }
    })()

    const minWait = new Promise<void>(r => setTimeout(r, 3500))

    Promise.all([apiCall, minWait]).then(([apiResult]) => {
      if (!alive) return
      setAiDeciding(false)
      if (apiResult === 'invalid' || apiResult === null) {
        if (apiResult === 'invalid') { setInvalidImage(true); return }
        // fallback: no API data, go random without popup
        const positive    = Math.random() > 0.5
        const edgeId      = positive ? 'e_gram_catalase' : 'e_gram_oxidase'
        const targetId    = positive ? 'catalase'        : 'oxidase'
        const otherEdgeId = positive ? 'e_gram_oxidase'  : 'e_gram_catalase'
        const otherTarget = positive ? 'oxidase'         : 'catalase'
        const fadedD  = getDescendants(otherTarget)
        const fadedDE = getDescEdges(otherTarget)
        setNodes(prev => prev.map(n => {
          if (n.id === 'gram_stain')                          return { ...n, status: 'completed' }
          if (n.id === otherTarget || fadedD.includes(n.id)) return { ...n, status: 'faded' }
          return n
        }))
        setEdges(prev => prev.map(e => {
          if (e.id === otherEdgeId || fadedDE.includes(e.id)) return { ...e, status: 'faded' }
          return e
        }))
        traverseRef.current(edgeId, targetId, ['gram_stain', targetId], [edgeId])
        return
      }
      // Show the confirmation popup before proceeding
      setGramPopup(apiResult)
    })

    return () => {
      alive = false
      clearTimeout(t1)
      clearTimeout(t_ai)
      Object.values(edgeRafs.current).forEach(id => cancelAnimationFrame(id))
      if (vbRaf.current) cancelAnimationFrame(vbRaf.current)
    }
  }, []) // runs once on mount

  // ── Derived values ───────────────────────────────────────────────────────
  const activeNode = activeId ? INITIAL_NODES.find(n => n.id === activeId)! : null

  // Show the step card when: there's an active node, AI isn't deciding,
  // no edge is animating, and the active node is not a result leaf.
  const currentCard =
    activeId && !aiDeciding && !animatingEdgeId && !RESULT_NODE_IDS.has(activeId)
      ? STEP_CARDS.find(c => c.nodeId === activeId) ?? null
      : null

  // Card position as a fraction of the current viewport [0, 1]
  const cardRelX  = activeNode ? (activeNode.x - viewBox.x) / viewBox.width  : 0.5
  const cardRelY  = activeNode ? (activeNode.y - viewBox.y) / viewBox.height : 0.5
  // Camera always centres on the active node, so the card always goes to the right
  const cardRight = true

  const registerEdgeEl = (id: string, el: SVGPathElement | null) => {
    if (el) edgeEls.current[id] = el
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-white">

      {/* Back arrow */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-gray-200 rounded-full pl-3 pr-4 py-2 font-body text-sm font-medium text-navy shadow-sm hover:shadow-md hover:bg-navy/10 transition-all cursor-pointer"
        style={{ animation: 'fadeInLeft 0.4s ease both' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </button>

      {/* SVG tree */}
      <TreeSvg
        viewBox={viewBox}
        nodes={nodes}
        edges={edges}
        dashOffsets={dashOffsets}
        edgeLens={edgeLens}
        registerEdgeEl={registerEdgeEl}
      />

      {/* AI deciding card */}
      {aiDeciding && activeNode && (
        <FloatingCard relX={cardRelX} relY={cardRelY} toRight={cardRight} isMobile={isMobile}>
          <AiCard />
        </FloatingCard>
      )}

      {/* User step card */}
      {currentCard && activeNode && !showResult && (
        <FloatingCard relX={cardRelX} relY={cardRelY} toRight={cardRight} isMobile={isMobile} key={activeId}>
          <StepCard card={currentCard} onPick={pickOption} onBack={goBack} canGoBack={historyDepth > 0} compact={isMobile} />
        </FloatingCard>
      )}

      {/* Gram stain AI result popup */}
      {gramPopup && (
        <GramResultPopup
          data={gramPopup.data}
          onContinue={() => proceedWithGram(gramPopup.positive)}
          onDisagree={() => proceedWithGram(!gramPopup.positive)}
        />
      )}

      {/* Result overlay */}
      {showResult && result && (
        <ResultPopup result={result} nodes={nodes} edges={edges} onBack={() => { sessionStorage.removeItem('analyzeImage'); onBack() }} />
      )}

      {/* Invalid image overlay */}
      {invalidImage && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl px-8 py-10 max-w-sm w-full mx-4 text-center flex flex-col items-center gap-4">
            <div className="bg-red-50 rounded-2xl p-4">
              <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold text-navy">Not a Bacteria Image</h2>
            <p className="font-body text-sm text-lightnavy leading-relaxed">
              We couldn't detect a valid bacteria sample in your image. Please upload a clear microscope slide image and try again.
            </p>
            <button
              onClick={onBack}
              className="font-body text-sm font-medium text-white bg-navy rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
