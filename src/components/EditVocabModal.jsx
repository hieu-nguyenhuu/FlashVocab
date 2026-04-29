import React, { useState } from 'react'
import { Modal, Toast } from './UI'
import { deleteWords, upsertWords } from '../lib/supabase'

export default function EditVocabModal({ open, onClose, words, onSaved }) {
  const [rows, setRows]       = useState([])
  const [deletedIds, setDel]  = useState([])
  const [selected, setSelected] = useState(new Set())
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  // sync khi mở
  React.useEffect(() => {
    if (open) {
      setRows(words.map(w => ({ ...w })))
      setDel([])
      setSelected(new Set())
    }
  }, [open, words])

  function updateCell(rowIdx, key, val) {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [key]: val } : r))
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  function deleteSelected() {
    if (!selected.size) return
    const ids = [...selected]
    setDel(prev => [...prev, ...ids])
    setRows(prev => prev.filter(r => !ids.includes(r.Id)))
    setSelected(new Set())
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (deletedIds.length) await deleteWords(deletedIds)
      if (rows.length) await upsertWords(rows)
      setToast({ msg: '✅ Đã lưu thay đổi!', type: 'success' })
      setTimeout(() => { onSaved(); onClose() }, 800)
    } catch(e) {
      setToast({ msg: `❌ Lỗi: ${e.message}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const COLS = [
    { key: 'NgayThem', label: 'Ngày thêm', w: '110px' },
    { key: 'ThanhThao', label: 'Thành thạo', w: '80px' },
    { key: 'TuVung', label: 'Từ vựng', w: '140px' },
    { key: 'PhienAm', label: 'Phiên âm', w: '130px' },
    { key: 'Nghia', label: 'Nghĩa', w: '1fr' },
    { key: 'ViDu', label: 'Ví dụ', w: '1fr' },
  ]

  return (
    <>
      <Modal open={open} onClose={onClose} wide>
        <div className="p-6 flex flex-col gap-4 max-h-[90vh]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">✏️ Chỉnh sửa từ vựng</h2>
            <div className="flex gap-2">
              {selected.size > 0 && (
                <button onClick={deleteSelected}
                  className="text-xs px-3 py-1.5 rounded-lg bg-accent2/20 text-accent2 border border-accent2/40 font-semibold hover:bg-accent2/30 transition-colors">
                  🗑 Xóa {selected.size} dòng
                </button>
              )}
              <button onClick={onClose} className="btn-ghost text-xs">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="btn-accent text-xs">
                {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
              </button>
            </div>
          </div>

          <p className="text-xs text-dim">Click vào ô để chỉnh sửa. Tick checkbox bên trái để chọn dòng xóa.</p>

          <div className="overflow-auto flex-1 rounded-xl border border-border">
            <table className="text-xs w-full min-w-[700px]">
              <thead className="sticky top-0 bg-surface2">
                <tr>
                  <th className="w-8 px-2 py-2 text-dim font-bold">#</th>
                  {COLS.map(c => (
                    <th key={c.key} className="px-2 py-2 text-left text-dim font-bold uppercase tracking-wide"
                        style={{ minWidth: c.w }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.Id}
                      className={`border-t border-border/40 transition-colors
                                  ${selected.has(row.Id) ? 'bg-accent2/10' : ri%2===1 ? 'bg-surface2/20' : ''}`}>
                    <td className="px-2 py-1 text-center">
                      <input type="checkbox"
                        checked={selected.has(row.Id)}
                        onChange={() => toggleSelect(row.Id)}
                        className="accent-accent2 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    {COLS.map(c => (
                      <td key={c.key} className="px-1 py-1">
                        <input
                          type={c.key === 'ThanhThao' ? 'number' : 'text'}
                          min={0} max={5}
                          value={row[c.key]}
                          onChange={e => updateCell(ri, c.key, c.key === 'ThanhThao' ? +e.target.value : e.target.value)}
                          className="w-full bg-transparent border border-transparent
                                     hover:border-border focus:border-accent focus:bg-surface2
                                     rounded-lg px-2 py-1 text-white outline-none transition-colors"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </>
  )
}
