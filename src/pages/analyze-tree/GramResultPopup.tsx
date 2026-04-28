import { LuSparkles, LuTriangleAlert } from 'react-icons/lu'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GramApiResult {
  prediction: 'gram_positive' | 'gram_negative'
  confidence: number
  all_probs: {
    gram_negative: number
    gram_positive: number
    not_gram_stain: number
  }
  is_confident: boolean
  warning: string | null
}

interface Props {
  data: GramApiResult
  onContinue: () => void
  onDisagree: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ProbBar({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`font-body text-xs w-28 shrink-0 ${highlight ? 'font-semibold text-navy' : 'text-lightnavy'}`}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${highlight ? 'bg-navy' : 'bg-gray-300'}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className={`font-body text-xs w-10 text-right shrink-0 ${highlight ? 'font-semibold text-navy' : 'text-lightnavy'}`}>
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GramResultPopup({ data, onContinue, onDisagree }: Props) {
  const isPositive = data.prediction === 'gram_positive'
  const predLabel  = isPositive ? 'Gram Positive' : 'Gram Negative'

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-[2px] px-4"
      style={{ animation: 'fadeInUp 0.35s ease both' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-2xl bg-navy/10 flex items-center justify-center shrink-0">
            <LuSparkles className="w-4 h-4 text-navy" />
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-navy">AI Gram Stain Result</p>
            <p className="font-body text-xs text-lightnavy">Review before continuing</p>
          </div>
        </div>

        {/* Prediction + confidence numbers */}
        <div className={`rounded-2xl px-4 py-3 mb-3 flex items-center justify-between ${isPositive ? 'bg-violet-50' : 'bg-cyan-50'}`}>
          <div>
            <p className="font-body text-[10px] text-lightnavy mb-0.5">Prediction</p>
            <p className={`font-heading text-lg font-bold ${isPositive ? 'text-violet-700' : 'text-cyan-700'}`}>
              {predLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] text-lightnavy mb-0.5">Confidence</p>
            <p className={`font-heading text-lg font-bold ${isPositive ? 'text-violet-700' : 'text-cyan-700'}`}>
              {data.confidence.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-violet-400' : 'bg-cyan-400'}`}
            style={{ width: `${Math.min(data.confidence, 100)}%` }}
          />
        </div>

        {/* Confident badge */}
        <div className="flex justify-end mb-4">
          <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${data.is_confident ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
            {data.is_confident ? 'High confidence' : 'Low confidence'}
          </span>
        </div>

        {/* Probability breakdown */}
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex flex-col gap-2.5 mb-5">
          <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-wide mb-0.5">
            All Probabilities
          </p>
          <ProbBar label="Gram Positive"  value={data.all_probs.gram_positive}  highlight={data.prediction === 'gram_positive'} />
          <ProbBar label="Gram Negative"  value={data.all_probs.gram_negative}  highlight={data.prediction === 'gram_negative'} />
          <ProbBar label="Not Gram Stain" value={data.all_probs.not_gram_stain} highlight={false} />
        </div>

        {/* Override warning note */}
        <div className="flex gap-2 bg-amber-50 rounded-2xl px-3 py-2.5 mb-5">
          <LuTriangleAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="font-body text-[11px] text-amber-700 leading-relaxed">
            Clicking <span className="font-semibold">I Disagree</span> will override the AI result and take the opposite identification path. Only do this if your direct microscopy observation contradicts the prediction.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="w-full bg-navy text-white rounded-xl py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Continue with AI Result
          </button>
          <button
            onClick={onDisagree}
            className="w-full border border-gray-200 text-navy rounded-xl py-2.5 font-body text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            I Disagree — Override Result
          </button>
        </div>

      </div>
    </div>
  )
}
