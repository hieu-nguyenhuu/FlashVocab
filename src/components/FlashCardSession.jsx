import React, { useState, useEffect, useCallback, useRef } from 'react'
import FlashCard from './FlashCard'
import { ProgressBar } from './UI'
import DeepPractice from './DeepPractice'

const MAX_STUDY = 30

export default function FlashCardSession({ words: rawWords, tempMode = false, onSave, onDone, onBack }) {
  // Freeze danh sách từ lúc mount – tránh bị tính lại khi App re-render sau onSave
  const [words] = useState(() => rawWords.slice(0, MAX_STUDY))

  const [current,  setCurrent]  = useState(0)
  const [flipped,  setFlipped]  = useState(false)
  const [results,  setResults]  = useState({})    // id -> 'remember'|'forget'
  const [phase,    setPhase]    = useState('card') // card | finish | deep
  const [showPhon, setShowPhon] = useState(true)
  // Đảm bảo chỉ lưu kết quả lên Supabase đúng 1 lần
  const savedRef = useRef(false)

  // saveAndContinue: lưu kết quả nhưng KHÔNG về home (dùng khi vào deep practice)
  function saveAndContinue(res) {
    if (!tempMode && !savedRef.current) {
      savedRef.current = true
      if (onSave) onSave(Object.entries(res))
    }
  }
  // saveAndExit: lưu kết quả VÀ về home
  function saveAndExit(res) {
    if (!tempMode && !savedRef.current) {
      savedRef.current = true
      onDone(Object.entries(res))
    } else {
      onBack()
    }
  }

  // keyboard
  const handleKey = useCallback(e => {
    if (phase === 'card') {
      if (e.key === ' ') { e.preventDefault(); if (!flipped) setFlipped(true) }
      if (e.key === '1' && flipped) handleRemember()
      if (e.key === '2' && flipped) handleForget()
    }
    if (phase === 'finish') {
      if (e.key === '1') endSession()
      if (e.key === '2') replay()
      if (e.key === '3') { saveAndContinue(results); setPhase('deep') }
    }
  }, [phase, flipped, current])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function handleRemember() {
    if (!flipped) return
    setResults(r => ({ ...r, [words[current].Id]: 'remember' }))
    advance()
  }
  function handleForget() {
    if (!flipped) return
    setResults(r => ({ ...r, [words[current].Id]: 'forget' }))
    advance()
  }
  function advance() {
    if (current + 1 >= words.length) { setPhase('finish'); return }
    setCurrent(c => c+1)
    setFlipped(false)
  }
  function endSession() {
    saveAndExit(results)
    onBack()
  }
  function replay() {
    setCurrent(0)
    setFlipped(false)
    setPhase('card')
  }

  const remembered = Object.values(results).filter(v => v === 'remember').length
  const forgot      = Object.values(results).length - remembered

  if (phase === 'deep') {
    if (words.length < 4) {
      alert('Cần ít nhất 4 từ để ôn chuyên sâu!')
      setPhase('finish')
      return null
    }
    return (
      <DeepPractice
        words={words}
        onDone={() => {
          // Kết quả đã được lưu khi bấm "Ôn chuyên sâu", chỉ cần về home
          onBack()
        }}
      />
    )
  }

  if (phase === 'finish') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-white">Hoàn thành phiên ôn tập!</h2>
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-3xl font-extrabold text-accent3">{remembered}</p>
            <p className="text-dim text-sm">Nhớ rồi ✅</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-accent2">{forgot}</p>
            <p className="text-dim text-sm">Chưa nhớ ❌</p>
          </div>
        </div>
        {tempMode && (
          <p className="text-dim text-sm italic">(Chế độ tạm thời – kết quả không được lưu)</p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={endSession} className="btn-accent">🏁 Kết thúc [1]</button>
          <button onClick={replay} className="px-5 py-2.5 rounded-xl font-bold text-sm
                                              bg-accent2/20 text-accent2 border border-accent2/40
                                              hover:bg-accent2/30 transition-colors">
            🔄 Xem lại [2]
          </button>
          <button
            onClick={() => {
              saveAndContinue(results)
              setPhase('deep')
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-sm
                       bg-accent3/20 text-accent3 border border-accent3/40
                       hover:bg-accent3/30 transition-colors"
          >
            🧠 Ôn chuyên sâu [3]
          </button>
        </div>
      </div>
    )
  }

  const word = words[current]

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="text-dim hover:text-white text-sm transition-colors">
          ← Quay lại
        </button>
        <span className="text-dim text-sm">Thẻ {current+1} / {words.length}</span>
        <button
          onClick={() => setShowPhon(p => !p)}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors
                      ${showPhon
                        ? 'border-accent/40 text-accent bg-accent/10'
                        : 'border-border text-dim bg-surface2'}`}
        >
          {showPhon ? '🔤 Ẩn phiên âm' : '🔤 Hiện phiên âm'}
        </button>
      </div>

      <ProgressBar value={current} max={words.length} />

      {/* Card */}
      <div className="flex-1 flex flex-col gap-4">
        <FlashCard
          word={word}
          showBack={flipped}
          showPhonetic={showPhon}
          onClick={() => { if (!flipped) setFlipped(true) }}
        />

        {/* Answer buttons */}
        {flipped ? (
          <div className="flex gap-3 justify-center animate-fade-in">
            <button
              onClick={handleRemember}
              className="flex-1 max-w-xs py-3 rounded-xl font-bold text-sm
                         bg-accent3/20 text-accent3 border border-accent3/50
                         hover:bg-accent3/30 active:scale-95 transition-all"
            >
              ✅ Nhớ rồi [1]
            </button>
            <button
              onClick={handleForget}
              className="flex-1 max-w-xs py-3 rounded-xl font-bold text-sm
                         bg-accent2/20 text-accent2 border border-accent2/50
                         hover:bg-accent2/30 active:scale-95 transition-all"
            >
              ❌ Chưa nhớ [2]
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setFlipped(true)}
              className="btn-accent px-8"
            >
              Lật thẻ [Space]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}