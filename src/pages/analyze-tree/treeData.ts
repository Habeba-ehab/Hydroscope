import type { TreeNode, TreeEdge, StepCard, BacteriaResult, ViewBox } from './types'

// ─── Canvas dimensions ────────────────────────────────────────────────────────

export const CANVAS_WIDTH  = 1600
export const CANVAS_HEIGHT = 1000

export const INITIAL_VIEWBOX: ViewBox = {
  x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
}

// ─── Nodes ────────────────────────────────────────────────────────────────────
//
//  Layout (SVG coordinate space):
//
//                        gram_stain (800, 70)
//                       /                    \
//            catalase (320,220)          oxidase (1180,220)
//           /              \             /                 \
//     staph(180,380) strep(460,380)  tcbs(1000,380)  macconkey(1380,380)
//                                   /       \          /             \
//                          vibrio(900,540) pseudo(1100,540) motility(1270,540) tsi(1490,540)
//                                                           /        \                \
//                                               klebsiella(1160,700) imvic(1380,700) salmonella(1490,700)
//                                                                     /         \
//                                                               ecoli(1300,860) enterobacter(1460,860)

export const INITIAL_NODES: TreeNode[] = [
  // ── Root ──────────────────────────────────────────────────────────────────
  {
    id: 'gram_stain',
    label: 'Gram Stain',
    type: 'root',
    status: 'idle',
    x: 800, y: 70,
  },

  // ── Level 1 ───────────────────────────────────────────────────────────────
  {
    id: 'catalase',
    label: 'Catalase Test',
    type: 'test',
    status: 'idle',
    x: 320, y: 220,
  },
  {
    id: 'oxidase',
    label: 'Oxidase Test',
    type: 'test',
    status: 'idle',
    x: 1180, y: 220,
  },

  // ── Level 2 — Gram +ve branch ─────────────────────────────────────────────
  {
    id: 'staph',
    label: 'Staphylococcus',
    sublabel: '~99% likely',
    type: 'result',
    status: 'idle',
    x: 180, y: 380,
  },
  {
    id: 'strep',
    label: 'Streptococcus',
    sublabel: 'or Enterococcus',
    type: 'result',
    status: 'idle',
    x: 460, y: 380,
  },

  // ── Level 2 — Gram −ve branch ─────────────────────────────────────────────
  {
    id: 'tcbs',
    label: 'TCBS Agar',
    type: 'medium',
    status: 'idle',
    x: 1000, y: 380,
  },
  {
    id: 'macconkey',
    label: 'MacConkey Agar',
    type: 'medium',
    status: 'idle',
    x: 1380, y: 380,
  },

  // ── Level 3 — TCBS branches ───────────────────────────────────────────────
  {
    id: 'vibrio',
    label: 'Vibrio spp.',
    type: 'result',
    status: 'idle',
    x: 860, y: 540,
  },
  {
    id: 'pseudomonas',
    label: 'Pseudomonas',
    sublabel: 'aeruginosa',
    type: 'result',
    status: 'idle',
    x: 1140, y: 540,
  },

  // ── Level 3 — MacConkey branches ──────────────────────────────────────────
  {
    id: 'motility',
    label: 'Motility Test',
    type: 'test',
    status: 'idle',
    x: 1270, y: 540,
  },
  {
    id: 'tsi',
    label: 'TSI Test',
    type: 'test',
    status: 'idle',
    x: 1490, y: 540,
  },

  // ── Level 4 — Motility branches ───────────────────────────────────────────
  {
    id: 'klebsiella',
    label: 'Klebsiella',
    sublabel: 'pneumoniae',
    type: 'result',
    status: 'idle',
    x: 1160, y: 700,
  },
  {
    id: 'imvic',
    label: 'IMViC Test',
    type: 'test',
    status: 'idle',
    x: 1380, y: 700,
  },

  // ── Level 4 — TSI result ──────────────────────────────────────────────────
  {
    id: 'salmonella',
    label: 'Salmonella spp.',
    type: 'result',
    status: 'idle',
    x: 1540, y: 700,
  },

  // ── Level 5 — IMViC branches ──────────────────────────────────────────────
  {
    id: 'ecoli',
    label: 'Escherichia coli',
    type: 'result',
    status: 'idle',
    x: 1300, y: 860,
  },
  {
    id: 'enterobacter',
    label: 'Enterobacter spp.',
    type: 'result',
    status: 'idle',
    x: 1460, y: 860,
  },
]

// ─── Edges ────────────────────────────────────────────────────────────────────

