import React, { useState, useEffect } from 'react'
import { isReviewToday } from '../lib/supabase'
import { StarRating, TodayBadge } from './UI'

const PAGE_SIZE = 20

export default function VocabTable({ words, checkStates, onCheckChange, onSelectToday, onDeselectAll }) {
  const [page, setPage] = useState(0)

  // reset page khi words thay đổi
  useEffect(() => {
    const total = Math.max(1, Math.ceil(words.length / PAGE_SIZE))
    if (page >= total) setPage(total - 1)
  }, [words.length])

  const totalPages = Math.max(1, Math.ceil(words.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const end   = Math.min(start + PAGE_SIZE, words.length)
  const pageWords = words.slice(start, end)

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <span className="text-white font-bold text-base">Danh sách từ vựng</span>
        <div className="flex gap-2">
          <button
            onClick={onSelectToday}
            className="text-xs px-3 py-1.5 rounded-lg border border-accent/40 text-accent
                       hover:bg-accent/10 transition-colors font-semibold"
          >
            Chọn hôm nay
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-dim
                       hover:bg-surface2 transition-colors font-semibold"
          >
            Bỏ chọn
          </button>
        </div>
      </div>

      {/* table – scrollable */}
      <div className="flex-1 overflow-hidden surface-card">
        <div className="overflow-x-auto overflow-y-auto h-full">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface2 border-b border-border">
                <th className="w-24 px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider">Chọn</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider">Từ vựng</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider hidden sm:table-cell">Phiên âm</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider">Nghĩa</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider hidden md:table-cell">Ví dụ</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-dim uppercase tracking-wider w-28">Thành thạo</th>
              </tr>
            </thead>
            <tbody>
              {pageWords.map((word, idx) => {
                const review  = isReviewToday(word.NgayThem, word.ThanhThao)
                const checked = checkStates[word.Id] ?? review
                return (
                  <tr
                    key={word.Id}
                    className={`border-b border-border/40 transition-colors
                                ${idx % 2 === 1 ? 'bg-surface2/30' : ''}
                                hover:bg-accent/5`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => onCheckChange(word.Id, e.target.checked)}
                          className="w-4 h-4 accent-accent cursor-pointer rounded"
                        />
                        {review && <TodayBadge />}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold text-white text-base">{word.TuVung}</td>
                    <td className="px-3 py-3 text-accent font-mono text-xs hidden sm:table-cell">{word.PhienAm}</td>
                    <td className="px-3 py-3 text-white/90">{word.Nghia}</td>
                    <td className="px-3 py-3 text-dim text-xs hidden md:table-cell italic truncate max-w-[200px]">{word.ViDu}</td>
                    <td className="px-3 py-3">
                      <StarRating rating={word.ThanhThao} size={13} />
                    </td>
                  </tr>
                )
              })}
              {pageWords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-dim py-16">Chưa có từ vựng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setPage(p => Math.max(0, p-1))}
          disabled={page === 0}
          className="text-xs px-4 py-1.5 rounded-lg bg-surface2 border border-border text-dim
                     hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
        >‹ Trước</button>
        <span className="text-dim text-xs">
          Trang {page+1}/{totalPages} &nbsp;·&nbsp; {start+1}–{end} / {words.length} từ
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages-1, p+1))}
          disabled={page >= totalPages-1}
          className="text-xs px-4 py-1.5 rounded-lg bg-surface2 border border-border text-dim
                     hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
        >Sau ›</button>
      </div>
    </div>
  )
}
