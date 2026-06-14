'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { unlockAchievement } from '@/lib/achievements'

const PREGUNTAS = [
  {
    id: 0,
    pregunta: '¿Cuál es el porcentaje de aporte jubilatorio que el empleador retiene del sueldo bruto del trabajador?',
    opciones: ['8%', '11%', '14%', '16%'],
    correcta: 1,
    explicacion: 'La Ley 24.241 establece que el trabajador aporta el 11% al Sistema Integrado Previsional Argentino (SIPA). El empleador lo retiene del sueldo bruto y lo deposita en AFIP.',
  },
  {
    id: 1,
    pregunta: '¿Qué comprende el sueldo bruto?',
    opciones: [
      'Solo el sueldo básico según convenio colectivo',
      'El sueldo neto más los aportes del trabajador',
      'El básico más todos los conceptos remunerativos (antigüedad, presentismo, horas extra, adicionales)',
      'El sueldo básico después de restarle los descuentos de ley',
    ],
    correcta: 2,
    explicacion: 'El sueldo bruto es la suma de todos los conceptos remunerativos: básico de convenio + presentismo + antigüedad + horas extra + adicionales. Sobre él se calculan aportes y contribuciones.',
  },
  {
    id: 2,
    pregunta: 'Un empleado falta 1 día en el mes sin justificación. ¿Qué ocurre con su presentismo?',
    opciones: [
      'Pierde el presentismo en forma proporcional al día faltado',
      'Pierde la totalidad del presentismo del período',
      'Solo pierde el 50% del presentismo',
      'El presentismo no se ve afectado por 1 sola falta',
    ],
    correcta: 1,
    explicacion: 'El presentismo es un premio por asistencia perfecta: con cualquier falta injustificada en el período, el empleado pierde el 100% del concepto. No se descuenta en forma proporcional.',
  },
  {
    id: 3,
    pregunta: '¿Cómo se calcula el valor de una hora extra al 100%?',
    opciones: [
      'Valor hora normal × 1,25',
      'Valor hora normal × 1,5',
      'Valor hora normal × 2',
      'Valor hora normal × 0,5',
    ],
    correcta: 2,
    explicacion: 'LCT art. 201: horas extra al 50% → valor hora × 1,5 (días hábiles comunes). Horas extra al 100% → valor hora × 2 (días feriados o cuando ya se trabajaron 9 horas en el día).',
  },
  {
    id: 4,
    pregunta: '¿Qué es el formulario F.931?',
    opciones: [
      'El recibo de sueldo que firma el trabajador cada mes',
      'El libro de sueldos habilitado por el Ministerio de Trabajo',
      'La declaración jurada mensual que el empleador presenta ante AFIP con sueldos y cargas sociales',
      'El legajo personal del empleado con sus datos laborales',
    ],
    correcta: 2,
    explicacion: 'El F.931 (DDJJ del Sistema Único de la Seguridad Social) es la declaración mensual obligatoria. Informa sueldos pagados y liquida los aportes y contribuciones al sistema de seguridad social.',
  },
  {
    id: 5,
    pregunta: '¿Cuál es la diferencia entre aportes del trabajador y contribuciones patronales?',
    opciones: [
      'Son sinónimos; ambos términos se usan indistintamente',
      'Los aportes los paga el empleador; las contribuciones, el trabajador',
      'Los aportes se descuentan del sueldo del trabajador; las contribuciones son un costo adicional del empleador',
      'Ambos se descuentan directamente del sueldo neto del trabajador',
    ],
    correcta: 2,
    explicacion: 'Los aportes (jubilación 11%, obra social 3%, PAMI 3%, sindical ~2%) se retienen del sueldo del trabajador. Las contribuciones patronales (jubilación 16%, OS 6%, PAMI 2%, FNE 1,5%, ART variable) las paga el empleador encima del bruto.',
  },
  {
    id: 6,
    pregunta: '¿Qué Convenio Colectivo de Trabajo (CCT) regula el sector de la construcción en Argentina?',
    opciones: [
      'CCT 130/75 — Comercio (FAECyS)',
      'CCT 40/89 — Transporte de cargas (FedCam)',
      'CCT 122/75 — Sanidad (FATSA/ATSA)',
      'CCT 76/75 — Construcción (UOCRA/CAMARCO)',
    ],
    correcta: 3,
    explicacion: 'El CCT 76/75 es el acuerdo entre la Unión Obrera de la Construcción (UOCRA) y la Cámara Argentina de la Construcción (CAMARCO). Regula jornales, categorías (ayudante, oficial, oficial especializado) y condiciones del trabajo en construcción.',
  },
  {
    id: 7,
    pregunta: '¿Qué representa el costo laboral total para el empleador?',
    opciones: [
      'Solo el sueldo neto que percibe el trabajador',
      'El sueldo bruto del trabajador, sin ningún adicional',
      'El sueldo neto más los aportes del trabajador',
      'El sueldo bruto más las contribuciones patronales a cargo del empleador',
    ],
    correcta: 3,
    explicacion: 'Costo laboral = sueldo bruto + contribuciones patronales. Si el bruto es $1.000.000 y las contribuciones son ~27%, el costo laboral supera $1.270.000. Es lo que realmente "cuesta" un empleado al empleador.',
  },
]

const APROBACION = 6

interface Props {
  userId: string
  companyId: string | null
  yaAprobado: boolean
}

