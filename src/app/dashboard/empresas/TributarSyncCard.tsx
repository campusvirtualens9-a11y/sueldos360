'use client'
import { useState } from 'react'

export function TributarSyncCard({ token, companyName }: { token: string | null; companyName: string }) {
  const [copied, setCopied] = useState(false)
  if (!token) return null

  async function copy() {
    await navigator.clipboard.writeText(token!)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
      <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">
        Código de sincronización — TRIBUT.AR
      </p>
      <p className="text-xs text-violet-500 mb-3">
        Usá este código en <strong>TRIBUT.AR → Administrador de Relaciones → Relaciones Laborales</strong> para importar los datos de liquidación de <strong>{companyName}</strong>. No lo compartás con otros estudiantes.
      </p>
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-2xl tracking-[0.3em] text-violet-800 bg-white border border-violet-200 rounded-xl px-5 py-2 select-all">
          {token}
        </span>
        <button
          onClick={copy}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}