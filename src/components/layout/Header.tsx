'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps { user: User }

export default function Header({ user }: HeaderProps) {
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
    <header className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between shrink-0">
      {/* Banner educativo compacto */}
      <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-medium">
        <span>⚠️</span>
        <span>Simulador educativo — los valores son aproximados y editables</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
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
          className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors border border-slate-200 rounded-lg px-3 py-1.5 hover:border-red-200 hover:bg-red-50"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
