// helpers/scheduleBuilder.js

/**
 * Transforma citas del backend (fechas naive) en eventos para react-big-calendar.
 *
 * Entrada (ejemplo de cada item):
 * {
 *   id_cita: 42,
 *   nombre: "Consulta Juan Perez",
 *   telefono: "5512345678",
 *   inicio_utc: "2025-09-07 19:00:00",
 *   fin_utc: "2025-09-07 19:45:00",
 *   notas: "Traer estudios",
 *   color: "#2ECC71",
 *   type: "consulta",
 *   edad: 34
 * }
 *
 * Salida por item:
 * {
 *   id,         // number | string
 *   title,      // string
 *   start,      // Date interpretada en la zona local del navegador
 *   end,        // Date
 *   ...extras   // nombre, telefono, notas, color, type, edad, raw, etc.
 * }
 */
export function scheduleBuilder(citas = []) {
  if (!Array.isArray(citas) || citas.length === 0) return [];

  // Convierte un string naive (sin zona) a Date en la zona local del navegador
  const parseNaive = (s) => {
    if (!s) return null;
    if (s instanceof Date) {
      return Number.isNaN(s.getTime()) ? null : s;
    }
    const str = typeof s === 'string' ? s.trim() : '';
    if (!str) return null;
    let sanitized = str.replace('T', ' ');
    sanitized = sanitized.replace(/Z$/i, '');
    sanitized = sanitized.replace(/([+-]\d{2}:?\d{2})$/i, '');
    sanitized = sanitized.replace(/\.\d+$/, '');
    sanitized = sanitized.trim();
    const [datePart, timePart = '00:00:00'] = sanitized.split(' ');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart || '')) return null;
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour = 0, minute = 0, second = 0] = timePart.split(':').map((v) => Number(v || 0));
    if ([year, month, day, hour, minute, second].some((n) => Number.isNaN(n))) return null;
    const result = new Date(year, month - 1, day, hour, minute, second, 0);
    return Number.isNaN(result.getTime()) ? null : result;
  };

  const events = [];

  for (let i = 0; i < citas.length; i++) {
    const raw = citas[i] || {};
    const start = parseNaive(raw.inicio_utc);
    const end = parseNaive(raw.fin_utc);

    // Validación mínima: fechas válidas y rango positivo
    if (!start || !end || end <= start) continue;

    const id = raw.id_cita ?? i; // fallback estable
    const title = typeof raw.nombre === "string" && raw.nombre.trim().length > 0
      ? raw.nombre
      : "Sin título";

    // Pasa los metadatos útiles al evento para el modal/estilos
    const { nombre, telefono, notas, color, type, edad } = raw;

    events.push({
      id,
      title,
      start,   // Date interpretada en la zona del cliente
      end,     // Date interpretada en la zona del cliente
      // Extras opcionales para tu UI (no los usa react-big-calendar, pero tú sí)
      nombre,
      telefono: telefono ?? null,
      notas: notas ?? null,
      color: color ?? null,
      type: type ?? null,
      edad: typeof edad === "number" ? edad : null,
      raw      // por si necesitas el objeto original completo
    });
  }

  return events;
}