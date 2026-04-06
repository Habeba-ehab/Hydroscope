import type { BacteriaResult } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  result: BacteriaResult
  onBack: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Full-screen overlay shown when the decision tree reaches a result node.
 * Displays the bacteria name, confidence bar, classification badges,
 * a short description, and a CTA to restart.
 */
export default function ResultPopup({ result, onBack }: Props) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm px-4"
      style={{ animation: 'fadeInUp 0.4s ease both' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 max-w-68 md:max-w-sm w-full">

        {/* Check icon */}
        <div className="w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-navy flex items-center justify-center mb-3 md:mb-5 mx-auto">
          <svg
            className="w-4 h-4 md:w-7 md:h-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>

        {/* Bacteria name */}
        <h2 className="font-heading text-base md:text-xl font-bold text-navy text-center mb-0.5">
          {result.bacteriaName}
        </h2>
        <p className="font-body text-[10px] md:text-xs text-lightnavy text-center mb-3 md:mb-5">
          Identified via biochemical profile
        </p>

        {/* Classification badges */}
        <div className="flex flex-wrap gap-1 md:gap-1.5 mb-2.5 md:mb-4 justify-center">
          {result.badges.map(b => (
            <span
              key={b.label}
              className={`font-body text-[10px] md:text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full ${b.colour}`}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="font-body text-[10px] md:text-xs text-lightnavy leading-relaxed text-center mb-3 md:mb-6">
          {result.description}
        </p>

        {/* CTA */}
        <button
          onClick={onBack}
          className="w-full bg-navy text-white rounded-full py-2 md:py-3 font-body text-xs md:text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          Try Another Sample
        </button>

      </div>
    </div>
  )
}