export const INITIAL_EDGES: TreeEdge[] = [
  // Root → Level 1
  { id: 'e_gram_catalase',      sourceId: 'gram_stain', targetId: 'catalase',     label: 'Gram +ve',           status: 'idle' },
  { id: 'e_gram_oxidase',       sourceId: 'gram_stain', targetId: 'oxidase',      label: 'Gram −ve',           status: 'idle' },

  // Catalase branches
  { id: 'e_catalase_staph',     sourceId: 'catalase',   targetId: 'staph',        label: '+ve (Bubbles)',      status: 'idle' },
  { id: 'e_catalase_strep',     sourceId: 'catalase',   targetId: 'strep',        label: '−ve (No bubbles)',   status: 'idle' },

  // Oxidase branches
  { id: 'e_oxidase_tcbs',       sourceId: 'oxidase',    targetId: 'tcbs',         label: '+ve (Purple)',                status: 'idle' },
  { id: 'e_oxidase_macconkey',  sourceId: 'oxidase',    targetId: 'macconkey',    label: '−ve (No colour)',                status: 'idle' },

  // TCBS branches
  { id: 'e_tcbs_vibrio',        sourceId: 'tcbs',       targetId: 'vibrio',       label: 'Yellow / Green colonies',    status: 'idle' },
  { id: 'e_tcbs_pseudomonas',   sourceId: 'tcbs',       targetId: 'pseudomonas',  label: 'No growth',          status: 'idle' },

  // MacConkey branches
  { id: 'e_macconkey_motility', sourceId: 'macconkey',  targetId: 'motility',     label: 'Pink',               status: 'idle' },
  { id: 'e_macconkey_tsi',      sourceId: 'macconkey',  targetId: 'tsi',          label: 'Colorless',          status: 'idle' },

  // Motility branches
  { id: 'e_motility_klebsiella',sourceId: 'motility',   targetId: 'klebsiella',   label: 'Non-motile',         status: 'idle' },
  { id: 'e_motility_imvic',     sourceId: 'motility',   targetId: 'imvic',        label: 'Motile',             status: 'idle' },

  // TSI result
  { id: 'e_tsi_salmonella',     sourceId: 'tsi',        targetId: 'salmonella',   label: 'H₂S +ve',           status: 'idle' },

  // IMViC branches
  { id: 'e_imvic_ecoli',        sourceId: 'imvic',      targetId: 'ecoli',        label: '+ + − −',           status: 'idle' },
  { id: 'e_imvic_enterobacter', sourceId: 'imvic',      targetId: 'enterobacter', label: '− − + +',           status: 'idle' },
]

// ─── Step cards ───────────────────────────────────────────────────────────────
//  gram_stain is intentionally absent — it is resolved by the AI, not the user.