export default function ExamenClient({ userId, companyId, yaAprobado }: Props) {
  const supabase = createClient()
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [enviado, setEnviado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [trofeo, setTrofeo] = useState(yaAprobado)

  const totalRespondidas = Object.keys(respuestas).length
  const correctas = PREGUNTAS.filter(p => respuestas[p.id] === p.correcta).length
  const aprobado = correctas >= APROBACION

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (totalRespondidas < PREGUNTAS.length) return
    setEnviado(true)
    if (aprobado) {
      setGuardando(true)
      await unlockAchievement(supabase, userId, companyId, 'EXAMEN_APROBADO')
      setGuardando(false)
      setTrofeo(true)
    }
  }

  function handleReintentar() {
    setRespuestas({})
    setEnviado(false)
  }

  if (trofeo) {
    return <Diploma correctas={yaAprobado ? undefined : correctas} total={PREGUNTAS.length} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/gamificacion" className="text-slate-400 hover:text-slate-600 text-sm">← Mis logros</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium text-sm">Examen final</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Examen de conocimientos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Liquidación de sueldos · {PREGUNTAS.length} preguntas · Mínimo {APROBACION} correctas para aprobar
        </p>
      </div>

      <div className="edu-banner mb-6 text-xs">
        Leé cada pregunta con atención. Podés repasar el simulador antes de entregar.
        Al finalizar verás las respuestas correctas con explicaciones.
      </div>

      {!enviado ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {PREGUNTAS.map((p, idx) => (
            <div key={p.id} className="card">
              <p className="font-semibold text-sm text-slate-800 mb-3">
                <span className="text-slate-400 mr-2 font-normal">{idx + 1}.</span>
                {p.pregunta}
              </p>
              <div className="flex flex-col gap-2">
                {p.opciones.map((op, i) => (
                  <label
                    key={i}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                      respuestas[p.id] === i
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p-${p.id}`}
                      value={i}
                      checked={respuestas[p.id] === i}
                      onChange={() => setRespuestas(prev => ({ ...prev, [p.id]: i }))}
                      className="mt-0.5 shrink-0 accent-blue-600"
                    />
                    <span className="text-sm leading-snug">{op}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 pt-2">
            <button
              type="submit"
              disabled={totalRespondidas < PREGUNTAS.length}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg"
            >
              {totalRespondidas < PREGUNTAS.length
                ? `Respondé todas las preguntas (${totalRespondidas}/${PREGUNTAS.length})`
                : 'Entregar examen →'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className={`rounded-xl p-6 text-center ${aprobado ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="text-5xl mb-3">{aprobado ? '🎉' : '😅'}</div>
            <p className="text-3xl font-extrabold text-slate-800">{correctas} / {PREGUNTAS.length}</p>
            <p className={`text-sm font-semibold mt-1 ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
              {aprobado
                ? guardando ? 'Guardando tu logro...' : '¡Aprobado!'
                : `No aprobado — necesitás al menos ${APROBACION} correctas`}
            </p>
          </div>

          {PREGUNTAS.map((p, idx) => {
            const sel = respuestas[p.id]
            const ok = sel === p.correcta
            return (
              <div key={p.id} className={`card border-l-4 ${ok ? 'border-green-400' : 'border-red-400'}`}>
                <p className="font-semibold text-sm text-slate-800 mb-2">
                  <span className="mr-1">{ok ? '✅' : '❌'}</span>
                  <span className="text-slate-400 font-normal mr-1">{idx + 1}.</span>
                  {p.pregunta}
                </p>
                {!ok && (
                  <p className="text-xs text-red-600 mb-1">
                    Tu respuesta: <em>{p.opciones[sel]}</em>
                  </p>
                )}
                <p className="text-xs text-green-700 mb-2 font-medium">
                  ✓ Correcta: {p.opciones[p.correcta]}
                </p>
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
                  {p.explicacion}
                </p>
              </div>
            )
          })}

          {!aprobado && (
            <button
              onClick={handleReintentar}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              Reintentar examen
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Diploma({ correctas, total }: { correctas?: number; total?: number }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white text-center py-12 px-8">
        <div className="text-8xl mb-4 animate-bounce">🏆</div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">¡Felicitaciones!</h1>
        <p className="text-slate-600 text-base mb-1">Completaste el circuito completo de liquidación de sueldos</p>
        <p className="text-slate-600 text-base mb-6">y aprobaste el examen de conocimientos.</p>

        {correctas !== undefined && total !== undefined && (
          <div className="inline-block bg-amber-100 text-amber-800 font-bold px-6 py-2 rounded-full text-sm mb-6">
            Puntaje final: {correctas} / {total} ✨
          </div>
        )}

        <div className="border border-amber-200 rounded-xl p-5 mb-6 text-left bg-white/70">
          <p className="text-xs text-slate-400 uppercase tracking-wider text-center mb-3">Logro desbloqueado</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎓</span>
            <div>
              <p className="font-bold text-slate-800 text-base">Experto en Liquidación</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Demostraste dominio completo del proceso de liquidación de sueldos argentino:<br />
                CCT, básicos, aportes, contribuciones, F.931 y más.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/gamificacion"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Ver todos mis logros
          </Link>
          <Link
            href="/dashboard"
            className="border border-slate-200 text-slate-600 font-semibold px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Simulador educativo · Sueldos 360 · Escuela Técnica GAO
      </p>
    </div>
  )
}
