'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/empresas', label: 'Empresas', icon: '🏢' },
  { href: '/dashboard/legajos', label: 'Legajos', icon: '👥' },
  { href: '/dashboard/convenios', label: 'Convenios CCT', icon: '📋' },
  { href: '/dashboard/parametros', label: 'Parámetros', icon: '⚙️' },
  { href: '/dashboard/novedades', label: 'Novedades', icon: '📅' },
  { href: '/dashboard/liquidacion', label: 'Liquidación', icon: '💰' },
  { href: '/dashboard/recibos', label: 'Recibos', icon: '🧾' },
  { href: '/dashboard/libro', label: 'Libro Sueldos', icon: '📚' },
  { href: '/dashboard/f931', label: 'F.931 Simulado', icon: '📊' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '📈' },
  { href: '/dashboard/exportaciones', label: 'Exportaciones', icon: '📤' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">S360</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-none">Sueldos 360</p>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Simulador educativo</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {nav.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          Simulador educativo · No es sistema oficial ARCA
        </p>
      </div>
    </aside>
  )
}
