import Image from 'next/image'

export default function AcercaPage() {
  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 2a9 9 0 100 18A9 9 0 0011 2z" stroke="white" strokeWidth="1.5" fill="none"/>
              <text x="11" y="15" textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui" fontWeight="800">360</text>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sueldos <span className="text-blue-600">360</span></h1>
            <p className="text-sm text-slate-500">Simulador educativo de liquidación de sueldos · Argentina</p>
          </div>
        </div>
      </div>

      {/* Sección: ¿Qué es Sueldos 360? */}
      <section className="card mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-blue-600">📘</span> ¿Qué es Sueldos 360?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          <strong>Sueldos 360</strong> es una aplicación web educativa diseñada para practicar el circuito
          completo de liquidación de sueldos y jornales en Argentina, con orientación en
          <strong> Gestión y Administración de las Organizaciones (GAO)</strong>.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          La app simula el proceso real: alta de empresa, legajos de empleados, aplicación de convenios colectivos de trabajo (CCT),
          carga de novedades mensuales, cálculo de haberes y descuentos, generación de recibos, libro de sueldos y confección
          del formulario F.931 (declaración jurada de aportes y contribuciones).
        </p>
      </section>

      {/* Sección: Referencias normativas */}
      <section className="card mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🏛️</span> Referencias normativas aplicables
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">Ley de Contrato de Trabajo Nº 20.744</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Marco normativo general del derecho laboral argentino. Regula jornadas, vacaciones, SAC, preaviso e indemnizaciones.
              Última actualización: Ley Nº 27.742 (Bases y Puntos de Partida, 2024).
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">Sistema Integrado Previsional Argentino (SIPA) — Ley Nº 26.425</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rige el régimen de aportes jubilatorios (11 % trabajador) y contribuciones patronales al ANSES.
              Base: Decreto 814/01 y modificatorias.
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">ARCA — Agencia de Recaudación y Control Aduanero</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organismo recaudador de las cargas sociales (ex-AFIP). El formulario F.931 se presenta mensualmente
              declarando aportes y contribuciones de seguridad social. Esta app simula dicho formulario con fines pedagógicos.
            </p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">Convenios Colectivos de Trabajo (CCT)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Los CCTs incluidos en la app son: Comercio (Nº 130/75 — FAECyS), Construcción (Nº 76/21 — UOCRA),
              Gastronomía (Nº 389/73 — UTHGRA), Sanidad (Nº 122/75 — ATSA) y Camioneros (Nº 40/89 — Federación Nacional).
              Los básicos son de referencia a <strong>junio 2026</strong>. Algunos valores marcados con ⚠️ requieren verificación
              desde las fuentes oficiales (paritaria vigente).
            </p>
          </div>
          <div className="border-l-4 border-slate-300 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">Ministerio de Capital Humano — Secretaría de Trabajo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Homologación de CCTs y resoluciones de salario mínimo vital y móvil (SMVM).
            </p>
          </div>
          <div className="border-l-4 border-slate-300 pl-4">
            <h3 className="font-semibold text-slate-700 text-sm">ANSSAL / Superintendencia de Servicios de Salud</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Regula el aporte de obra social (3 % trabajador + 6 % patronal) y la contribución al PAMI/INSSJP (3 % + 2 %).
            </p>
          </div>
        </div>
      </section>

      {/* Sección: Bases y condiciones */}
      <section className="card mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">📄</span> Bases y condiciones de uso
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">1.</span>
            <p><strong>Uso exclusivamente educativo.</strong> Esta aplicación es un simulador pedagógico. Los datos,
            cálculos y documentos generados no tienen validez legal, impositiva ni laboral. No reemplazan a un sistema
            de liquidación homologado ni a la asesoría de un contador o especialista en RRHH.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">2.</span>
            <p><strong>Límites del simulador.</strong> Cada usuario puede crear hasta <strong>2 empresas</strong> con
            hasta <strong>10 empleados activos</strong> por empresa. Estos límites son intencionales para preservar
            los recursos del servicio.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">3.</span>
            <p><strong>Exactitud de los datos.</strong> Los básicos de convenio y porcentajes de aportes son aproximados
            a la fecha de publicación y pueden no reflejar actualizaciones paritarias posteriores. El usuario es
            responsable de verificar los valores vigentes antes de aplicarlos en un contexto real.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">4.</span>
            <p><strong>Privacidad de los datos.</strong> Los datos ingresados en la app (empleados, empresas, liquidaciones)
            son de uso personal del usuario registrado y no son compartidos con terceros. Se almacenan de forma segura
            mediante Row Level Security (RLS) en Supabase.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">5.</span>
            <p><strong>Propiedad intelectual.</strong> El software Sueldos 360 fue desarrollado por su autor.
            Queda prohibida su comercialización o distribución sin autorización expresa.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">6.</span>
            <p><strong>Disponibilidad.</strong> El servicio se provee "tal como está" sin garantías de disponibilidad continua.</p>
          </div>
        </div>
      </section>

      {/* Sección: Créditos personales */}
      <section className="card mb-6 overflow-hidden">
        <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="text-blue-600">👤</span> Autor
        </h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Foto */}
          <div className="shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-blue-100 shadow-md">
              <Image
                src="/foto-perfil.png"
                alt="Juan Manuel Gómez"
                width={112}
                height={112}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Juan Manuel Gómez</h3>
            <p className="text-sm text-blue-600 font-semibold mt-0.5">Desarrollador · Docente</p>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Diseñó y desarrolló <strong>Sueldos 360</strong> como herramienta educativa para la enseñanza
              práctica del proceso de liquidación de sueldos en Argentina, integrando normativa laboral vigente,
              convenios colectivos reales y tecnología web moderna.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">Next.js 16</span>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">TypeScript</span>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">Supabase</span>
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">PostgreSQL</span>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-3 py-1 font-medium">Liquidación de sueldos ARG</span>
            </div>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Versión 1.0.0</span>
          <span>Junio 2026 · Datos de CCT de referencia junio 2026</span>
        </div>
      </section>

      {/* Disclaimer final */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
        <span className="font-bold">⚠️ Aviso legal:</span> Sueldos 360 es un simulador educativo. Los recibos de sueldo,
        el Libro de Sueldos y Jornales, el F.931 y cualquier otro documento generado por esta aplicación
        <strong> no tienen validez legal</strong> y no reemplazan la documentación oficial exigida por la normativa laboral argentina.
        Para liquidaciones reales, consultar a un profesional habilitado (Contador Público Nacional o Licenciado en RRHH).
      </div>
    </div>
  )
}
