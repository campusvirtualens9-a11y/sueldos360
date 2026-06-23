'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User
  onMenuToggle: () => void
}

export default function Header({ user, onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = (user.user_metadata?.full_name || user.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="bg-white border-b border-slate-100 px-3 sm:px-6 py-2.5 flex items-center gap-3 shrink-0">
      {/* Botón hamburguesa — solo visible en mobile */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Abrir menú"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      {/* Banner educativo — truncado en mobile */}
      <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 font-medium flex-1 min-w-0">
        <span className="shrink-0">⚠️</span>
        <span className="truncate hidden sm:block">Simulador educativo — los valores son aproximados y editables</span>
        <span className="truncate sm:hidden">Simulador educativo</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right hidden lg:block">
          <p className="text-xs font-semibold text-slate-700 leading-none">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user.email}</p>
        </div>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm shrink-0">
          <span className="text-white font-bold text-[11px] tracking-wide">{initials}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-red-200 hover:bg-red-50"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
