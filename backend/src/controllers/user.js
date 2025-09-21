// controllers/user.js

const bd = require('../models/profile'); // 👈 Así, no db
const { isInvalidOrFuture } = require('../helpers/helpers');

// POST /postpone { id }
const postpone = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await bd.postponeContactDate(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json({ msg: `Contacto para ID ${id} pospuesto 45 días` });
  } catch (err) {
    console.error('Error al posponer contacto:', err);
    res.status(500).json({ error: err.message });
  }
};

// controllers/auth.js
const checkAuth = (req, res, next) => {
  const { auth } = req.cookies;
  if (auth === '1') {
    // ✅ Permite el paso a la siguiente función
    return next();
  } else {
    // 🚫 Detiene y responde error
    return res.status(401).json({ ok: false, error: '🚫 No autenticado' });
  }
};
const modify = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 🛑 Validación de ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID inválido 🚫' });
    }

    // 📅 Corrección de fecha inválida o futura
    const hoy = new Date().toISOString().split('T')[0];
    if (isInvalidOrFuture(data.ultima_fecha_contacto)) {
      data.ultima_fecha_contacto = hoy;
    }

    // 🔧 Ejecutamos la modificación
    const result = await bd.modifyClient(Number(id), data);

    // 🚫 Si no afectó filas, no existía el cliente
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado 🔍' });
    }

    // ✅ Éxito
    return res
      .status(200)
      .json({ msg: `Cliente con ID ${id} modificado correctamente ✏️` });
  } catch (err) {
    console.error('Error al modificar cliente:', err);
    return res.status(500).json({ error: err.message });
  }
};

