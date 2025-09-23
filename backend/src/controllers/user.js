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
    // =====================
    // 0) Payload de entrada
    // =====================
    // El front envía un objeto con varias secciones anidadas:
    // - datos_personales
    // - antecedentes_familiares
    // - antecedentes_personales
    const body = req.body || {};

    // Utilidades de normalización
    const clean = (v) => (v === '' || v == null ? null : v);
    const toYMD = (v) => (typeof v === 'string' && v.length >= 10 ? v.slice(0, 10) : null);
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);

    // ==================================================
    // 1) datos_personales -> INSERT en tabla `perfil`
    //     - Guarda el perfil base y obtenemos id_perfil
    //     - Campos vacíos -> NULL; nombre por defecto si falta
    // ==================================================
    const dp = body.datos_personales || {};
    const perfil = {
      nombre: dp.nombre && String(dp.nombre).trim() ? dp.nombre.trim() : 'Sin nombre',
      fecha_nacimiento: clean(toYMD(dp.fecha_nacimiento)),
      genero: clean(dp.genero),
      telefono_movil: clean(dp.telefono_movil),
      correo_electronico: clean(dp.correo_electronico),
      residencia: clean(dp.residencia),
      ocupacion: clean(dp.ocupacion),
      escolaridad: clean(dp.escolaridad),
      estado_civil: clean(dp.estado_civil),
      tipo_sangre: clean(dp.tipo_sangre),
      referido_por: clean(dp.referido_por),
    };
    const id_perfil = await bd.add(perfil); // id del perfil recién creado

    // ==================================================================
    // 2) antecedentes_familiares -> INSERT 1:N en `antecedentes_familiares`
    //     - Inserta una fila por cada elemento del array (si tiene nombre)
    // ==================================================================
    const afRaw = Array.isArray(body.antecedentes_familiares) ? body.antecedentes_familiares : [];
    const afItems = afRaw.map((it) => ({
      nombre: norm(it?.nombre) || null,
      descripcion: norm(it?.descripcion) || null,
    }));
    const af_inserted = await bd.addAntecedentesFamiliares(id_perfil, afItems);

    // ============================================================================
    // 3) antecedentes_personales -> UPSERT 1:1 en `antecedentes_personales`
    //     - Habitos (alcohol, tabaco, toxicomanías) mapean a columnas específicas
    //     - Alimentación (calidad/descripcion/hay_cambios y cambios si aplica)
    // ============================================================================
    const apRaw = body.antecedentes_personales || {};
    const apPayload = {};

    // Hábitos -> columnas dedicadas
    const habitos = Array.isArray(apRaw.habitos) ? apRaw.habitos : [];
    for (const h of habitos) {
      const tipo = (h?.tipo || '').trim().toLowerCase();
      const c = h?.campos || {};
      if (tipo.startsWith('alcohol')) {
        apPayload.bebidas_por_dia = clean(c.bebidas_por_dia);
        apPayload.tiempo_activo_alc = clean(c.tiempo_activo_alc);
      } else if (tipo.includes('taba')) {
        apPayload.cigarrillos_por_dia = clean(c.cigarrillos_por_dia);
        apPayload.tiempo_activo_tab = clean(c.tiempo_activo_tab);
      } else if (tipo.includes('toxico')) {
        apPayload.tipo_toxicomania = clean(c.tipo_toxicomania);
        apPayload.tiempo_activo_tox = clean(c.tiempo_activo_tox);
      }
    }

    // Alimentación
    const alim = apRaw.alimentacion || {};
    apPayload.calidad = clean(alim.calidad);
    apPayload.descripcion = clean(alim.descripcion);
    apPayload.hay_cambios = clean(alim.hay_cambios);
    if (apPayload.hay_cambios === 'Si') {
      apPayload.cambio_tipo = clean(alim.tipo);
      apPayload.cambio_causa = clean(alim.causa);
      apPayload.cambio_tiempo = clean(alim.tiempo);
    }
    const ap_result = await bd.upsertAntecedentesPersonales(id_perfil, apPayload);

    // ============================================================================
    // 4) gineco_obstetricos -> UPSERT 1:1 en `gineco_obstetricos`
    //     - Solo fechas a YYYY-MM-DD; vacíos -> NULL
    // ============================================================================
    const goRaw = body.gineco_obstetricos || {};
    const goPayload = {
      edad_primera_menstruacion: clean(goRaw.edad_primera_menstruacion),
      ciclo_dias: clean(goRaw.ciclo_dias),
      cantidad: clean(goRaw.cantidad),
      dolor: clean(goRaw.dolor),
      fecha_ultima_menstruacion: clean(toYMD(goRaw.fecha_ultima_menstruacion)),
      vida_sexual_activa: clean(goRaw.vida_sexual_activa),
      anticoncepcion: clean(goRaw.anticoncepcion),
      tipo_anticonceptivo: clean(goRaw.tipo_anticonceptivo),
      gestas: clean(goRaw.gestas),
      partos: clean(goRaw.partos),
      cesareas: clean(goRaw.cesareas),
      abortos: clean(goRaw.abortos),
      fecha_ultimo_parto: clean(toYMD(goRaw.fecha_ultimo_parto)),
      fecha_menopausia: clean(toYMD(goRaw.fecha_menopausia)),
    };
    const go_result = await bd.upsertGinecoObstetricos(id_perfil, goPayload);

    // ============================================================================
    // 5) antecedentes_personales_patologicos -> INSERT 1:N
    //     - Inserta una fila por cada elemento con antecedente válido
    // ============================================================================
    const appRaw = Array.isArray(body.antecedentes_personales_patologicos)
      ? body.antecedentes_personales_patologicos
      : [];
    const appItems = appRaw.map((it) => ({
      antecedente: norm(it?.antecedente) || null,
      descripcion: norm(it?.descripcion) || null,
    }));
    const app_inserted = await bd.addAntecedentesPersonalesPatologicos(id_perfil, appItems);

    // Respuesta minimal con los ids/efectos clave para continuar el flujo
    return res.status(201).json({
      ok: true,
      id_perfil,
      af_inserted,
      ap_upserted: ap_result?.affectedRows ?? 0,
      go_upserted: go_result?.affectedRows ?? 0,
      app_inserted,
    });
  } catch (err) {
    console.error('Error al agregar perfil:', err);
    return res.status(500).json({ error: err.message });
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


