import React, { useState } from 'react'

const ACCOUNT  = import.meta.env.VITE_ACCOUNT
const PASSWORD = import.meta.env.VITE_PASSWORD
const TOKEN_KEY   = 'fv_auth_token'
const TOKEN_DAYS  = 30

export function saveAuth() {
  const payload = { ts: Date.now(), exp: Date.now() + TOKEN_DAYS * 86400 * 1000 }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(payload))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return false
    const { exp } = JSON.parse(raw)
    return Date.now() < exp
  } catch {
    return false
  }
}

export default function LoginPage({ onLogin }) {
  const [account,  setAccount]  = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Giả lập delay nhỏ cho UX
    setTimeout(() => {
      if (account.trim() === ACCOUNT && password === PASSWORD) {
        saveAuth()
        onLogin()
      } else {
        setError('Tài khoản hoặc mật khẩu không đúng')
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96
                        bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64
                        bg-accent2/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">FlashVocab</h1>
          <p className="text-dim text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Account */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dim text-xs font-semibold uppercase tracking-wider">
                Tài khoản
              </label>
              <input
                type="text"
                value={account}
                onChange={e => { setAccount(e.target.value); setError('') }}
                placeholder="Nhập tài khoản..."
                autoComplete="username"
                autoFocus
                className="input-field"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dim text-xs font-semibold uppercase tracking-wider">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Nhập mật khẩu..."
                  autoComplete="current-password"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-dim hover:text-white transition-colors text-sm"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-accent2/10 border border-accent2/30 rounded-xl
                              px-4 py-2.5 text-accent2 text-sm font-semibold animate-fade-in">
                ❌ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !account || !password}
              className="btn-accent mt-1 disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="animate-spin">⏳</span> Đang kiểm tra...</>
                : '🔓 Đăng nhập'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-dim text-xs mt-4">
          Phiên đăng nhập lưu trong 30 ngày
        </p>
      </div>
    </div>
  )
}
