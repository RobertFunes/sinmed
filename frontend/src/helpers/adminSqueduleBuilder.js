// helpers/scheduleBuilder.js

/**
 * Transforma citas del backend (UTC) en eventos para react-big-calendar.
 *
 * Entrada (ejemplo de cada item):
 * {
 *   id_cita: 42,
 *   nombre: "Consulta Juan Pérez",
 *   telefono: "5512345678",
 *   inicio_utc: "2025-09-07T19:00:00.000Z", // o "2025-09-07 19:00:00" (UTC)
 *   fin_utc: "2025-09-07T19:45:00.000Z",
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
 *   start,      // Date (instante UTC mostrado en local por el localizer)
 *   end,        // Date
 *   ...extras   // nombre, telefono, notas, color, type, edad, raw, etc.
 * }
 */
export function scheduleBuilder(citas = []) {
  if (!Array.isArray(citas) || citas.length === 0) return [];

  // Convierte un string UTC a Date robustamente (acepta ISO con Z o "YYYY-MM-DD HH:MM:SS")
  const parseUtc = (s) => {
    if (!s || typeof s !== "string") return null;

    // ISO con Z o con T: Date lo entiende como UTC si trae 'Z'
    if (s.includes("T")) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    // Formato "YYYY-MM-DD HH:MM:SS" (asumir UTC)
    // Lo convertimos a "YYYY-MM-DDTHH:MM:SSZ"
    const parts = s.trim().split(" ");
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const iso = `${datePart}T${timePart}Z`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    }

    // Cualquier otra cosa, último intento directo
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const events = [];

  for (let i = 0; i < citas.length; i++) {
    const raw = citas[i] || {};
    const start = parseUtc(raw.inicio_utc);
    const end = parseUtc(raw.fin_utc);

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
      start,   // Date en UTC; el localizer del calendario lo mostrará en hora local
      end,     // Date en UTC
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