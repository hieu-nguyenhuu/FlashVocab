import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ProgressBar } from './UI'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Exercise 1: Matching (nhiều màn, mỗi màn 5 cặp) ───────────────────────
const MATCH_PER_ROUND = 5

function MatchingExercise({ words, onDone }) {
  const [rounds] = useState(() => {
    const shuffled = shuffle(words)
    const result = []
    for (let i = 0; i < shuffled.length; i += MATCH_PER_ROUND) {
      result.push(shuffled.slice(i, i + MATCH_PER_ROUND))
    }
    return result
  })
  const [roundIdx,   setRoundIdx]   = useState(0)
  const totalScoreRef = useRef(0)
  const totalPairsRef = useRef(0)
  const [displayScore, setDisplayScore] = useState(0)
  const [displayPairs, setDisplayPairs] = useState(0)

  function handleRoundDone(roundScore, roundTotal) {
    totalScoreRef.current += roundScore
    totalPairsRef.current += roundTotal
    setDisplayScore(totalScoreRef.current)
    setDisplayPairs(totalPairsRef.current)
    if (roundIdx + 1 >= rounds.length) {
      setTimeout(() => onDone(totalScoreRef.current, totalPairsRef.current), 400)
    } else {
      setTimeout(() => setRoundIdx(i => i + 1), 400)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-dim">Màn {roundIdx + 1} / {rounds.length}</span>
        <span className="text-accent3 font-bold">{displayScore} / {displayPairs} cặp đúng</span>
      </div>
      <div className="flex gap-1">
        {rounds.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors
            ${i < roundIdx ? 'bg-accent3' : i === roundIdx ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>
      <MatchingRound
        key={roundIdx}
        pool={rounds[roundIdx]}
        onDone={handleRoundDone}
      />
    </div>
  )
}

function MatchingRound({ pool, onDone }) {
  const [leftList]  = useState(() => shuffle(pool))
  const [rightList] = useState(() => shuffle(pool))
  const [matched,  setMatched]  = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [score,    setScore]    = useState(0)
  const [wrongIds, setWrongIds] = useState(new Set())
  const scoreRef = useRef(0)

  useEffect(() => {
    if (pool.length > 0 && matched.size === pool.length) {
      setTimeout(() => onDone(scoreRef.current, pool.length), 500)
    }
  }, [matched.size])

  function handleClick(side, wordId) {
    if (matched.has(wordId) || wrongIds.has(wordId)) return
    if (!selected) { setSelected({ side, wordId }); return }
    if (selected.side === side) { setSelected({ side, wordId }); return }
    if (selected.wordId === wordId) {
      setMatched(m => new Set([...m, wordId]))
      scoreRef.current += 1
      setScore(scoreRef.current)
      setSelected(null)
    } else {
      setWrongIds(new Set([selected.wordId, wordId]))
      setSelected(null)
      setTimeout(() => setWrongIds(new Set()), 500)
    }
  }

  function btnCls(side, wordId) {
    if (matched.has(wordId))  return 'bg-accent3/20 border-accent3 text-accent3 cursor-default'
    if (wrongIds.has(wordId)) return 'bg-accent2/20 border-accent2 text-accent2'
    if (selected?.wordId === wordId && selected?.side === side)
                              return 'bg-accent/20 border-accent text-white'
    return 'bg-surface2 border-border text-white hover:border-accent/60 cursor-pointer'
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-dim text-xs">Click từ vựng và nghĩa tương ứng để ghép cặp</p>
        <span className="text-accent3 font-bold text-sm">{score} / {pool.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {leftList.map(w => (
            <button key={w.Id} onClick={() => handleClick('left', w.Id)}
              className={`px-3 py-3 rounded-xl border text-sm font-semibold text-center transition-colors ${btnCls('left', w.Id)}`}>
              {w.TuVung}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rightList.map(w => (
            <button key={w.Id} onClick={() => handleClick('right', w.Id)}
              className={`px-3 py-3 rounded-xl border text-sm text-center transition-colors ${btnCls('right', w.Id)}`}>
              {w.Nghia}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Exercise 2 & 3: MCQ ─────────────────────────────────────────────────────
function buildMCQQuestions(words) {
  return shuffle(words).map(q => {
    const others     = words.filter(w => w.Id !== q.Id)
    const choices    = shuffle([...shuffle(others).slice(0, 3), q])
    const correctIdx = choices.findIndex(c => c.Id === q.Id)
    return { q, choices, correctIdx }
  })
}

function MCQExercise({ words, mode, onDone }) {
  const [questions] = useState(() => buildMCQQuestions(words))
  const [qi,       setQi]    = useState(0)
  const [answered, setAns]   = useState(false)
  const [chosen,   setChosen]= useState(null)
  const [score,    setScore] = useState(0)
  // scoreRef: sync counter, tránh stale closure khi gọi onDone
  const scoreRef = useRef(0)

  const { q, choices, correctIdx } = questions[qi]

  const handleKey = useCallback(e => {
    if (['1','2','3','4'].includes(e.key) && !answered) {
      e.preventDefault()
      answer(+e.key - 1)
    }
    if (e.key === ' ' && answered) {
      e.preventDefault()
      next()
    }
  }, [answered, qi, chosen, correctIdx, questions.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function answer(idx) {
    if (answered) return
    setAns(true)
    setChosen(idx)
    if (idx === correctIdx) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
  }

  function next() {
    if (qi + 1 >= questions.length) {
      onDone(scoreRef.current, questions.length)
      return
    }
    setQi(i => i + 1)
    setAns(false)
    setChosen(null)
  }

  function btnCls(idx) {
    if (!answered)
      return 'bg-surface2 border-border text-white hover:border-accent/60 hover:bg-surface cursor-pointer'
    if (idx === correctIdx)
      return 'bg-accent3/20 border-accent3 text-accent3'
    if (idx === chosen && idx !== correctIdx)
      return 'bg-accent2/20 border-accent2 text-accent2'
    return 'bg-surface2 border-border text-dim opacity-50'
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between text-sm">
        <span className="text-dim">Câu {qi + 1} / {questions.length}</span>
        <span className="text-accent3 font-bold">{score} đúng</span>
      </div>
      <div key={qi} className="rounded-2xl bg-surface2 border border-border p-6 text-center animate-fade-in">
        <p className="text-white font-extrabold text-2xl sm:text-3xl leading-tight">
          {mode === 'choose_word' ? q.Nghia : q.TuVung}
        </p>
        {mode === 'choose_meaning' && q.PhienAm && (
          <p className="text-accent font-mono text-sm mt-2">{q.PhienAm}</p>
        )}
      </div>
      <p className="text-dim text-xs text-center">
        {mode === 'choose_word' ? 'Chọn từ vựng đúng nghĩa trên' : 'Chọn nghĩa đúng của từ trên'}
        &nbsp;·&nbsp; Phím 1–4 để chọn &nbsp;·&nbsp; Space để tiếp
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((c, idx) => (
          <button key={c.Id} onClick={() => answer(idx)} disabled={answered}
            className={`px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-colors ${btnCls(idx)}`}>
            <span className="text-dim mr-2">{idx + 1}.</span>
            {mode === 'choose_word' ? c.TuVung : c.Nghia}
          </button>
        ))}
      </div>
      {answered && (
        <div className="text-center animate-fade-in">
          <button onClick={next} className="btn-accent px-8">
            {qi + 1 >= questions.length ? '🏁 Xong bài' : 'Tiếp [Space]'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Exercise 4: Fill-in ─────────────────────────────────────────────────────
function FillExercise({ words, onDone }) {
  const [questions] = useState(() => shuffle(words))
  const [qi,       setQi]     = useState(0)
  const [input,    setInput]  = useState('')
  const [answered, setAns]    = useState(false)
  const [correct,  setCorrect]= useState(false)
  const [score,    setScore]  = useState(0)
  const [hintPos,  setHintPos]= useState(0)
  const [hint,     setHint]   = useState('')
  const inputRef = useRef()
  // scoreRef: sync counter, tránh stale closure khi gọi onDone
  const scoreRef = useRef(0)

  const q = questions[qi]

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [qi])

  const handleKey = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!answered) check(); else next()
    }
    if (e.key === 'Control') { e.preventDefault(); showHint() }
  }, [answered, input, qi, hintPos, questions.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  function check() {
    if (answered) return
    const ok = input.trim().toLowerCase() === q.TuVung.trim().toLowerCase()
    setAns(true)
    setCorrect(ok)
    if (ok) {
      scoreRef.current += 1
      setScore(scoreRef.current)
    }
  }

  function next() {
    if (qi + 1 >= questions.length) {
      onDone(scoreRef.current, questions.length)
      return
    }
    setQi(i => i + 1)
    setInput('')
    setAns(false)
    setCorrect(false)
    setHintPos(0)
    setHint('')
  }

  function showHint() {
    if (answered) return
    const ans = q.TuVung
    if (hintPos < ans.length) {
      setHint(ans.slice(0, hintPos + 1) + '·'.repeat(ans.length - hintPos - 1))
      setHintPos(p => p + 1)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between text-sm">
        <span className="text-dim">Câu {qi + 1} / {questions.length}</span>
        <span className="text-accent3 font-bold">{score} đúng</span>
      </div>

      {/* Chỉ hiển thị nghĩa, không hiển thị ví dụ */}
      <div key={qi}
        className="rounded-2xl bg-surface2 border border-border p-6 text-center
                   flex items-center justify-center animate-fade-in min-h-[100px]">
        <p className="text-white font-extrabold text-2xl sm:text-3xl leading-tight">{q.Nghia}</p>
      </div>

      {hint && (
        <p className="text-center font-mono text-accent text-xl tracking-widest animate-fade-in">
          {hint}
        </p>
      )}

      <div className={`flex gap-2 items-center rounded-xl border px-4 py-1 transition-colors
                       ${answered
                         ? correct ? 'border-accent3 bg-accent3/10' : 'border-accent2 bg-accent2/10'
                         : 'border-border bg-surface2 focus-within:border-accent'}`}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={answered}
          placeholder="Nhập từ vựng..."
          className="flex-1 bg-transparent py-3 text-white text-base outline-none placeholder:text-dim"
        />
        <button onClick={showHint} disabled={answered} type="button"
          className="text-xs px-3 py-1.5 rounded-lg border border-accent/40 text-accent
                     hover:bg-accent/10 disabled:opacity-30 transition-colors font-semibold shrink-0">
          💡 Ctrl
        </button>
      </div>

      {answered && (
        <p className={`text-center font-bold animate-fade-in ${correct ? 'text-accent3' : 'text-accent2'}`}>
          {correct ? '✅ Chính xác!' : `❌ Đáp án đúng: ${q.TuVung}`}
        </p>
      )}

      <div className="flex gap-3 justify-center">
        {!answered
          ? <button onClick={check} className="btn-accent px-8">Kiểm tra [Enter]</button>
          : <button onClick={next}  className="btn-accent px-8">
              {qi + 1 >= questions.length ? '🏁 Xong bài' : 'Tiếp [Enter]'}
            </button>
        }
      </div>
      <p className="text-dim text-xs text-center">Ctrl → gợi ý từng chữ</p>
    </div>
  )
}

// ─── Main DeepPractice controller ────────────────────────────────────────────
const EXERCISE_TITLES = [
  '🃏 Bài 1/4: Nối từ',
  '🔤 Bài 2/4: Chọn từ vựng',
  '📖 Bài 3/4: Chọn nghĩa',
  '✍️  Bài 4/4: Điền từ',
]

export default function DeepPractice({ words, onDone }) {
  const [ex,      setEx]      = useState(0)
  const [scores,  setScores]  = useState([0, 0, 0, 0])
  const [totals,  setTotals]  = useState([0, 0, 0, 0])
  const [summary, setSummary] = useState(null)

  function handleExDone(score, total) {
    const ns = scores.map((s, i) => i === ex ? score : s)
    const nt = totals.map((t, i) => i === ex ? total : t)
    setScores(ns)
    setTotals(nt)
    if (ex < 3) {
      setEx(e => e + 1)
    } else {
      setSummary({ s: ns, t: nt })
    }
  }

  if (summary) {
    const totalScore = summary.s.reduce((a, b) => a + b, 0)
    const totalQ     = summary.t.reduce((a, b) => a + b, 0)
    const pct        = totalQ ? Math.round(totalScore / totalQ * 100) : 0
    return (
      <div className="flex flex-col items-center gap-5 py-8 animate-fade-in">
        <div className="text-5xl">🏆</div>
        <h2 className="text-2xl font-extrabold text-white">Hoàn thành ôn tập chuyên sâu!</h2>
        <div className="w-full max-w-sm flex flex-col gap-3">
          {EXERCISE_TITLES.map((t, i) => {
            const p = summary.t[i] ? Math.round(summary.s[i] / summary.t[i] * 100) : 0
            const c = p >= 70 ? 'text-accent3' : p >= 40 ? 'text-today' : 'text-accent2'
            return (
              <div key={i} className="flex justify-between items-center surface-card px-4 py-3 text-sm">
                <span className="text-white font-semibold">{t}</span>
                <span className={`font-bold ${c}`}>{summary.s[i]}/{summary.t[i]} ({p}%)</span>
              </div>
            )
          })}
          <div className="flex justify-between items-center bg-accent/10 border border-accent/30
                          rounded-2xl px-4 py-3 text-sm mt-1">
            <span className="text-white font-bold">Tổng kết</span>
            <span className="text-accent font-extrabold">{totalScore}/{totalQ} — {pct}%</span>
          </div>
        </div>
        <button onClick={onDone} className="btn-accent px-8 mt-2">🏠 Về màn hình chính</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-white font-bold text-lg">🧠 Ôn tập chuyên sâu</h2>
        <span className="text-dim text-sm">{EXERCISE_TITLES[ex]}</span>
      </div>
      <ProgressBar value={ex} max={4} />
      <div className="flex-1 overflow-y-auto pb-4">
        {ex === 0 && <MatchingExercise key="match" words={words} onDone={handleExDone} />}
        {ex === 1 && <MCQExercise     key="mcq1"  words={words} mode="choose_word"    onDone={handleExDone} />}
        {ex === 2 && <MCQExercise     key="mcq2"  words={words} mode="choose_meaning" onDone={handleExDone} />}
        {ex === 3 && <FillExercise    key="fill"  words={words} onDone={handleExDone} />}
      </div>
    </div>
  )
}