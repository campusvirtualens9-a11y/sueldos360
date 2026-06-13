import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(2)}%`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatPeriodo(periodo: string): string {
  const [year, month] = periodo.split('-')
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${months[parseInt(month) - 1]} ${year}`
}

export function getCurrentPeriodo(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function calcularAntiguedadAnios(fechaIngreso: string): number {
  const ingreso = new Date(fechaIngreso)
  const hoy = new Date()
  const diff = hoy.getFullYear() - ingreso.getFullYear()
  const m = hoy.getMonth() - ingreso.getMonth()
  return m < 0 || (m === 0 && hoy.getDate() < ingreso.getDate()) ? diff - 1 : diff
}

export function getDaysInMonth(periodo: string): number {
  const [year, month] = periodo.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
