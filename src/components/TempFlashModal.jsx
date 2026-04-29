import React, { useState, useRef } from 'react'
import { Modal } from './UI'
import FlashCardSession from './FlashCardSession'

export default function TempFlashModal({ open, onClose }) {
  const [words,    setWords]    = useState([])
  const [fileName, setFileName] = useState('')
  const [preview,  setPreview]  = useState('')
  const [previewOk, setOk]      = useState(false)
  const [started,  setStarted]  = useState(false)
  const fileRef = useRef()

  React.useEffect(() => {
    if (!open) { setWords([]); setFileName(''); setPreview(''); setOk(false); setStarted(false) }
  }, [open])

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
      const ws = lines.map((line, i) => {
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
        const clean = c => (c || '').replace(/^"|"$/g, '').trim()
        return { Id: i+1, TuVung: clean(cols[0]), PhienAm: clean(cols[1]), Nghia: clean(cols[2]), ViDu: clean(cols[3]), ThanhThao: 0 }
      }).filter(w => w.TuVung)
      setWords(ws)
      setPreview(`✓ ${ws.length} từ vựng – sẵn sàng!`)
      setOk(ws.length > 0)
    } catch(e) {
      setPreview(`❌ Lỗi: ${e.message}`); setOk(false)
    }
  }

  if (started && words.length > 0) {
    return (
      <Modal open={open} onClose={onClose} wide>
        <div className="p-6 min-h-[500px] flex flex-col">
          <FlashCardSession
            words={words}
            tempMode={true}
            onDone={() => {}}
            onBack={() => setStarted(false)}
          />
        </div>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white">⚡ Thẻ Flashcard tạm thời</h2>
        <div className="bg-today/10 border border-today/30 rounded-xl px-4 py-2.5 text-today text-xs font-semibold">
          ⚠️ Chỉ dùng để học trực quan – không lưu dữ liệu vào Supabase
        </div>
        <p className="text-dim text-sm leading-relaxed">
          File CSV: 4 cột <span className="font-mono text-accent">Từ vựng, Phiên âm, Nghĩa, Ví dụ</span><br/>
          Dòng 1 là tiêu đề (bỏ qua), dữ liệu từ dòng 2.
        </p>

        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-border hover:border-today/50
                     rounded-xl p-6 text-center cursor-pointer transition-colors group"
        >
          <div className="text-3xl mb-1">📂</div>
          <p className="text-dim group-hover:text-white text-sm font-semibold transition-colors">
            {fileName || 'Click để chọn file CSV'}
          </p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </div>

        {preview && (
          <p className={`text-sm font-semibold ${previewOk ? 'text-accent3' : 'text-accent2'}`}>{preview}</p>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-sm">Đóng</button>
          <button
            onClick={() => setStarted(true)}
            disabled={!previewOk}
            className="px-5 py-2.5 rounded-xl font-bold text-sm
                       bg-today/20 text-today border border-today/40
                       hover:bg-today/30 disabled:opacity-40 disabled:cursor-not-allowed
                       active:scale-95 transition-all"
          >
            ▶ Bắt đầu học
          </button>
        </div>
      </div>
    </Modal>
  )
}
