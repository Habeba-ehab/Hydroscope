import type { ReactNode } from 'react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Node's horizontal position as a fraction of the SVG viewport [0, 1] */
  relX: number
  /** Node's vertical position as a fraction of the SVG viewport [0, 1] */
  relY: number
  /** Place the card to the right of the node when true, left when false */
  toRight: boolean
  /** Render as a bottom sheet instead of a side-pinned card */
  isMobile?: boolean
  children: ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A card pinned next to the currently active tree node.
 * On mobile it renders as a full-width bottom sheet; on desktop it floats
 * beside the active node, following the camera as it pans and zooms.
 */
export default function FloatingCard({ relX, relY, toRight, isMobile, children }: Props) {
  if (isMobile) {
    return (
      <div
        className="absolute z-20"
        style={{
          top:       `${relY * 100}%`,
          transform: 'translateY(-50%)',
          left:      `calc(${relX * 100}% + 50px)`,
        }}
      >
        <div
          className="bg-[#F0F8FF] rounded-xl shadow-xl p-2.5 w-40 max-h-[70vh] overflow-y-auto"
          style={{ animation: 'fadeInUp 0.3s ease both' }}
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className="absolute z-20"
      style={{
        top:       `${relY * 100}%`,
        transform: 'translateY(-50%)',
        ...(toRight
          ? { left:  `calc(${relX * 100}% + 116px)` }
          : { right: `calc(${(1 - relX) * 100}% + 116px)` }),
      }}
    >
      <div
        className="bg-[#F0F8FF] rounded-2xl shadow-xl p-5 w-72 max-h-[65vh] overflow-y-auto"
        style={{ animation: 'fadeInUp 0.3s ease both' }}
      >
        {children}
      </div>
    </div>
  )
}
