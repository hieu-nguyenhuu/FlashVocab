import React, { useState, useEffect, useCallback } from 'react'
import {
  loadVocabulary, updateWord, isReviewToday, todayString
} from './lib/supabase'
import VocabTable      from './components/VocabTable'
import FlashCardSession from './components/FlashCardSession'
import EditVocabModal  from './components/EditVocabModal'
import ImportModal     from './components/ImportModal'
import TempFlashModal  from './components/TempFlashModal'
import { Spinner, Toast } from './components/UI'

const MAX_STUDY = 30

export default function App() {
  const [words,       setWords]       = useState([])
  const [checkStates, setCheckStates] = useState({})
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [toast,       setToast]       = useState(null)

  // modals / views
  const [view,       setView]       = useState('home')  // home | study
  const [showEdit,   setShowEdit]   = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showTemp,   setShowTemp]   = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── load data ──────────────────────────────────────────────────────────────
  async function fetchWords() {
    setLoading(true)
    try {
      const data = await loadVocabulary()
      setWords(data)
      setCheckStates(cs => {
        const next = {}
        data.forEach(w => {
          next[w.Id] = cs[w.Id] !== undefined
            ? cs[w.Id]
            : isReviewToday(w.NgayThem, w.ThanhThao)
        })
        return next
      })
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { fetchWords() }, [])

  // ── derived stats ──────────────────────────────────────────────────────────
  const todayCount  = words.filter(w => isReviewToday(w.NgayThem, w.ThanhThao)).length
  const selectedCount = Object.values(checkStates).filter(Boolean).length

  // ── checkbox handlers ──────────────────────────────────────────────────────
  function onCheckChange(id, val) {
    setCheckStates(cs => ({ ...cs, [id]: val }))
  }
  function selectToday() {
    setCheckStates(cs => {
      const next = { ...cs }
      words.forEach(w => { if (isReviewToday(w.NgayThem, w.ThanhThao)) next[w.Id] = true })
      return next
    })
  }
  function deselectAll() {
    setCheckStates(cs => Object.fromEntries(Object.keys(cs).map(k => [k, false])))
  }

  // ── study ──────────────────────────────────────────────────────────────────
  function startStudy() {
    const selected = words.filter(w => checkStates[w.Id])
    if (!selected.length) {
      setToast({ msg: 'Chưa chọn từ nào! Hãy tick checkbox vào ít nhất 1 từ.', type: 'info' })
      return
    }
    if (selected.length > MAX_STUDY) {
      setToast({ msg: `Quá ${MAX_STUDY} từ – chỉ lấy ${MAX_STUDY} từ đầu.`, type: 'info' })
    }
    setSidebarOpen(false)
    setView('study')
  }

  // ── apply results from flashcard session ───────────────────────────────────
  async function applyResults(results) {
    // results: [[id, 'remember'|'forget'], ...]
    const map = Object.fromEntries(results)
    const updates = []
    const nextWords = words.map(w => {
      if (!(w.Id in map)) return w
      if (map[w.Id] === 'remember') {
        const newTT = Math.min((w.ThanhThao || 0) + 1, 5)
        updates.push(updateWord(w.Id, { ThanhThao: newTT }))
        return { ...w, ThanhThao: newTT }
      } else {
        // push date forward by 1 day
        try {
          const [d,m,y] = w.NgayThem.split('/')
          const dt = new Date(+y, +m-1, +d)
          dt.setDate(dt.getDate() + 1)
          const newDate = dt.toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
          updates.push(updateWord(w.Id, { NgayThem: newDate }))
          return { ...w, NgayThem: newDate }
        } catch { return w }
      }
    })
    setWords(nextWords)
    // recalc check states
    setCheckStates(cs => {
      const next = {}
      nextWords.forEach(w => { next[w.Id] = isReviewToday(w.NgayThem, w.ThanhThao) })
      return next
    })
    try { await Promise.all(updates) }
    catch(e) { setToast({ msg: `Lỗi lưu một số từ: ${e.message}`, type: 'error' }) }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="surface-card p-8 max-w-md text-center flex flex-col gap-4">
          <div className="text-4xl">❌</div>
          <h2 className="text-white font-bold text-xl">Không thể kết nối Supabase</h2>
          <p className="text-accent2 text-sm font-mono bg-surface2 rounded-xl p-3">{error}</p>
          <p className="text-dim text-sm">Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file .env</p>
          <button onClick={fetchWords} className="btn-accent">Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* ── Top bar ── */}
      <header className="h-16 flex items-center px-4 sm:px-6 gap-4
                         bg-gradient-to-r from-surface to-surface2
                         border-b border-border shrink-0 z-20">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-dim hover:text-white transition-colors"
          onClick={() => setSidebarOpen(o => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <span className="text-white font-extrabold text-xl tracking-tight">⚡ FlashVocab</span>

        <div className="ml-auto flex items-center gap-3">
          {loading && <Spinner size={18} />}
          {!loading && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl
                             bg-today/10 text-today border border-today/30">
              📅 {todayCount} từ hôm nay
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Mobile overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden"
               onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed lg:relative top-0 left-0 h-full z-40 lg:z-auto
          w-60 shrink-0 bg-surface border-r border-border
          flex flex-col py-6 px-4 gap-3
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-16 lg:mt-0
        `}>
          <p className="text-dim text-[10px] font-bold uppercase tracking-widest px-1 mb-1">Chức năng</p>

          <SidebarBtn
            icon="🎯" label="Ôn tập hôm nay"
            color="accent"
            onClick={() => { startStudy(); setSidebarOpen(false) }}
          />
          <SidebarBtn
            icon="✏️" label="Chỉnh sửa"
            color="accent2"
            onClick={() => { setShowEdit(true); setSidebarOpen(false) }}
          />
          <SidebarBtn
            icon="📥" label="Nhập từ vựng"
            color="accent3"
            onClick={() => { setShowImport(true); setSidebarOpen(false) }}
          />
          <SidebarBtn
            icon="⚡" label="Thẻ tạm thời"
            color="today"
            onClick={() => { setShowTemp(true); setSidebarOpen(false) }}
          />

          <div className="mt-auto surface-card p-4 flex flex-col gap-1.5">
            <Stat label="Tổng"     value={`${words.length} từ`} />
            <Stat label="Hôm nay"  value={`${todayCount} từ`}   />
            <Stat label="Đã chọn"  value={`${selectedCount} từ`} />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col gap-4">
          {view === 'home' && (
            loading
              ? <div className="flex-1 flex items-center justify-center gap-3 text-dim">
                  <Spinner /> Đang tải dữ liệu...
                </div>
              : <VocabTable
                  words={words}
                  checkStates={checkStates}
                  onCheckChange={onCheckChange}
                  onSelectToday={selectToday}
                  onDeselectAll={deselectAll}
                />
          )}

          {view === 'study' && (
            <FlashCardSession
              words={words.filter(w => checkStates[w.Id]).slice(0, MAX_STUDY)}
              onDone={results => {
                applyResults(results)
                setView('home')
              }}
              onBack={() => setView('home')}
            />
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      <EditVocabModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        words={words}
        onSaved={fetchWords}
      />
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        existingWords={words}
        onImported={fetchWords}
      />
      <TempFlashModal
        open={showTemp}
        onClose={() => setShowTemp(false)}
      />

      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────
function SidebarBtn({ icon, label, color, onClick }) {
  const styles = {
    accent:  'bg-accent/10  text-accent  border-accent/25  hover:bg-accent/20  hover:border-accent/60',
    accent2: 'bg-accent2/10 text-accent2 border-accent2/25 hover:bg-accent2/20 hover:border-accent2/60',
    accent3: 'bg-accent3/10 text-accent3 border-accent3/25 hover:bg-accent3/20 hover:border-accent3/60',
    today:   'bg-today/10   text-today   border-today/25   hover:bg-today/20   hover:border-today/60',
  }
  return (
    <button
      onClick={onClick}
      className={`sidebar-btn border ${styles[color]} transition-all active:scale-95`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-dim">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
}
