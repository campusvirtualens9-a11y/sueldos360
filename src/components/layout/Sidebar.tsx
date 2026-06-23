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
  { href: '/dashboard/gamificacion', label: 'Mis logros', icon: '🏆' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      // Mobile: posición fija, slide desde la izquierda, z-index sobre el overlay
      'fixed inset-y-0 left-0 z-50 w-64',
      'transform transition-transform duration-200 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      // Desktop: posición normal en el flujo, siempre visible
      'md:relative md:translate-x-0 md:z-auto md:w-56',
      'bg-white border-r border-slate-200 flex flex-col h-full shrink-0'
    )}>
      {/* Logo + botón cerrar en mobile */}
      <div className="px-4 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sueldos 360">
              <rect width="36" height="36" rx="10" fill="url(#grad)"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb"/>
                  <stop offset="1" stopColor="#1d4ed8"/>
                </linearGradient>
              </defs>
              <text x="18" y="15" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="13" fontFamily="system-ui" fontWeight="700">$</text>
              <path d="M10 18 A8 8 0 0 1 26 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <text x="18" y="27" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="system-ui" fontWeight="800" letterSpacing="-0.3">360</text>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-800 text-[14px] leading-none tracking-tight">Sueldos <span className="text-blue-600">360</span></p>
            <p className="text-[10px] text-slate-400 leading-none mt-1 font-medium tracking-wide uppercase">Simulador educativo</p>
          </div>
        </div>
        {/* Botón X solo visible en mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Cerrar menú"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
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
              onClick={onClose}
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
      <div className="px-3 py-3 border-t border-slate-100 space-y-1.5">
        <Link
          href="/dashboard/acerca"
          onClick={onClose}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            pathname === '/dashboard/acerca'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          )}
        >
          <span>ℹ️</span>
          <span>Acerca · Bases y condiciones</span>
        </Link>
        <p className="text-[9px] text-slate-300 text-center leading-relaxed px-2">
          Simulador educativo · No reemplaza sistemas oficiales ARCA
        </p>
      </div>
    </aside>
  )
}
