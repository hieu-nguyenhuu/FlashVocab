import React from 'react'

// ── StarRating ────────────────────────────────────────────────────────────────
export function StarRating({ rating = 0, size = 14 }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= rating ? '#FFD166' : '#2E3250'}
            stroke={i <= rating ? '#FFD166' : '#2E3250'}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  )
}

// ── TodayBadge ────────────────────────────────────────────────────────────────
export function TodayBadge() {
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                     bg-today/10 text-today border border-today/40
                     tracking-wide whitespace-nowrap">
      ✓ HÔM NAY
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="#6C63FF" strokeWidth="3" fill="none" strokeDasharray="40" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  )
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, children, wide = false }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`bg-surface border border-border rounded-2xl w-full
                    ${wide ? 'max-w-5xl' : 'max-w-lg'}
                    max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  const colors = {
    success: 'bg-accent3/20 border-accent3/50 text-accent3',
    error:   'bg-accent2/20 border-accent2/50 text-accent2',
    info:    'bg-accent/20  border-accent/50  text-accent',
  }
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
                     px-5 py-3 rounded-xl border text-sm font-semibold
                     shadow-2xl animate-fade-in ${colors[type]}`}>
      {msg}
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, className = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className={`h-1 bg-border rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #6C63FF, #FF6584)',
        }}
      />
    </div>
  )
}