export const STEP_CARDS: StepCard[] = [
  {
    nodeId: 'catalase',
    instruction: 'Perform Catalase Test',
    hint: 'Add a drop of 3% H₂O₂ directly onto the colony. Observe for immediate effervescence (bubbles).',
    options: [
      {
        label: 'Positive — Bubbles',
        description: 'Vigorous effervescence observed',
        edgeId: 'e_catalase_staph',
        targetNodeId: 'staph',
      },
      {
        label: 'Negative — No bubbles',
        description: 'No effervescence observed',
        edgeId: 'e_catalase_strep',
        targetNodeId: 'strep',
      },
    ],
  },

  {
    nodeId: 'oxidase',
    instruction: 'Perform Oxidase Test',
    hint: "Smear a colony onto oxidase test paper or add Kovacs' reagent. A blue-purple colour within 10 s is positive.",
    options: [
      {
        label: 'Positive — Blue / Purple',
        description: 'Colour change within 10 seconds',
        edgeId: 'e_oxidase_tcbs',
        targetNodeId: 'tcbs',
      },
      {
        label: 'Negative — No colour change',
        description: 'No visible colour change',
        edgeId: 'e_oxidase_macconkey',
        targetNodeId: 'macconkey',
      },
    ],
  },

  {
    nodeId: 'tcbs',
    instruction: 'Inoculate on TCBS Agar',
    hint: 'Streak onto TCBS agar and incubate at 37 °C for 18–24 h. Observe colony colour.',
    options: [
      {
        label: 'Yellow / Green colonies',
        description: 'Sucrose-fermenting yellow colonies',
        edgeId: 'e_tcbs_vibrio',
        targetNodeId: 'vibrio',
      },
      {
        label: 'No growth',
        description: 'Organism does not grow on TCBS',
        edgeId: 'e_tcbs_pseudomonas',
        targetNodeId: 'pseudomonas',
      },
    ],
  },

  {
    nodeId: 'macconkey',
    instruction: 'Grow on MacConkey Agar',
    hint: 'Streak onto MacConkey agar and incubate at 37 °C for 24 h. Observe colony colour.',
    options: [
      {
        label: 'Pink / Red colonies',
        description: 'Lactose-fermenting; bile precipitate turns colonies pink-red',
        edgeId: 'e_macconkey_motility',
        targetNodeId: 'motility',
      },
      {
        label: 'Colorless colonies',
        description: 'Non-lactose-fermenting; colonies remain pale',
        edgeId: 'e_macconkey_tsi',
        targetNodeId: 'tsi',
      },
    ],
  },

  {
    nodeId: 'motility',
    instruction: 'Perform Motility Test',
    hint: 'Stab-inoculate semi-solid motility agar or use hanging-drop method. Incubate at 37 °C for 24–48 h.',
    options: [
      {
        label: 'Non-motile',
        description: 'Growth confined strictly to the stab line',
        edgeId: 'e_motility_klebsiella',
        targetNodeId: 'klebsiella',
      },
      {
        label: 'Motile',
        description: 'Diffuse, spreading growth away from stab line',
        edgeId: 'e_motility_imvic',
        targetNodeId: 'imvic',
      },
    ],
  },

  {
    nodeId: 'tsi',
    instruction: 'Perform TSI Test',
    hint: 'Stab the butt and streak the slant of TSI agar. Incubate at 37 °C for 18–24 h. Look for H₂S (black precipitate).',
    options: [
      {
        label: 'H₂S positive',
        description: 'Alkaline slant / acid butt + black precipitate in the medium',
        edgeId: 'e_tsi_salmonella',
        targetNodeId: 'salmonella',
      },
    ],
  },

  {
    nodeId: 'imvic',
    instruction: 'Perform IMViC Test',
    hint: 'Run four tests: Indole (I), Methyl Red (M), Voges-Proskauer (V), Citrate (C).',
    options: [
      {
        label: '+ + − −',
        description: 'Indole +, Methyl Red +, VP −, Citrate −  (E. coli pattern)',
        edgeId: 'e_imvic_ecoli',
        targetNodeId: 'ecoli',
      },
      {
        label: '− − + +',
        description: 'Indole −, Methyl Red −, VP +, Citrate +  (Enterobacter pattern)',
        edgeId: 'e_imvic_enterobacter',
        targetNodeId: 'enterobacter',
      },
    ],
  },
]

// ─── Result data ──────────────────────────────────────────────────────────────

