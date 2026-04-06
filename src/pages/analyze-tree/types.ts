// ─── Node ────────────────────────────────────────────────────────────────────

/** Semantic category of a node in the decision tree */
export type NodeType = 'root' | 'test' | 'medium' | 'result'

/** Visual / interaction state of a node */
export type NodeStatus = 'idle' | 'active' | 'completed' | 'faded'

/** A single node in the SVG decision tree */
export interface TreeNode {
  id: string
  label: string
  sublabel?: string          // e.g. "99% Staphylococcus" under result nodes
  type: NodeType
  status: NodeStatus
  /** SVG coordinate space (unitless, not pixels) */
  x: number
  y: number
}

// ─── Edge ────────────────────────────────────────────────────────────────────

/** Animation state of a connecting edge */
export type EdgeStatus = 'idle' | 'animating' | 'completed' | 'faded'

/** A directed edge between two tree nodes */
export interface TreeEdge {
  id: string
  sourceId: string
  targetId: string
  /** Short condition label rendered beside the edge, e.g. "+ve" or "No bubbles" */
  label: string
  status: EdgeStatus
}

// ─── Step card ───────────────────────────────────────────────────────────────

/** A single selectable answer the user can pick in the floating card */
export interface StepOption {
  label: string
  description?: string
  /** Which edge this choice activates */
  edgeId: string
  /** Which node this choice leads to */
  targetNodeId: string
}

/** Floating card shown next to the active node */
export interface StepCard {
  /** The node this card belongs to */
  nodeId: string
  /** Main instruction shown at the top of the card */
  instruction: string
  /** Optional extra context / protocol note */
  hint?: string
  /** Choices the user selects from */
  options: StepOption[]
}

// ─── Camera / viewport ───────────────────────────────────────────────────────

/** SVG viewBox descriptor used for smooth pan-and-zoom */
export interface ViewBox {
  x: number
  y: number
  width: number
  height: number
}

// ─── Result ──────────────────────────────────────────────────────────────────

/** Metadata badge shown in the result popup */
export interface ResultBadge {
  label: string
  /** Tailwind bg colour class, e.g. "bg-bluenavy/10" */
  colour: string
}

/** Final bacteria identification shown in the result popup */
export interface BacteriaResult {
  bacteriaName: string
  /** 0–100 */
  confidence: number
  description: string
  badges: ResultBadge[]
  /** The leaf node id that produced this result */
  nodeId: string
}

// ─── Overall page phase ──────────────────────────────────────────────────────

/**
 * upload    → user is on the Upload component
 * analyzing → AI is deciding Gram stain (brief loading state)
 * tree      → interactive decision tree is visible
 * result    → final result popup is shown over the tree
 */
export type AnalysisPhase = 'upload' | 'analyzing' | 'tree' | 'result'

// ─── Composite tree state ────────────────────────────────────────────────────

/** Full runtime state of the decision tree */
export interface TreeState {
  nodes: TreeNode[]
  edges: TreeEdge[]
  /** Id of the node currently zoomed into */
  activeNodeId: string | null
  /** Ordered list of node ids on the chosen path so far */
  activePath: string[]
  /** Ordered list of edge ids that have been traversed */
  activeEdgePath: string[]
  viewBox: ViewBox
}
