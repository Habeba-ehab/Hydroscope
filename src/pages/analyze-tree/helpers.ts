import { INITIAL_EDGES } from './treeData'
import type { TreeNode, ViewBox } from './types'

// ─── Visual constants ─────────────────────────────────────────────────────────

/** Node widths in SVG units, keyed by NodeType */
export const NW: Record<string, number> = { root: 132, test: 120, medium: 126, result: 110 }

/** Node heights in SVG units, keyed by NodeType */
export const NH: Record<string, number> = { root: 44, test: 40, medium: 40, result: 36 }

export const EDGE_ANIM_MS  = 880
export const GRAM_DELAY_MS = 2000

// ─── Graph traversal ──────────────────────────────────────────────────────────

/** BFS: all descendant node IDs reachable from startId */
export function getDescendants(startId: string): string[] {
  const visited = new Set<string>()
  const queue   = [startId]
  while (queue.length) {
    const id = queue.shift()!
    INITIAL_EDGES.filter(e => e.sourceId === id).forEach(e => {
      if (!visited.has(e.targetId)) { visited.add(e.targetId); queue.push(e.targetId) }
    })
  }
  return [...visited]
}

/** BFS: all descendant edge IDs reachable from startId */
export function getDescEdges(startId: string): string[] {
  const visited = new Set<string>()
  const queue   = [startId]
  while (queue.length) {
    const id = queue.shift()!
    INITIAL_EDGES.filter(e => e.sourceId === id).forEach(e => {
      visited.add(e.id); queue.push(e.targetId)
    })
  }
  return [...visited]
}

// ─── SVG geometry ─────────────────────────────────────────────────────────────

/** Cubic-bezier SVG path: exits the bottom of src, enters the top of tgt */
export function makeEdgePath(src: TreeNode, tgt: TreeNode): string {
  const x0 = src.x,  y0 = src.y + NH[src.type] / 2
  const x1 = tgt.x,  y1 = tgt.y - NH[tgt.type] / 2
  const ym  = (y0 + y1) / 2
  return `M ${x0} ${y0} C ${x0} ${ym}, ${x1} ${ym}, ${x1} ${y1}`
}

/** Visual midpoint of the bezier at t = 0.5 (simplifies to the arithmetic mean for this control-point layout) */
export function edgeMidpoint(src: TreeNode, tgt: TreeNode) {
  return {
    x: (src.x + tgt.x) / 2,
    y: (src.y + NH[src.type] / 2 + tgt.y - NH[tgt.type] / 2) / 2,
  }
}

// ─── Animation math ───────────────────────────────────────────────────────────

/** Linear interpolation between two ViewBox descriptors */
export function lerpViewBox(a: ViewBox, b: ViewBox, t: number): ViewBox {
  return {
    x:      a.x      + (b.x      - a.x)      * t,
    y:      a.y      + (b.y      - a.y)      * t,
    width:  a.width  + (b.width  - a.width)  * t,
    height: a.height + (b.height - a.height) * t,
  }
}
