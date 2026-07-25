// src/shared/utils/date.ts

/** Devuelve la parte de fecha (YYYY-MM-DD) de un ISO string o Date. */
export function toDateKey(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Clave de fecha de hoy (YYYY-MM-DD). */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Formatea una fecha ISO a un texto corto legible (es-CO). */
export function formatDate(value?: string | null): string {
  if (!value) {
    return 'Sin fecha';
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return 'Sin fecha';
  }
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
