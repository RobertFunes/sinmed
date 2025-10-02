// controllers/user.js

const bd = require('../models/profile');
const iaLimiter = require('../utils/iaLimiter');

const SISTEMA_FIELD_CONFIGS = [
  { key: 'sintomas generales', desc: 'sintomas_generales_desc', estado: 'sintomas_generales_estado' },
  { key: 'endocrino', desc: 'endocrino_desc', estado: 'endocrino_estado' },
  { key: 'organos de los sentidos', desc: 'organos_sentidos_desc', estado: 'organos_sentidos_estado' },
  { key: 'gastrointestinal', desc: 'gastrointestinal_desc', estado: 'gastrointestinal_estado' },
  { key: 'cardiopulmonar', desc: 'cardiopulmonar_desc', estado: 'cardiopulmonar_estado' },
  { key: 'genitourinario', desc: 'genitourinario_desc', estado: 'genitourinario_estado' },
  { key: 'genital femenino', desc: 'genital_femenino_desc', estado: 'genital_femenino_estado' },
  { key: 'sexualidad', desc: 'sexualidad_desc', estado: 'sexualidad_estado' },
  { key: 'dermatologico', desc: 'dermatologico_desc', estado: 'dermatologico_estado' },
  { key: 'neurologico', desc: 'neurologico_desc', estado: 'neurologico_estado' },
  { key: 'hematologico', desc: 'hematologico_desc', estado: 'hematologico_estado' },
  { key: 'reumatologico', desc: 'reumatologico_desc', estado: 'reumatologico_estado' },
  { key: 'psiquiatrico', desc: 'psiquiatrico_desc', estado: 'psiquiatrico_estado' },
  { key: 'medicamentos', desc: 'medicamentos_desc', estado: 'medicamentos_estado' },
];

