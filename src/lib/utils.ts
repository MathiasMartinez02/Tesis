import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInCalendarDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** Combina clases de Tailwind evitando conflictos */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatea fecha en español */
export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

/** Formatea fecha con hora */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es });
}

/** Tiempo relativo (ej: "hace 3 días") */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

// Dias de calendario desde hoy hasta la fecha (negativo si ya paso)
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInCalendarDays(d, new Date());
}

// Horas decimales a "Xh Ym" redondeando al minuto
export function formatFlightHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Texto de vencimiento: "vence en N días", "vence hoy" o "venció hace N días"
export function describeExpiry(date: string | Date): string {
  const days = daysUntil(date);
  if (days > 1) return `vence en ${days} días`;
  if (days === 1) return 'vence mañana';
  if (days === 0) return 'vence hoy';
  return days === -1 ? 'venció ayer' : `venció hace ${-days} días`;
}

// Fecha de hoy en hora local con formato yyyy-MM-dd
export function todayLocal(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Fecha ISO del backend a valor de input type=date
export function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}

/** Formatea moneda en ARS */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Genera siglas desde un nombre */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** Trunca texto */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/** Descarga un archivo desde blob */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const CSV_SEPARATOR = ';';
const UTF8_BOM = '﻿';

// Celda CSV segura: neutraliza formulas y entrecomilla si hace falta
export function csvEscape(value: string): string {
  const isNumber = /^-?\d+([.,]\d+)?$/.test(value);
  const safe = !isNumber && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (safe.includes(CSV_SEPARATOR) || /["\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

// Arma y descarga un CSV con separador ; (Excel en español) y BOM UTF-8
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const lines = [headers, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(CSV_SEPARATOR));
  const blob = new Blob([UTF8_BOM + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

