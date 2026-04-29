import React, { useState, useRef } from 'react'
import { Modal, Toast } from './UI'
import { insertWords, todayString } from '../lib/supabase'

export default function ImportModal({ open, onClose, existingWords, onImported }) {
  const [pending, setPending] = useState([])
  const [fileName, setFileName] = useState('')
  const [preview, setPreview]   = useState('')
  const [previewOk, setPreviewOk] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [toast, setToast]       = useState(null)
  const fileRef = useRef()

  function reset() {
    setPending([]); setFileName(''); setPreview(''); setPreviewOk(false)
  }

  React.useEffect(() => { if (!open) reset() }, [open])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = ev => parseCSV(ev.target.result)
    reader.readAsText(file, 'utf-8')
  }

  function parseCSV(text) {
    try {
      const lines = text.split('\n').slice(1).filter(l => l.trim())
      const words = lines.map((line, i) => {
        // simple CSV parse (handles quoted fields)
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
        const clean = c => (c || '').replace(/^"|"$/g, '').trim()
        return {
          NgayThem:  todayString(),
          ThanhThao: 0,
          TuVung:    clean(cols[0]),
          PhienAm:   clean(cols[1]),
          Nghia:     clean(cols[2]),
          ViDu:      clean(cols[3]),
        }
      }).filter(w => w.TuVung)
      setPending(words)
      setPreview(`✓ Tìm thấy ${words.length} từ vựng – sẵn sàng nhập.`)
      setPreviewOk(true)
    } catch(e) {
      setPreview(`❌ Lỗi đọc file: ${e.message}`)
      setPreviewOk(false)
    }
  }

  async function handleImport() {
    if (!pending.length) return
    setLoading(true)
    try {
      const inserted = await insertWords(pending)
      setToast({ msg: `✅ Đã nhập ${inserted.length} từ vựng!`, type: 'success' })
      setTimeout(() => { onImported(); onClose() }, 900)
    } catch(e) {
      setToast({ msg: `❌ Lỗi: ${e.message}`, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white">📥 Nhập từ vựng từ CSV</h2>
          <p className="text-dim text-sm leading-relaxed">
            File CSV cần có 4 cột: <span className="text-accent font-mono">Từ vựng, Phiên âm, Nghĩa, Ví dụ</span><br />
            Dòng 1 là tiêu đề (bị bỏ qua), dữ liệu bắt đầu từ dòng 2.
          </p>

          <div
            onClick={() => fileRef.current.click()}
            className="border-2 border-dashed border-border hover:border-accent/60
                       rounded-xl p-6 text-center cursor-pointer transition-colors group"
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-dim group-hover:text-white transition-colors text-sm font-semibold">
              {fileName || 'Click để chọn file CSV'}
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </div>

          {preview && (
            <p className={`text-sm font-semibold ${previewOk ? 'text-accent3' : 'text-accent2'}`}>
              {preview}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="btn-ghost text-sm">Hủy</button>
            <button
              onClick={handleImport}
              disabled={!previewOk || loading}
              className="btn-accent text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang nhập...' : '✅ Nhập vào danh sách'}
            </button>
          </div>
        </div>
      </Modal>
      {toast && <Toast {...toast} onDone={() => setToast(null)} />}
    </>
  )
}
