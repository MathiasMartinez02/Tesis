import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
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

/** Días hasta fecha */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

/** Formatea horas de vuelo */
export function formatFlightHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Formatea moneda en ARS */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Formatea número con separadores */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value);
}

/** Genera siglas desde un nombre */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/** Convierte status de urgencia en color */
export function getUrgencyColor(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'text-red-600 bg-red-50';
  if (daysUntilDue <= 7) return 'text-red-500 bg-red-50';
  if (daysUntilDue <= 30) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

/** Trunca texto */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/** Capitaliza primera letra */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Genera un ID único simple */
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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

/** Escapa un valor para insertarlo como celda CSV (envuelve en comillas si contiene comas, comillas o saltos de línea) */
export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Arma un CSV a partir de encabezados y filas y lo descarga en el navegador. Centraliza la lógica de exportación
// CSV usada en varias páginas (OT, Reportes) para no duplicar el escapado/armado de filas en cada una.
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvRows = rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(','));
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([`﻿${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/** Filtra objeto removiendo valores undefined/null */
export function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>;
}
