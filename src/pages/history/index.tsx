import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, FlaskConical, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getHistory, deleteSession } from '../../api/history'
import type { HistorySession } from '../../api/history'

function formatDate(iso: string) {
  // Backend returns UTC without a timezone suffix — append Z so JS converts to local time
  const utc = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z'
  return new Date(utc).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}


// ─── Delete modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  session: HistorySession
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ session, deleting, onConfirm, onCancel }: DeleteModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>

        {/* Text */}
        <h3 className="font-heading text-lg font-bold text-navy text-center mb-1">
          Delete Session?
        </h3>
        <p className="font-body text-sm text-lightnavy text-center leading-relaxed mb-6">
          <span className="font-semibold text-navy">{session.final_bacteria_name}</span> from{' '}
          {formatDate(session.created_at)} will be permanently removed.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-navy rounded-2xl py-2.5 font-body text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white rounded-2xl py-2.5 font-body text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function History() {
  const navigate = useNavigate()
  const [sessions, setSessions]       = useState<HistorySession[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [confirmSession, setConfirmSession] = useState<HistorySession | null>(null)
  const [deletingId, setDeletingId]   = useState<number | null>(null)
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getHistory(page)
      .then(r => {
        setSessions(r.data.sessions)
        setTotalPages(r.data.total_pages)
      })
      .catch(err => { console.error('[History] error:', err); setError('Failed to load history. Please try again.') })
      .finally(() => setLoading(false))
  }, [page])

  const handleDelete = async () => {
    if (!confirmSession) return
    setDeletingId(confirmSession.id)
    try {
      await deleteSession(confirmSession.id)
      const remaining = sessions.filter(s => s.id !== confirmSession.id)
      if (remaining.length === 0 && page > 1) {
        setPage(p => p - 1)
      } else {
        setSessions(remaining)
      }
      toast.success('Session deleted')
      setConfirmSession(null)
    } catch {
      toast.error('Failed to delete session')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 flex flex-col min-h-screen"
      style={{ animation: 'fadeInUp 0.4s ease both' }}
    >
      {/* Delete modal */}
      <AnimatePresence>
        {confirmSession && (
          <DeleteModal
            session={confirmSession}
            deleting={deletingId === confirmSession.id}
            onConfirm={handleDelete}
            onCancel={() => setConfirmSession(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 md:px-10 pt-5 pb-4 border-b border-gray-100">
        <div>
          <p className="font-body text-lightnavy text-sm font-semibold tracking-widest uppercase mb-1">
            · Analysis History ·
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-navy leading-tight">
            Your Past Sessions
          </h1>
          <p className="font-body text-sm text-lightnavy mt-1">
            Review and revisit your previous bacterial identification results.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={`w-full px-4 md:px-10 py-6 flex-1 ${!loading && !error && totalPages > 1 ? 'pb-16' : ''}`}>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl overflow-hidden flex flex-row items-center sm:flex-col sm:items-stretch">
                <div className="m-2.5 w-14 h-14 shrink-0 rounded-xl bg-gray-200 sm:m-0 sm:w-full sm:h-auto sm:aspect-video sm:rounded-none" />
                <div className="py-2 pr-3 flex-1 flex flex-col gap-2 sm:p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="hidden sm:flex gap-1.5">
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="font-body text-sm text-lightnavy">{error}</p>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold text-navy">No sessions yet</p>
              <p className="font-body text-sm text-lightnavy mt-1">
                Complete an analysis and your results will appear here.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="mt-2 bg-navy text-white rounded-full px-6 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Start Analysis
            </button>
          </div>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => navigate(`/history/${s.id}`)}
                className="bg-[#1b4f72] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-row items-center sm:flex-col sm:items-stretch"
              >
                {/* Image — small square on mobile, full-width on sm+ */}
                <div className={`m-2.5 w-14 h-14 shrink-0 rounded-xl sm:m-0 sm:w-full sm:h-auto sm:aspect-video sm:rounded-none overflow-hidden ${s.sample_image_url ? 'bg-gray-100' : 'bg-white/10'} flex items-center justify-center`}>
                  {s.sample_image_url
                    ? <img src={s.sample_image_url} alt="Sample" className="w-full h-full object-cover" />
                    : <FlaskConical className="w-6 h-6 sm:w-8 sm:h-8 text-white/50" />
                  }
                </div>

                {/* Body */}
                <div className="py-2 pr-3 flex-1 flex flex-col gap-1 sm:px-3 sm:pt-2.5 sm:pb-2 sm:gap-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-heading text-base text-white leading-snug line-clamp-2 flex-1">
                      {s.final_bacteria_name}
                    </h3>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmSession(s) }}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/50 shrink-0" />
                    <span className="font-body text-xs text-white/50 truncate">
                      {formatDate(s.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const gramTag = s.biochemical_tags?.split(',').map(t => t.trim()).find(t => t.toLowerCase().replace(/−/g, '-').startsWith('gram'))
                      if (!gramTag) return null
                      const isPositive = gramTag.toLowerCase().includes('+')
                      return (
                        <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${isPositive ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-pink-100 text-pink-700 border border-pink-200'}`}>
                          {gramTag}
                        </span>
                      )
                    })()}
                    <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${
                      parseFloat(s.gram_confidence) > 90
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : parseFloat(s.gram_confidence) >= 60
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {s.gram_confidence} conf.
                    </span>
                    {s.overridden && (
                      <span className="font-body text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        Overridden
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination — fixed to bottom of viewport */}
      {!loading && !error && totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 py-3 bg-white/90 backdrop-blur border-t border-gray-100">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-body text-sm text-lightnavy">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