// POST /postpone { id_consulta }
const postpone = async (req, res) => {
  try {
    const { id_consulta } = req.body;
    const consultaId = Number(id_consulta);
    if (!Number.isInteger(consultaId) || consultaId <= 0) {
      return res.status(400).json({ error: 'ID de consulta inválido' });
    }

    const result = await bd.postponeContactDate(consultaId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    res.status(200).json({ msg: `Recordatorio eliminado para la consulta ${consultaId}` });
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
    const body = req.body || {};
    const idParam = Number(req.params?.id);
    const candidateIds = [
      body?.id_perfil,
      body?.id,
      body?.perfil_id,
      body?.datos_personales?.id_perfil,
      idParam,
    ];
    const id = candidateIds
      .map((value) => Number(value))
      .find((value) => Number.isInteger(value) && value > 0);

    if (!id) {
      return res.status(400).json({ error: 'ID de perfil inválido' });
    }

    if (Number.isInteger(idParam) && idParam > 0 && idParam !== id) {
      console.warn('[modify] ID de ruta difiere del payload:', { idParam, idPayload: id });
    }

    const existing = await bd.getById(id);
    if (!existing || existing.ok === false) {
      const code = existing?.error?.code;
      const message = existing?.error?.message || 'Perfil no encontrado';
      const status = code === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ error: message });
    }

    const clean = (v) => (v === '' || v == null ? null : v);
    const toYMD = (v) => (typeof v === 'string' && v.length >= 10 ? v.slice(0, 10) : null);
    const norm = (v) => (typeof v === 'string' ? v.trim() : v);

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
      alergico: clean(dp.alergico),
    };
    const perfil_result = await bd.updatePerfil(id, perfil);

    const afRaw = Array.isArray(body.antecedentes_familiares) ? body.antecedentes_familiares : [];
    const afItems = afRaw.map((it) => ({
      nombre: norm(it?.nombre) || null,
      descripcion: norm(it?.descripcion) || null,
    }));
    const af_replaced = await bd.replaceAntecedentesFamiliares(id, afItems);

    const apRaw = body.antecedentes_personales || {};
    const apPayload = {};
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

    const alim = apRaw.alimentacion || {};
    apPayload.calidad = clean(alim.calidad);
    apPayload.descripcion = clean(alim.descripcion);
    apPayload.hay_cambios = clean(alim.hay_cambios);
    if (apPayload.hay_cambios === 'Si') {
      apPayload.cambio_tipo = clean(alim.tipo);
      apPayload.cambio_causa = clean(alim.causa);
      apPayload.cambio_tiempo = clean(alim.tiempo);
    }
    const ap_result = await bd.upsertAntecedentesPersonales(id, apPayload);

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
    const go_result = await bd.upsertGinecoObstetricos(id, goPayload);

    const appRaw = Array.isArray(body.antecedentes_personales_patologicos)
      ? body.antecedentes_personales_patologicos
      : [];
    const appItems = appRaw.map((it) => ({
      antecedente: norm(it?.antecedente) || null,
      descripcion: norm(it?.descripcion) || null,
    }));
    const app_replaced = await bd.replaceAntecedentesPersonalesPatologicos(id, appItems);

    const efRaw = body.exploracion_fisica || {};
    const efPayload = {
      peso_actual: clean(efRaw.peso_actual),
      peso_anterior: clean(efRaw.peso_anterior),
      peso_deseado: clean(efRaw.peso_deseado),
      peso_ideal: clean(efRaw.peso_ideal),
      talla_cm: clean(efRaw.talla_cm),
      imc: clean(efRaw.imc),
      rtg: clean(efRaw.rtg),
      ta_mmhg: clean(efRaw.ta_mmhg),
      frecuencia_cardiaca: clean(efRaw.frecuencia_cardiaca),
      frecuencia_respiratoria: clean(efRaw.frecuencia_respiratoria),
      temperatura_c: clean(efRaw.temperatura_c),
      cadera_cm: clean(efRaw.cadera_cm),
      cintura_cm: clean(efRaw.cintura_cm),
    };
    const areas = Array.isArray(efRaw.inspeccion_general) ? efRaw.inspeccion_general : [];
    const pick = (name) => {
      const it = areas.find((a) => (a?.nombre || '').toLowerCase() === name);
      return it ? (it.descripcion ?? null) : null;
    };
    efPayload.cabeza = pick('cabeza');
    efPayload.cuello = pick('cuello');
    const torax = areas.find((a) => {
      const n = (a?.nombre || '').toLowerCase();
      return n === 'tórax' || n === 'torax';
    });
    efPayload.torax = torax ? (torax.descripcion ?? null) : null;
    efPayload.abdomen = pick('abdomen');
    efPayload.genitales = pick('genitales');
    efPayload.extremidades = pick('extremidades');

    const parseNum = (v) => (v == null || v === '' ? NaN : Number(v));
    const w = parseNum(efPayload.peso_actual);
    const hcm = parseNum(efPayload.talla_cm);
    if ((!efPayload.imc || efPayload.imc === '') && Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0) {
      const hm = hcm / 100;
      const bmi = w / (hm * hm);
      efPayload.imc = Number.isFinite(bmi) ? bmi.toFixed(2) : null;
    }
    const ef_result = await bd.upsertExploracionFisica(id, efPayload);

    const consRaw = Array.isArray(body.consultas) ? body.consultas : [];
    const strip = (s) => (typeof s === 'string' ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '');
    const mapNameToConfig = (raw) => {
      const k = strip(String(raw || '')).toLowerCase().trim();
      if (!k) return null;
      return SISTEMA_FIELD_CONFIGS.find((cfg) => cfg.key === k) || null;
    };

    const consItems = consRaw.map((entry) => {
      const row = {
        fecha_consulta: clean(toYMD(entry?.fecha_consulta)),
        recordatorio: clean(toYMD(entry?.recordatorio)),
        padecimiento_actual: clean(entry?.padecimiento_actual),
        diagnostico: clean(entry?.diagnostico),
        tratamiento: clean(entry?.tratamiento),
        notas: clean(entry?.notas),
      };
      const interrogatorio = Array.isArray(entry?.interrogatorio_aparatos)
        ? entry.interrogatorio_aparatos
        : [];
      for (const item of interrogatorio) {
        const config = mapNameToConfig(item?.nombre);
        if (!config) continue;
        if (config.desc) row[config.desc] = clean(item?.descripcion);
        if (config.estado) {
          if (item?.estado !== undefined) {
            row[config.estado] = clean(item?.estado);
          } else if (entry?.[config.estado] !== undefined) {
            row[config.estado] = clean(entry?.[config.estado]);
          }
        }
      }

      for (const cfg of SISTEMA_FIELD_CONFIGS) {
        if (!cfg.estado) continue;
        if (row[cfg.estado] !== undefined) continue;
        if (entry?.[cfg.estado] !== undefined) {
          row[cfg.estado] = clean(entry[cfg.estado]);
        }
      }
      return row;
    }).filter((row) => Object.values(row).some((value) => value != null && value !== ''));

    const cons_result = await bd.replaceConsultas(id, consItems);

    return res.status(200).json({
      ok: true,
      id_perfil: id,
      perfil_actualizado: perfil_result?.affectedRows ?? 0,
      af_reemplazados: af_replaced,
      ap_upserted: ap_result?.affectedRows ?? 0,
      go_upserted: go_result?.affectedRows ?? 0,
      ef_upserted: ef_result?.affectedRows ?? 0,
      consultas_reemplazadas: cons_result?.inserted ?? 0,
      app_reemplazados: app_replaced,
    });
  } catch (err) {
    console.error('Error al modificar perfil:', err);
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
      alergico: clean(dp.alergico),
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

    // ============================================================================
    // 6) exploracion_fisica -> UPSERT 1:1 en `exploracion_fisica`
    //     - Recibe valores básicos y un array inspeccion_general[] que mapeamos a
    //       columnas de texto: cabeza, cuello, torax, abdomen, genitales, extremidades
    //     - Si hay peso_actual y talla_cm, calculamos IMC (kg/m^2) con 2 decimales
    // ============================================================================
    const efRaw = body.exploracion_fisica || {};
    const efPayload = {
      peso_actual: clean(efRaw.peso_actual),
      peso_anterior: clean(efRaw.peso_anterior),
      peso_deseado: clean(efRaw.peso_deseado),
      peso_ideal: clean(efRaw.peso_ideal),
      talla_cm: clean(efRaw.talla_cm),
      imc: clean(efRaw.imc),
      rtg: clean(efRaw.rtg),
      ta_mmhg: clean(efRaw.ta_mmhg),
      frecuencia_cardiaca: clean(efRaw.frecuencia_cardiaca),
      frecuencia_respiratoria: clean(efRaw.frecuencia_respiratoria),
      temperatura_c: clean(efRaw.temperatura_c),
      cadera_cm: clean(efRaw.cadera_cm),
      cintura_cm: clean(efRaw.cintura_cm),
    };
    // Mapea inspeccion_general[] -> columnas específicas
    const areas = Array.isArray(efRaw.inspeccion_general) ? efRaw.inspeccion_general : [];
    const pick = (name) => {
      const it = areas.find((a) => (a?.nombre || '').toLowerCase() === name);
      return it ? (it.descripcion ?? null) : null;
    };
    efPayload.cabeza = pick('cabeza');
    efPayload.cuello = pick('cuello');
    // soporta "tórax" y "torax"
    const torax = areas.find((a) => {
      const n = (a?.nombre || '').toLowerCase();
      return n === 'tórax' || n === 'torax';
    });
    efPayload.torax = torax ? (torax.descripcion ?? null) : null;
    efPayload.abdomen = pick('abdomen');
    efPayload.genitales = pick('genitales');
    efPayload.extremidades = pick('extremidades');

    // Autocálculo de IMC si viene peso y talla (si no se calculó en front)
    const parseNum = (v) => (v == null || v === '' ? NaN : Number(v));
    const w = parseNum(efPayload.peso_actual);
    const hcm = parseNum(efPayload.talla_cm);
    if ((!efPayload.imc || efPayload.imc === '') && Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0) {
      const hm = hcm / 100;
      const bmi = w / (hm * hm);
      efPayload.imc = Number.isFinite(bmi) ? bmi.toFixed(2) : null;
    }

    const ef_result = await bd.upsertExploracionFisica(id_perfil, efPayload);

    // ============================================================================
    // 7) consultas -> UPSERT 1:1 en `consultas`
    //     - Base: fecha_consulta, recordatorio, padecimiento_actual, diagnostico,
    //       tratamiento, notas
    //     - Interrogatorio por sistemas (array) -> *_desc (estado se usa en modify)
    // ============================================================================
    const consRaw = body.consultas || {};
    const consPayload = {
      fecha_consulta: clean(toYMD(consRaw.fecha_consulta)),
      recordatorio: clean(toYMD(consRaw.recordatorio)),
      padecimiento_actual: clean(consRaw.padecimiento_actual),
      diagnostico: clean(consRaw.diagnostico),
      tratamiento: clean(consRaw.tratamiento),
      notas: clean(consRaw.notas),
    };
    const arr = Array.isArray(consRaw.interrogatorio_aparatos)
      ? consRaw.interrogatorio_aparatos
      : [];
    const strip = (s) => (typeof s === 'string' ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '');
    const mapNameToConfig = (raw) => {
      const k = strip(String(raw || '')).toLowerCase().trim();
      if (!k) return null;
      return SISTEMA_FIELD_CONFIGS.find((cfg) => cfg.key === k) || null;
    };
    for (const it of arr) {
      const config = mapNameToConfig(it?.nombre);
      if (!config) continue;
      if (config.desc) consPayload[config.desc] = clean(it?.descripcion);
      if (config.estado) {
        if (it?.estado !== undefined) {
          consPayload[config.estado] = clean(it?.estado);
        } else if (consRaw?.[config.estado] !== undefined) {
          consPayload[config.estado] = clean(consRaw[config.estado]);
        }
      }
    }

    for (const cfg of SISTEMA_FIELD_CONFIGS) {
      if (!cfg.estado) continue;
      if (consPayload[cfg.estado] !== undefined) continue;
      if (consRaw?.[cfg.estado] !== undefined) {
        consPayload[cfg.estado] = clean(consRaw[cfg.estado]);
      }
    }
    const cons_result = await bd.upsertConsultas(id_perfil, consPayload);

    // Respuesta minimal con los ids/efectos clave para continuar el flujo
    return res.status(201).json({
      ok: true,
      id_perfil,
      af_inserted,
      ap_upserted: ap_result?.affectedRows ?? 0,
      go_upserted: go_result?.affectedRows ?? 0,
      ef_upserted: ef_result?.affectedRows ?? 0,
      cons_upserted: cons_result?.affectedRows ?? 0,
      app_inserted,
    });
  } catch (err) {
    console.error('Error al agregar perfil:', err);
    return res.status(500).json({ error: err.message });
  }
}

/* LEGACY REMOVED: getAll
const getAll = async (req, res) => {
  try {
    const profiles = await bd.getAll();
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Error al obtener perfiles:', err);
  }
};
*/


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

// GET /limits - devuelve uso actual de IA
const getLimits = (req, res) => {
  try {
    const gemini = iaLimiter.getInfo('gemini');
    const image = iaLimiter.getInfo('image');
    return res.status(200).json({ ok: true, month: gemini.month, gemini, image });
  } catch (err) {
    console.error('[limits] error:', err);
    return res.status(500).json({ ok: false, error: 'No se pudo obtener limites' });
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


module.exports = {
  login,
  add,
  getSummary,
  getPending,
  getById,
  removeById,
  postpone,
  checkAuth,
  modify,
  createCalendar,
  updateCalendar,
  listCalendar,
  deleteCalendar,
  getLimits
};





