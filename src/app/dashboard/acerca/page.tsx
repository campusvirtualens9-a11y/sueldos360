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
          <strong>Sueldos 360</strong> es una aplicación web educativa diseñada para que estudiantes de escuelas técnicas
          con orientación en <strong>Gestión y Administración de las Organizaciones (GAO)</strong> practiquen el circuito
          completo de liquidación de sueldos y jornales en Argentina.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          La app simula el proceso real: alta de empresa, legajos de empleados, aplicación de convenios colectivos de trabajo (CCT),
          carga de novedades mensuales, cálculo de haberes y descuentos, generación de recibos, libro de sueldos y confección
          del formulario F.931 (declaración jurada de aportes y contribuciones).
        </p>
      </section>

      {/* Sección: Referencias institucionales */}
      <section className="card mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🏛️</span> Referencias institucionales y normativa aplicable
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
            los recursos educativos compartidos.</p>
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
            <p><strong>Propiedad intelectual.</strong> El software Sueldos 360 fue desarrollado con fines académicos.
            Queda prohibida su comercialización, distribución o uso fuera del ámbito educativo sin autorización expresa.</p>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-500 font-bold shrink-0 mt-0.5">6.</span>
            <p><strong>Disponibilidad.</strong> El servicio se provee "tal como está" sin garantías de disponibilidad
            continua. Los datos pueden eliminarse al finalizar el ciclo lectivo.</p>
          </div>
        </div>
      </section>

      {/* Sección: Créditos */}
      <section className="card mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🎓</span> Créditos y agradecimientos
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Institución educativa</div>
            <div className="font-semibold text-slate-700">Escuela Técnica N° 9</div>
            <div className="text-xs text-slate-500 mt-0.5">Modalidad: Gestión y Administración de las Organizaciones (GAO)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Materia</div>
            <div className="font-semibold text-slate-700">Recursos Humanos / Liquidación de Sueldos</div>
            <div className="text-xs text-slate-500 mt-0.5">Aplicación práctica del circuito de haberes</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Tecnología</div>
            <div className="font-semibold text-slate-700">Next.js 16 · TypeScript · Supabase</div>
            <div className="text-xs text-slate-500 mt-0.5">Stack moderno de desarrollo web full-stack</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Versión</div>
            <div className="font-semibold text-slate-700">1.0.0 · Junio 2026</div>
            <div className="text-xs text-slate-500 mt-0.5">Datos de convenio: referencia junio 2026</div>
          </div>
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
