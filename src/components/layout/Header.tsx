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

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="edu-banner text-xs py-1.5 px-3 m-0 border-l-2">
        ⚠️ App con fines educativos — Los valores son simulados y editables
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium text-slate-700">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-700 font-bold text-xs">
            {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
