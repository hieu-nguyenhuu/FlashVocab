import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY
export const TABLE = import.meta.env.VITE_TABLE_NAME || 'Vocabulary'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── helpers ──────────────────────────────────────────────────────────────────
const LEVEL_DAYS  = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }
const DAYS_TO_LVL = Object.fromEntries(Object.entries(LEVEL_DAYS).map(([k,v])=>[v,+k]))

export function getDiffDays(dateStr) {
  try {
    const [d,m,y] = dateStr.split('/')
    const added = new Date(+y, +m-1, +d)
    const today = new Date(); today.setHours(0,0,0,0)
    return Math.round((today - added) / 86400000)
  } catch { return -1 }
}

export function isReviewToday(dateStr, thanhThao) {
  const diff  = getDiffDays(dateStr)
  if (diff < 0) return false
  const level = DAYS_TO_LVL[diff]
  if (!level) return false
  return level > parseInt(thanhThao || 0)
}

function normalize(row) {
  return {
    ...row,
    Id:        parseInt(row.Id),
    ThanhThao: parseInt(row.ThanhThao || 0),
    NgayThem:  row.NgayThem  || '',
    TuVung:    row.TuVung    || '',
    PhienAm:   row.PhienAm   || '',
    Nghia:     row.Nghia     || '',
    ViDu:      row.ViDu      || '',
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export async function loadVocabulary() {
  const { data, error } = await supabase
    .from(TABLE).select('*').order('Id', { ascending: true })
  if (error) throw error
  return (data || []).map(normalize)
}

async function getNextId() {
  const { data } = await supabase
    .from(TABLE).select('Id').order('Id', { ascending: false }).limit(1)
  return data?.length ? parseInt(data[0].Id) + 1 : 1
}

export async function insertWords(newWords) {
  if (!newWords.length) return []
  const nextId = await getNextId()
  const today  = new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
  const rows   = newWords.map((w, i) => ({
    Id:        nextId + i,
    NgayThem:  w.NgayThem  || today,
    ThanhThao: parseInt(w.ThanhThao || 0),
    TuVung:    w.TuVung    || '',
    PhienAm:   w.PhienAm   || '',
    Nghia:     w.Nghia     || '',
    ViDu:      w.ViDu      || '',
  }))
  const { data, error } = await supabase.from(TABLE).insert(rows).select()
  if (error) throw error
  return (data || []).map(normalize)
}

export async function updateWord(id, fields) {
  const { error } = await supabase.from(TABLE).update(fields).eq('Id', id)
  if (error) throw error
}

export async function deleteWords(ids) {
  if (!ids.length) return
  const { error } = await supabase.from(TABLE).delete().in('Id', ids)
  if (error) throw error
}

export async function upsertWords(words) {
  if (!words.length) return
  const rows = words.map(w => ({
    Id:        parseInt(w.Id),
    NgayThem:  w.NgayThem  || '',
    ThanhThao: parseInt(w.ThanhThao || 0),
    TuVung:    w.TuVung    || '',
    PhienAm:   w.PhienAm   || '',
    Nghia:     w.Nghia     || '',
    ViDu:      w.ViDu      || '',
  }))
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'Id' })
  if (error) throw error
}

export function todayString() {
  return new Date().toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
}
