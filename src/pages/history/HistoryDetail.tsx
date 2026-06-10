import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FlaskConical, AlertCircle, Microscope, ShieldCheck, Activity, Hash } from 'lucide-react'
import { getSession } from '../../api/history'
import type { HistorySession } from '../../api/history'

function formatDate(iso: string) {
  const utc = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z'
  return new Date(utc).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function tagColour(tag: string) {
  const t = tag.toLowerCase().replace(/−/g, '-').trim()
  if (t.startsWith('gram') && t.includes('+')) return 'bg-purple-100 text-purple-700 border border-purple-200'
  if (t.startsWith('gram'))                    return 'bg-pink-100 text-pink-700 border border-pink-200'
  if (t.includes('non-') || t.includes('negative')) return 'bg-gray-100 text-gray-700 border border-gray-200'
  if (t.includes('+ve') || t === 'motile')     return 'bg-green-100 text-green-700 border border-green-200'
  if (t.includes('-ve'))                       return 'bg-red-100 text-red-700 border border-red-200'
  if (t.includes('yellow'))                    return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  if (t.includes('pigment') || t.includes('teal')) return 'bg-teal-100 text-teal-700 border border-teal-200'
  if (t.includes('mucoid') || t.includes('h2s')) return 'bg-amber-100 text-amber-700 border border-amber-200'
  if (t.includes('cocci') || t.includes('imvic')) return 'bg-bluenavy/10 text-bluenavy border border-bluenavy/20'
  return 'bg-[#0F3052]/6 text-navy border border-[#0F3052]/12'
}

function confidenceMeta(val: string) {
  const n = Math.min(parseFloat(val), 100)
  if (n > 90)  return { label: 'High',   bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', bar: 'bg-green-400', pct: n }
  if (n >= 60) return { label: 'Medium', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-400', pct: n }
  return       { label: 'Low',    bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700',   bar: 'bg-red-400',   pct: n }
}

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<HistorySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<'sample' | 'path' | null>(null)

  useEffect(() => {
    if (!id) { navigate('/history'); return }
    getSession(Number(id))
      .then(r => setSession(r.data))
      .catch(() => navigate('/history'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-h-screen">
        <div className="flex flex-col gap-2 px-4 md:px-10 pt-5 pb-4 border-b border-gray-100 animate-pulse">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-56 bg-gray-200 rounded" />
          <div className="h-3 w-44 bg-gray-200 rounded" />
        </div>
        <div className="px-4 md:px-10 py-6 flex flex-col gap-5 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-gray-200 aspect-4/3" />
            <div className="rounded-2xl bg-gray-200 aspect-4/3" />
            <div className="rounded-2xl bg-gray-200 col-span-1 sm:col-span-2 lg:col-span-1 min-h-[200px]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl bg-gray-200 h-24" />)}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!session) return null

  const tags = session.biochemical_tags
    ? session.biochemical_tags.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const canViewTreatment = session.final_bacteria_id !== null
  const conf = confidenceMeta(session.gram_confidence)

  const isGramPositive = session.gram_result === 'gram_positive'
  const gramLabel  = isGramPositive ? 'Gram Positive'  : 'Gram Negative'
  const gramBg     = isGramPositive ? 'bg-violet-50'   : 'bg-cyan-50'
  const gramBorder = isGramPositive ? 'border-violet-200' : 'border-cyan-200'
  const gramText   = isGramPositive ? 'text-violet-700' : 'text-cyan-700'
  const gramBar    = isGramPositive ? 'bg-violet-400'  : 'bg-cyan-400'
  const gramBadge  = isGramPositive ? 'bg-violet-100 text-violet-700' : 'bg-cyan-100 text-cyan-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 flex flex-col min-h-screen"
    >
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          {lightbox === 'sample' && session.sample_image_url && (
            <img src={session.sample_image_url} alt="Sample"
              className="max-w-[80vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              onClick={e => e.stopPropagation()} />
          )}
          {lightbox === 'path' && session.path_image_url && (
            <img src={session.path_image_url} alt="Identification path"
              className="max-w-[80vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain bg-white p-4"
              onClick={e => e.stopPropagation()} />
          )}
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-4 md:px-10 pt-5 pb-4 border-b border-gray-100">
        <button onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-lightnavy hover:text-navy transition-colors font-body text-sm mb-3 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to History
        </button>
        <p className="font-body text-bluenavy text-sm font-semibold tracking-widest uppercase mb-1">· Session Detail ·</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy leading-tight">
            {session.final_bacteria_name}
          </h1>
          <span className="flex items-center gap-1 font-body text-xs text-lightnavy bg-navy/5 border border-navy/15 rounded-full px-2.5 py-1">
            <Hash className="w-3 h-3" />
            Session {session.id}
          </span>
        </div>
        <p className="font-body text-sm text-lightnavy mt-1">{formatDate(session.created_at)}</p>
      </div>

      {/* ── Body ── */}
      <div className="px-4 md:px-10 py-6 flex flex-col gap-5">

        {/* Images and Biochemical Profile Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Sample image */}
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-widest">Uploaded Sample</p>
            <div
              className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-4/3 flex items-center justify-center cursor-zoom-in group relative"
              onClick={() => session.sample_image_url && setLightbox('sample')}
            >
              {session.sample_image_url
                ? <>
                    <img src={session.sample_image_url} alt="Sample" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors rounded-2xl" />
                  </>
                : <div className="flex flex-col items-center gap-2 text-lightnavy/40">
                    <FlaskConical className="w-8 h-8" />
                    <span className="font-body text-xs">Not available yet</span>
                  </div>
              }
            </div>
          </div>

          {/* Path image */}
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-widest">Identification Path</p>
            <div
              className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-4/3 flex items-center justify-center cursor-zoom-in group relative"
              onClick={() => session.path_image_url && setLightbox('path')}
            >
              {session.path_image_url
                ? <>
                    <img src={session.path_image_url} alt="Identification path" className="w-full h-full object-contain p-3" />
                    <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors rounded-2xl" />
                  </>
                : <div className="flex flex-col items-center gap-2 text-lightnavy/40">
                    <AlertCircle className="w-8 h-8" />
                    <span className="font-body text-xs">Not available yet</span>
                  </div>
              }
            </div>
          </div>

          {/* Biochemical Profile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-1.5">
            <p className="font-body text-[10px] font-semibold text-lightnavy uppercase tracking-widest">Biochemical Profile</p>
            {tags.length > 0 ? (
              <div className="bg-white border border-navy/10 rounded-2xl p-4 flex-1 flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-navy/8 flex items-center justify-center shrink-0">
                      <FlaskConical className="w-3.5 h-3.5 text-navy" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-navy leading-tight">Markers</p>
                      <p className="font-body text-[11px] text-lightnavy/70">
                        {tags.length} biochemical marker{tags.length !== 1 ? 's' : ''} identified
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {tags.map(tag => (
                      <span key={tag} className={`font-body text-sm px-4 py-4 rounded-3xl text-center font-semibold ${tagColour(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-navy/10 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center text-lightnavy/40 min-h-[140px]">
                <FlaskConical className="w-8 h-8 mb-2" />
                <span className="font-body text-xs">No profile markers</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Gram Result */}
          <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${gramBg} ${gramBorder}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isGramPositive ? 'bg-violet-100' : 'bg-cyan-100'}`}>
                  <Microscope className={`w-3.5 h-3.5 ${gramText}`} />
                </div>
                <p className={`font-body text-[10px] font-semibold uppercase tracking-widest ${gramText} opacity-70`}>Gram Result</p>
              </div>
              <span className={`font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${gramBadge}`}>
                {isGramPositive ? '+' : '−'}
              </span>
            </div>
            <p className={`font-heading text-lg font-bold leading-tight ${gramText}`}>{gramLabel}</p>
            <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
              <motion.div className={`h-full rounded-full ${gramBar}`} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }} />
            </div>
          </div>

          {/* Confidence */}
          <div className={`rounded-2xl border p-4 flex flex-col gap-2 overflow-hidden ${conf.bg} ${conf.border}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${conf.badge.split(' ')[0]}`}>
                  <Activity className={`w-3.5 h-3.5 ${conf.text}`} />
                </div>
                <p className={`font-body text-[10px] font-semibold uppercase tracking-widest ${conf.text} opacity-70`}>Confidence</p>
              </div>
              <span className={`hidden sm:inline-flex font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${conf.badge}`}>{conf.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <p className={`font-heading text-lg font-bold ${conf.text}`}>{session.gram_confidence}</p>
              <span className={`sm:hidden font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${conf.badge}`}>{conf.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${conf.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${conf.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* AI Override */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-blue-700 opacity-70">AI Override</p>
            </div>
            <p className="font-heading text-lg font-bold text-blue-700">{session.overridden ? 'Yes' : 'No'}</p>
            <p className="font-body text-[10px] text-blue-700/60">{session.overridden ? 'Result manually changed' : 'Original AI result kept'}</p>
          </div>

          {/* Status */}
          <div className="rounded-2xl bg-navy/5 border border-navy/10 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-navy animate-pulse" />
              </div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-widest text-lightnavy">Status</p>
            </div>
            <p className="font-heading text-lg font-bold text-navy capitalize">{session.status}</p>
            <p className="font-body text-[10px] text-lightnavy/70">Analysis complete</p>
          </div>
        </div>

        {/* CTA */}
        {canViewTreatment && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => navigate(`/treatment?bacteria=${encodeURIComponent(session.final_bacteria_name)}`, { state: { activeNav: '/history' } })}
              className="px-6 py-3 sm:px-8 sm:py-3 bg-navy text-white rounded-full font-body text-xs sm:text-sm font-medium hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
            >
              View Treatment Plan
            </button>
          </div>
        )}

      </div>
    </motion.div>
  )
}
