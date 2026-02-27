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
import ResultPopup  from './ResultPopup'

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
  const [aiDeciding, setAiDeciding] = useState(false)
  const [result,     setResult    ] = useState<BacteriaResult | null>(null)
  const [showResult, setShowResult] = useState(false)

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

    traverseEdge(edgeId, targetNodeId, path, ePath)
  }, [traverseEdge])

  // ── Stable refs so the mount effect doesn't go stale ────────────────────
  const traverseRef = useRef(traverseEdge)
  traverseRef.current = traverseEdge
  const panToRef = useRef(panTo)
  panToRef.current = panTo

  // ── Mount: show gram_stain → AI auto-decides ─────────────────────────────
  useEffect(() => {
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

    // AI decides gram stain result (delay long enough for card to be visible)
    const t2 = setTimeout(() => {
      setAiDeciding(false)
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
    }, 3500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t_ai)
      clearTimeout(t2)
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
          <StepCard card={currentCard} onPick={pickOption} compact={isMobile} />
        </FloatingCard>
      )}

      {/* Result overlay */}
      {showResult && result && (
        <ResultPopup result={result} onBack={onBack} />
      )}
    </div>
  )
}
