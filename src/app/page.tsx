import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="10" fill="url(#grad-home)"/>
            <defs>
              <linearGradient id="grad-home" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb"/>
                <stop offset="1" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
            <text x="18" y="15" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="13" fontFamily="system-ui" fontWeight="700">$</text>
            <path d="M10 18 A8 8 0 0 1 26 18" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <text x="18" y="27" textAnchor="middle" fill="white" fontSize="9.5" fontFamily="system-ui" fontWeight="800" letterSpacing="-0.3">360</text>
          </svg>
          <span className="font-extrabold text-slate-800 text-lg tracking-tight">Sueldos <span className="text-blue-600">360</span></span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            Ingresar
          </Link>
          <Link href="/auth/registro" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Registrarse gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🎓</span>
            <span>Simulador educativo — Modalidad técnica GAO</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Aprendé el circuito completo de<br />
            <span className="text-blue-600">liquidación de sueldos</span>
          </h1>

          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Simulá de forma clara y realista todo el proceso: desde la carga de empresa y
            legajos hasta la generación del Libro de Sueldos y el F.931 simulado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/registro" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-base">
              Comenzar ahora — es gratis
            </Link>
            <Link href="/auth/login" className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-base">
              Ya tengo cuenta
            </Link>
          </div>

          {/* Pasos del circuito */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              { n: '1', label: 'Empresa y legajos', icon: '🏢' },
              { n: '2', label: 'Convenio y parámetros', icon: '📋' },
              { n: '3', label: 'Novedades del mes', icon: '📅' },
              { n: '4', label: 'Liquidación', icon: '💰' },
              { n: '5', label: 'Recibos y F.931', icon: '🧾' },
            ].map(step => (
              <div key={step.n} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <div className="text-2xl mb-2">{step.icon}</div>
                <div className="text-xs font-semibold text-blue-600 mb-1">Paso {step.n}</div>
                <div className="text-xs text-slate-600">{step.label}</div>
              </div>
            ))}
          </div>

          {/* Aviso educativo */}
          <div className="edu-banner max-w-2xl mx-auto text-left">
            <strong>Aviso educativo:</strong> Esta aplicación es un simulador con fines pedagógicos.
            Los valores y cálculos son de referencia y pueden requerir actualización.
            No reemplaza asesoramiento contable, laboral ni legal profesional.
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="bg-white border-t border-slate-100 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">¿Qué incluye?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Dashboard con alertas', 'Legajos de empleados',
              '5 convenios colectivos', 'Motor de liquidación',
              'Recibos exportables en PDF', 'Libro de Sueldos y Jornales',
              'F.931 simulado', 'Reportes y gráficos',
            ].map(m => (
              <div key={m} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-green-500 font-bold">✓</span>
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-50 border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
        Sueldos 360 · Simulador educativo para modalidad técnica GAO · No es un sistema oficial de ARCA
      </footer>
    </main>
  )
}
