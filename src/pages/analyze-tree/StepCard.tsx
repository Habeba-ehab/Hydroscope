import { useRef, useState } from 'react'
import type { StepCard as StepCardData } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  card:       StepCardData
  onPick:     (edgeId: string, targetNodeId: string) => void
  onBack?:    () => void
  canGoBack?: boolean
  compact?:   boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepCard({ card, onPick, onBack, canGoBack, compact }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview,   setPreview  ] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const isCatalase = card.nodeId === 'catalase'

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setAnalyzing(true)
    setTimeout(() => {
      const picked = card.options[Math.floor(Math.random() * card.options.length)]
      onPick(picked.edgeId, picked.targetNodeId)
    }, 2500)
  }

  if (compact) {
    return (
      <>
        {/* Back button */}
        {canGoBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 mb-2 font-body text-[10px] text-lightnavy hover:text-navy transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
        )}

        {/* Compact header — no icon, no label, just instruction */}
        <p className="font-body text-[11px] font-bold text-navy leading-tight mb-2">
          {card.instruction}
        </p>

        {/* Hint — very small, only if present */}
        {card.hint && (
          <p className="font-body text-[10px] text-navy/70 leading-snug bg-lightnavy/10 rounded-lg px-2 py-1.5 mb-2">
            {card.hint}
          </p>
        )}

        {/* Options */}
        <div className="flex flex-col gap-1">
          {card.options.map(opt => (
            <button
              key={opt.edgeId}
              onClick={() => onPick(opt.edgeId, opt.targetNodeId)}
              className="text-left bg-white rounded-lg px-2 py-1.5 hover:bg-navy/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <p className="font-body text-[10px] font-semibold text-navy leading-snug">
                {opt.label}
              </p>
            </button>
          ))}
        </div>

        {/* Upload — catalase only */}
        {isCatalase && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {preview && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-8 h-8 rounded-md overflow-hidden border border-navy/10 shrink-0">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                </div>
                {analyzing && (
                  <div className="flex items-center gap-0.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-navy"
                        style={{ animation: 'blink 1.2s ease infinite', animationDelay: `${i * 0.22}s` }} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 w-full flex items-center justify-center gap-1 border border-dashed border-navy/30 rounded-lg py-1.5 text-navy hover:border-navy/60 hover:bg-navy/5 transition-all cursor-pointer"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="font-body text-[10px] font-medium">
                {preview ? 'Change' : 'Upload image'}
              </span>
            </button>
          </>
        )}
      </>
    )
  }

  return (
    <>
      {/* Back button */}
      {canGoBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mb-3 font-body text-xs text-lightnavy hover:text-navy transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </button>
      )}

      {/* Instruction header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>
        <div>
          <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-wider mb-0.5">
            Lab Test
          </p>
          <p className="font-body text-sm font-bold text-navy leading-tight">
            {card.instruction}
          </p>
        </div>
      </div>

      {/* Optional protocol hint */}
      {card.hint && (
        <div className="bg-lightnavy/10 rounded-xl px-3.5 py-2.5 mb-3">
          <p className="font-body text-xs text-navy/80 leading-relaxed">
            {card.hint}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-lightnavy" />
        <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-wider">
          Your Observation
        </p>
        <div className="h-px flex-1 bg-lightnavy" />
      </div>

      {/* Observation options */}
      <div className="flex flex-col gap-2">
        {card.options.map(opt => (
          <button
            key={opt.edgeId}
            onClick={() => onPick(opt.edgeId, opt.targetNodeId)}
            className="text-left bg-white rounded-xl px-3.5 py-3 hover:bg-navy/20 active:scale-[0.98] transition-all duration-200 cursor-pointer group"
          >
            <p className="font-body text-xs font-semibold text-navy leading-snug">
              {opt.label}
            </p>
            {opt.description && (
              <p className="font-body text-xs text-lightnavy mt-0.5 leading-snug">
                {opt.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