// POST /calendar
// Body: { inicio_utc, fin_utc, nombre, telefono? } (horas naive, sin zona)
const createCalendar = async (req, res) => {
  try {
    const { inicio_utc, fin_utc, nombre, telefono, color } = req.body || {};
    if (!inicio_utc || !fin_utc || !nombre) {
      return res.status(400).json({ ok: false, error: 'inicio_utc, fin_utc y nombre son obligatorios' });
    }

    const result = await bd.addAppointment({ inicio_utc, fin_utc, nombre, telefono, color });
    return res.status(201).json({ ok: true, id_cita: result.id_cita });
  } catch (err) {
    console.error('Error al crear cita:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

const updateCalendar = async (req, res) => {
  try {
    const { id_cita, id, inicio_utc, fin_utc, nombre, telefono, color } = req.body || {};
    const targetId = Number(id_cita ?? id);
    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({ ok: false, error: 'ID de cita invalido' });
    }
    if (!inicio_utc || !fin_utc || !nombre) {
      return res.status(400).json({ ok: false, error: 'inicio_utc, fin_utc y nombre son obligatorios' });
    }

    const result = await bd.updateAppointment({ id_cita: targetId, inicio_utc, fin_utc, nombre, telefono, color });
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error al actualizar cita:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// GET /calendar
// Devuelve todas las citas registradas
const listCalendar = async (_req, res) => {
  try {
    const items = await bd.listAppointments();
    return res.status(200).json({ ok: true, items });
  } catch (err) {
    console.error('Error al listar citas:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

const deleteCalendar = async (req, res) => {
  try {
    const id = Number(req.params?.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: 'ID de cita inválido' });
    }

    const result = await bd.deleteAppointment(id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Cita no encontrada' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Limitador simple de intentos de login (memoria local)
// Clave: combinación IP + usuario para evitar bombardeo sostenido
const loginAttempts = new Map(); // key -> { count, first, blockedUntil }
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_FAILED = 5;             // máx. intentos fallidos por ventana
const BLOCK_MS = 15 * 60 * 1000;  // tiempo de bloqueo tras superar el límite
const CLEANUP_MS = 5 * 60 * 1000; // cada cuánto limpiar entradas viejas

function keyFromReq(req) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const user = String(req.body?.usuario || '').toLowerCase() || '-';
  return `${ip}|${user}`;
}

// Limpieza periódica para no acumular registros inútiles
try {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of loginAttempts.entries()) {
      const reference = v.blockedUntil || v.first || 0;
      // elimina entradas más antiguas de 60 minutos desde su último evento
      if (now - reference > 60 * 60 * 1000) {
        loginAttempts.delete(k);
      }
    }
  }, CLEANUP_MS);
  // en Node, unref evita que este timer mantenga el proceso vivo
  if (typeof t.unref === 'function') t.unref();
} catch (_) {
  // noop si el entorno no soporta unref
}

// POST /login
// Body: { usuario, contrasena, pin }
const login = (req, res) => {
  const { usuario, contrasena, pin } = req.body || {};

  const now = Date.now();
  const key = keyFromReq(req);
  const entry = loginAttempts.get(key);

  // Si está bloqueado, rechazamos inmediatamente
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return res
      .status(429)
      .json({ ok: false, error: 'Demasiados intentos. Intenta más tarde.', retryAfterSeconds: retryAfter });
  }

  // Validación de credenciales desde .env
  const ok = (
    usuario === process.env.USER_NAME &&
    contrasena === process.env.PASS &&
    pin === process.env.PIN
  );

  if (ok) {
    // ✅ Éxito: resetea el historial de intentos
    loginAttempts.delete(key);

    return res
      .cookie('auth', '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 4 * 30 * 24 * 60 * 60 * 1000 // ~4 meses
      })
      .json({ ok: true, message: '✅ Autenticado!' });
  }

  // ❌ Fallo: incrementa contador dentro de la ventana y aplica bloqueo si corresponde
  let next = entry;
  if (!next || (now - (next.first || 0)) > WINDOW_MS) {
    next = { count: 0, first: now, blockedUntil: null };
  }
  next.count += 1;
  if (next.count >= MAX_FAILED) {
    next.blockedUntil = now + BLOCK_MS;
    // reinicia contador/ventana para que, al terminar el bloqueo, vuelva limpia
    next.count = 0;
    next.first = now;
  }
  loginAttempts.set(key, next);

  return res.status(401).json({ ok: false, error: '❌ Usuario o PIN incorrectos' });
};
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const cliente = await bd.getById(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.status(200).json(cliente);
  } catch (err) {
    console.error('Error al obtener cliente por ID:', err);
    res.status(500).json({ error: err.message });
  }
};

const add = async (req, res) => {
  try {
    const payload = req.body || {};
    const dp = payload.datos_personales || {};

    // Normaliza: trim a strings y '' -> null
    const normalize = (v) => {
      if (v == null) return v;
      if (typeof v === 'string') {
        const t = v.trim();
        return t === '' ? null : t;
      }
      return v;
    };

    // Whitelist de campos permitidos en tabla `perfil`
    const allowed = [
      'nombre',
      'fecha_nacimiento',
      'genero',
      'telefono_movil',
      'correo_electronico',
      'residencia',
      'ocupacion',
      'escolaridad',
      'estado_civil',
      'tipo_sangre',
      'referido_por',
    ];

    // Construye objeto de inserción solo con llaves presentes
    const record = {};
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(dp, k)) {
        record[k] = normalize(dp[k]);
      }
    }

    // Validación: nombre obligatorio
    const nombre = normalize(dp.nombre);
    if (!nombre) {
      return res.status(400).json({ ok: false, error: 'El campo nombre es obligatorio' });
    }
    record.nombre = nombre; // asegura que nombre normalizado esté presente

    // Inserta perfil y obtiene id_perfil
    const id = await bd.add(record);

    // Inserta antecedentes_familiares si llegaron
    const lista = Array.isArray(payload.antecedentes_familiares)
      ? payload.antecedentes_familiares
      : [];
    if (lista.length > 0) {
      const norm = (v) => {
        if (v == null) return v;
        if (typeof v === 'string') {
          const t = v.trim();
          return t === '' ? null : t;
        }
        return v;
      };
      const items = lista.map((a) => ({
        nombre: norm(a?.nombre),
        descripcion: norm(a?.descripcion),
      }));
      await bd.addAntecedentesFamiliares(id, items);
    }

    // Inserta/actualiza antecedentes_personales (1:1) si hay datos
    const gineco = payload.gineco_obstetricos || {};
    const ap = payload.antecedentes_personales || {};
    const norm = (v) => {
      if (v == null) return v;
      if (typeof v === 'string') {
        const t = v.trim();
        return t === '' ? null : t;
      }
      return v;
    };
    const recordGO = {
      edad_primera_menstruacion: null,
      ciclo_dias: null,
      cantidad: null,
      dolor: null,
      fecha_ultima_menstruacion: null,
      vida_sexual_activa: null,
      anticoncepcion: null,
      tipo_anticonceptivo: null,
      gestas: null,
      partos: null,
      cesareas: null,
      abortos: null,
      fecha_ultimo_parto: null,
      fecha_menopausia: null,
    };

    const recordAP = {
      bebidas_por_dia: null,
      tiempo_activo_alc: null,
      cigarrillos_por_dia: null,
      tiempo_activo_tab: null,
      tipo_toxicomania: null,
      tiempo_activo_tox: null,
      calidad: null,
      descripcion: null,
      hay_cambios: null,
      cambio_tipo: null,
      cambio_causa: null,
      cambio_tiempo: null,
    };

    // Habitos: toma el primero por tipo si existe
    if (Array.isArray(ap.habitos)) {
      const byTipo = (t) => ap.habitos.find((h) => h?.tipo === t);
      const alc = byTipo('Alcoholismo');
      const tab = byTipo('Tabaquismo');
      const tox = byTipo('Toxicomanías') || byTipo('Toxicomanias');
      if (alc) {
        recordAP.bebidas_por_dia = norm(alc.campos?.bebidas_por_dia);
        recordAP.tiempo_activo_alc = norm(alc.campos?.tiempo_activo_alc);
      }
      if (tab) {
        recordAP.cigarrillos_por_dia = norm(tab.campos?.cigarrillos_por_dia);
        recordAP.tiempo_activo_tab = norm(tab.campos?.tiempo_activo_tab);
      }
      if (tox) {
        recordAP.tipo_toxicomania = norm(tox.campos?.tipo_toxicomania);
        recordAP.tiempo_activo_tox = norm(tox.campos?.tiempo_activo_tox);
      }
    }

    // Alimentación
    if (ap.alimentacion && typeof ap.alimentacion === 'object') {
      const al = ap.alimentacion;
      recordAP.calidad = norm(al.calidad);
      recordAP.descripcion = norm(al.descripcion);
      recordAP.hay_cambios = norm(al.hay_cambios);
      if (recordAP.hay_cambios === 'Si') {
        recordAP.cambio_tipo = norm(al.tipo);
        recordAP.cambio_causa = norm(al.causa);
        recordAP.cambio_tiempo = norm(al.tiempo);
      }
    }

    const toInt = (value) => {
      const normalized = norm(value);
      if (normalized == null) return null;
      const n = Number(normalized);
      return Number.isFinite(n) ? n : null;
    };
    const toDate = (value) => {
      const normalized = norm(value);
      return normalized ? normalized.slice(0, 10) : null;
    };

    if (gineco && typeof gineco === 'object') {
      recordGO.edad_primera_menstruacion = norm(gineco.edad_primera_menstruacion);
      recordGO.ciclo_dias = norm(gineco.ciclo_dias);
      recordGO.cantidad = norm(gineco.cantidad);
      recordGO.dolor = norm(gineco.dolor);
      recordGO.fecha_ultima_menstruacion = toDate(gineco.fecha_ultima_menstruacion);
      recordGO.vida_sexual_activa = norm(gineco.vida_sexual_activa);
      recordGO.anticoncepcion = norm(gineco.anticoncepcion);
      recordGO.tipo_anticonceptivo = norm(gineco.tipo_anticonceptivo);
      recordGO.gestas = toInt(gineco.gestas);
      recordGO.partos = toInt(gineco.partos);
      recordGO.cesareas = toInt(gineco.cesareas);
      recordGO.abortos = toInt(gineco.abortos);
      recordGO.fecha_ultimo_parto = toDate(gineco.fecha_ultimo_parto);
      recordGO.fecha_menopausia = toDate(gineco.fecha_menopausia);
    }

    // Quita claves que quedaron null para no insertar basura
    const compactAP = Object.fromEntries(
      Object.entries(recordAP).filter(([, v]) => v != null)
    );
    if (Object.keys(compactAP).length > 0) {
      await bd.upsertAntecedentesPersonales(id, compactAP);
    }

    const compactGO = Object.fromEntries(
      Object.entries(recordGO).filter(([, v]) => v != null)
    );
    if (Object.keys(compactGO).length > 0) {
      await bd.upsertGinecoObstetricos(id, compactGO);
    }

    // Inserta antecedentes_personales_patologicos (1:N) si llegaron
    const app = Array.isArray(payload.antecedentes_personales_patologicos)
      ? payload.antecedentes_personales_patologicos
      : [];
    if (app.length > 0) {
      const normalize = (v) => {
        if (v == null) return v;
        if (typeof v === 'string') {
          const t = v.trim();
          return t === '' ? null : t;
        }
        return v;
      };
      const itemsAPP = app.map((p) => ({
        antecedente: normalize(p?.antecedente),
        descripcion: normalize(p?.descripcion),
      }));
      await bd.addAntecedentesPersonalesPatologicos(id, itemsAPP);
    }

    // 1:1 padecimiento_actual_interrogatorio
    // Si no hay datos útiles, no insertes nada
    const pe = payload.padecimiento_e_interrogatorio || {};
    const pa = normalize(pe.padecimiento_actual);
    const interrogatorio = Array.isArray(pe.interrogatorio_aparatos)
      ? pe.interrogatorio_aparatos
      : [];

    // Mapeo de nombre -> columna (normalizado sin acentos)
    const mapCols = {
      'sintomas generales': 'sintomas_generales',
      'endocrino': 'endocrino',
      'organos de los sentidos': 'organos_sentidos',
      'gastrointestinal': 'gastrointestinal',
      'cardiopulmonar': 'cardiopulmonar',
      'genitourinario': 'genitourinario',
      'genital femenino': 'genital_femenino',
      'sexualidad': 'sexualidad',
      'dermatologico': 'dermatologico',
      'neurologico': 'neurologico',
      'hematologico': 'hematologico',
      'reumatologico': 'reumatologico',
      'psiquiatrico': 'psiquiatrico',
      'medicamentos': 'medicamentos',
    };
    const normName = (s) => {
      if (!s || typeof s !== 'string') return '';
      return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    };

    const recordPI = {};
    if (pa != null) {
      recordPI.padecimiento_actual = pa;
    }
    for (const it of interrogatorio) {
      const nombre = normName(it?.nombre || '');
      const col = mapCols[nombre];
      if (!col) continue; // ignora nombres desconocidos
      const desc = normalize(it?.descripcion);
      if (desc != null) {
        recordPI[col] = desc;
      }
    }

    if (Object.keys(recordPI).length > 0) {
      await bd.upsertPadecimientoActualInterrogatorio(id, recordPI);
    }

    // 1:1 exploracion_fisica
    const ef = payload.exploracion_fisica || {};
    const allowedEF = [
      'peso_actual',
      'peso_anterior',
      'peso_deseado',
      'peso_ideal',
      'talla_cm',
      'imc',
      'rtg',
      'ta_mmhg',
      'pulso',
      'frecuencia_cardiaca',
      'frecuencia_respiratoria',
      'temperatura_c',
      'cadera_cm',
      'cintura_cm',
    ];
    const recordEF = {};
    for (const k of allowedEF) {
      if (Object.prototype.hasOwnProperty.call(ef, k)) {
        const v = normalize(ef[k]);
        if (v != null) recordEF[k] = v;
      }
    }

    // Inspección general -> columnas específicas
    const mapIG = {
      'cabeza': 'cabeza',
      'cuello': 'cuello',
      'torax': 'torax',
      'abdomen': 'abdomen',
      'genitales': 'genitales',
      'extremidades': 'extremidades',
    };
    const normNameIG = (s) => {
      if (!s || typeof s !== 'string') return '';
      return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    };
    const ig = Array.isArray(ef.inspeccion_general) ? ef.inspeccion_general : [];
    for (const it of ig) {
      const nombre = normNameIG(it?.nombre || '');
      // normaliza tórax -> torax
      const key = nombre === 'torax' || nombre === 'tórax' ? 'torax' : nombre;
      const col = mapIG[key];
      if (!col) continue;
      const desc = normalize(it?.descripcion);
      if (desc != null) recordEF[col] = desc;
    }

    if (Object.keys(recordEF).length > 0) {
      await bd.upsertExploracionFisica(id, recordEF);
    }

    // 1:1 diagnostico_tratamiento
    const dt = payload.diagnostico_y_tratamiento || {};
    const allowedDT = ['diagnostico', 'tratamiento', 'pronostico', 'notas'];
    const recordDT = {};
    for (const k of allowedDT) {
      if (Object.prototype.hasOwnProperty.call(dt, k)) {
        const v = normalize(dt[k]);
        if (v != null) recordDT[k] = v;
      }
    }
    if (Object.keys(recordDT).length > 0) {
      await bd.upsertDiagnosticoTratamiento(id, recordDT);
    }

    return res.status(201).json({ success: true, id_perfil: id });
  } catch (err) {
    console.error('Error en ADD perfil:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

const getAll = async (req, res) => {
  try {
    const profiles = await bd.getAll();
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Error al obtener perfiles:', err);
  }
};


const getSummary = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);
    const offset = (page - 1) * limit;

    const { rows, total } = await bd.getSummary(limit, offset);
    console.log('✅ Resumen de perfiles listo:', rows.length, 'de', total);
    res.status(200).json({ profiles: rows, total });
  } catch (err) {
    console.error('💥 Error al obtener resumen:', err);
    res.status(500).json({ error: err.message });
  }
};
const getPending = async (req, res) => {
  try {
    const pending = await bd.getPending();
    res.status(200).json(pending);
  } catch (err) {
    console.error('Error al obtener pendientes:', err);
    res.status(500).json({ error: err.message });
  }
};
const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verifica si existe antes de borrar (opcional pero pro)
    const cliente = await bd.getById(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await bd.removeById(id);
      res.status(200).json({ msg: `Cliente con ID ${id} eliminado` });
  } catch (err) {
      console.error('Error al eliminar cliente:', err);
      res.status(500).json({ error: err.message });
  }
};
const getNameMin = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // 🔎 función minimal en el modelo:
    // async function getNameById(id) {
    //   const [rows] = await db.query('SELECT id_cliente, nombre FROM clientes WHERE id_cliente = ?', [id]);
    //   return rows?.[0] || null;
    // }

    const row = await bd.getNameById(id);
    if (!row) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // 👇 cache cortito para que el front no te bombardee
    res.set('Cache-Control', 'public, max-age=30');

    return res.status(200).json({
      id: row.id_cliente,      // normaliza llave de salida
      nombre: row.nombre
    });
  } catch (err) {
    console.error('Error en getNameMin:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  login,
  add,
  getAll,
  getSummary,
  getNameMin,
  getPending,
  getById,
  removeById,
  postpone,
  checkAuth,
  modify,
  createCalendar,
  updateCalendar,
  listCalendar,
  deleteCalendar
};