export const RESULT_MAP: Record<string, BacteriaResult> = {
  staph: {
    nodeId: 'staph',
    bacteriaName: 'Staphylococcus spp.',
    confidence: 95,
    description:
      'Gram-positive cocci arranged in clusters. Catalase positive. A common skin and mucous membrane commensal that can cause a range of infections from minor skin conditions to severe sepsis.',
    badges: [
      { label: 'Gram +ve',     colour: 'bg-purple-100 text-purple-700 border border-purple-200' },
      { label: 'Catalase +ve', colour: 'bg-green-100  text-green-700  border border-green-200'  },
      { label: 'Cocci',        colour: 'bg-bluenavy/10 text-bluenavy  border border-bluenavy/20' },
    ],
  },
  strep: {
    nodeId: 'strep',
    bacteriaName: 'Streptococcus / Enterococcus',
    confidence: 90,
    description:
      'Gram-positive cocci in chains or pairs. Catalase negative. Further differentiation requires bile-esculin, PYR, or serological typing to distinguish between Streptococcus and Enterococcus species.',
    badges: [
      { label: 'Gram +ve',     colour: 'bg-purple-100 text-purple-700 border border-purple-200' },
      { label: 'Catalase −ve', colour: 'bg-red-100    text-red-700    border border-red-200'    },
      { label: 'Cocci',        colour: 'bg-bluenavy/10 text-bluenavy  border border-bluenavy/20' },
    ],
  },
  vibrio: {
    nodeId: 'vibrio',
    bacteriaName: 'Vibrio cholerae',
    confidence: 92,
    description:
      'Gram-negative curved rods. Oxidase positive, grows well on TCBS agar producing yellow sucrose-fermenting colonies. Associated with seafood-borne gastroenteritis and wound infections.',
    badges: [
      { label: 'Gram −ve',    colour: 'bg-pink-100   text-pink-700   border border-pink-200'   },
      { label: 'Oxidase +ve', colour: 'bg-green-100  text-green-700  border border-green-200'  },
      { label: 'TCBS Yellow', colour: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
    ],
  },
  pseudomonas: {
    nodeId: 'pseudomonas',
    bacteriaName: 'Pseudomonas aeruginosa',
    confidence: 94,
    description:
      'Gram-negative non-fermenting rod. Oxidase positive, does not grow on TCBS. Produces blue-green pyocyanin pigment and has high intrinsic antibiotic resistance.',
    badges: [
      { label: 'Gram −ve',      colour: 'bg-pink-100 text-pink-700   border border-pink-200'   },
      { label: 'Oxidase +ve',   colour: 'bg-green-100 text-green-700 border border-green-200'  },
      { label: 'Blue-green pigment', colour: 'bg-teal-100 text-teal-700 border border-teal-200' },
    ],
  },
  klebsiella: {
    nodeId: 'klebsiella',
    bacteriaName: 'Klebsiella pneumoniae',
    confidence: 93,
    description:
      'Gram-negative encapsulated rod. Oxidase negative, lactose fermenter (pink on MacConkey), non-motile. Produces large mucoid colonies. An important cause of hospital-acquired pneumonia and UTIs.',
    badges: [
      { label: 'Gram −ve',   colour: 'bg-pink-100  text-pink-700  border border-pink-200'  },
      { label: 'Non-motile', colour: 'bg-gray-100  text-gray-700  border border-gray-200'  },
      { label: 'Mucoid',     colour: 'bg-amber-100 text-amber-700 border border-amber-200' },
    ],
  },
  ecoli: {
    nodeId: 'ecoli',
    bacteriaName: 'Escherichia coli',
    confidence: 96,
    description:
      'Gram-negative rod. The most common Gram-negative pathogen. IMViC pattern ++−− confirms E. coli. Part of normal gut flora but certain strains cause UTIs, diarrhoea, and sepsis.',
    badges: [
      { label: 'Gram −ve',  colour: 'bg-pink-100    text-pink-700   border border-pink-200'    },
      { label: 'IMViC ++−−',colour: 'bg-bluenavy/10 text-bluenavy   border border-bluenavy/20' },
      { label: 'Motile',    colour: 'bg-green-100   text-green-700  border border-green-200'   },
    ],
  },
  enterobacter: {
    nodeId: 'enterobacter',
    bacteriaName: 'Enterobacter',
    confidence: 91,
    description:
      'Gram-negative rod. Opportunistic environmental pathogen. IMViC pattern −−++ distinguishes it from E. coli. Often associated with hospital-acquired infections and has emerging carbapenem resistance.',
    badges: [
      { label: 'Gram −ve',  colour: 'bg-pink-100    text-pink-700   border border-pink-200'    },
      { label: 'IMViC −−++',colour: 'bg-bluenavy/10 text-bluenavy   border border-bluenavy/20' },
      { label: 'Motile',    colour: 'bg-green-100   text-green-700  border border-green-200'   },
    ],
  },
  salmonella: {
    nodeId: 'salmonella',
    bacteriaName: 'Salmonella',
    confidence: 94,
    description:
      'Gram-negative rod. Colorless on MacConkey (non-lactose fermenter). TSI shows alkaline slant / acid butt with H₂S black precipitate. A major cause of foodborne gastroenteritis and typhoid fever.',
    badges: [
      { label: 'Gram −ve',            colour: 'bg-pink-100  text-pink-700  border border-pink-200'  },
      { label: 'H₂S +ve',            colour: 'bg-amber-100 text-amber-700 border border-amber-200' },
      { label: 'Non-lactose ferm.',   colour: 'bg-gray-100  text-gray-700  border border-gray-200'  },
    ],
  },
}

// ─── Viewport helper ──────────────────────────────────────────────────────────

/**
 * Returns a ViewBox centred on a node for smooth zoom-in animation.
 * Defaults produce roughly 2× zoom on the full canvas.
 */
export function getViewBoxForNode(
  node: { x: number; y: number },
  zoomWidth  = 720,
  zoomHeight = 480,
): ViewBox {
  return {
    x: node.x - zoomWidth  / 2,
    y: node.y - zoomHeight / 2,
    width:  zoomWidth,
    height: zoomHeight,
  }
}

/** All result node ids — used to detect when the tree has reached a leaf */
export const RESULT_NODE_IDS = new Set(Object.keys(RESULT_MAP))
