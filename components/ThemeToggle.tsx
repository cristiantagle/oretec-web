'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const ls = localStorage.getItem('theme') as Theme | null
      if (ls === 'dark' || ls === 'light') {
        setTheme(ls)
        document.documentElement.setAttribute('data-theme', ls)
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
        const initial: Theme = prefersDark ? 'dark' : 'light'
        setTheme(initial)
        document.documentElement.setAttribute('data-theme', initial)
      }
    } catch {}
    setReady(true)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
  }

  if (!ready) {
    return <button aria-label="Cambiar tema" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200" style={{opacity:0}} />
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition
                 border-slate-300 hover:scale-105 active:scale-95
                 bg-white text-slate-700"
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9.83-19.16l-1.79-1.79-1.8 1.79 1.8 1.79 1.79-1.79zM17.24 19.16l1.8 1.79 1.79-1.79-1.79-1.79-1.8 1.79zM20 13h3v-2h-3v2zM4 13H1v-2h3v2zm8-7a5 5 0 100 10 5 5 0 000-10z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M12.74 2a9 9 0 108.52 12.07 7 7 0 01-8.52-12.07z"/>
        </svg>
      )}
    </button>
  )
}
