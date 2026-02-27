import { LuSparkles } from 'react-icons/lu'

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Content for the floating card shown while the AI is deciding the Gram stain.
 * Rendered inside <FloatingCard> by DecisionTree.
 */
export default function AiCard() {
  return (
    <>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
          <LuSparkles className="w-4 h-4 text-navy" />
        </div>
        <div>
          <p className="font-body text-xs font-semibold text-navy">AI Analysis</p>
          <p className="font-body text-xs text-lightnavy">Gram Stain</p>
        </div>
      </div>

      <p className="font-body text-xs text-navy leading-relaxed mb-3">
        Analyzing Gram stain morphology and cell wall structure from your microscope image…
      </p>

      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-navy"
            style={{ animation: 'blink 1.2s ease infinite', animationDelay: `${i * 0.22}s` }}
          />
        ))}
      </div>
    </>
  )
}
