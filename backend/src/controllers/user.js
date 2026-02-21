// controllers/user.js

const bd = require('../models/profile');
const iaLimiter = require('../utils/iaLimiter');
const { signAccessToken, signRefreshToken } = require('../helpers/jwt');
const { setAuthCookies } = require('../helpers/authCookies');

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const SISTEMA_FIELD_CONFIGS = [
  { key: 'sintomas generales', desc: 'sintomas_generales_desc', estado: 'sintomas_generales_estado' },
  { key: 'endocrino', desc: 'endocrino_desc', estado: 'endocrino_estado' },
  { key: 'organos de los sentidos', desc: 'organos_sentidos_desc', estado: 'organos_sentidos_estado' },
  { key: 'gastrointestinal', desc: 'gastrointestinal_desc', estado: 'gastrointestinal_estado' },
  { key: 'respiratorio', desc: 'respiratorio_desc', estado: 'respiratorio_estado' },
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
      id_legado: toInt(dp.id_legado),
      fecha_legado: clean(toYMD(dp.fecha_legado)),
      recordatorio: clean(toYMD(dp.recordatorio)),
      recordatorio_desc: clean(dp.recordatorio_desc),
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
        apPayload.tiempo_inactivo_alc = clean(c.tiempo_inactivo_alc);
      } else if (tipo.includes('taba')) {
        apPayload.cigarrillos_por_dia = clean(c.cigarrillos_por_dia);
        apPayload.tiempo_activo_tab = clean(c.tiempo_activo_tab);
        apPayload.tiempo_inactivo_tab = clean(c.tiempo_inactivo_tab);
      } else if (tipo.includes('toxico')) {
        apPayload.tipo_toxicomania = clean(c.tipo_toxicomania);
        apPayload.tiempo_activo_tox = clean(c.tiempo_activo_tox);
        apPayload.tiempo_inactivo_tox = clean(c.tiempo_inactivo_tox);
      }
    }

    const alim = apRaw.alimentacion || {};
    apPayload.calidad = clean(alim.calidad);
    apPayload.alimentos_que_le_caen_mal = clean(alim.alimentos_que_le_caen_mal);
    apPayload.componentes_habituales_dieta = clean(alim.componentes_habituales_dieta);
    apPayload.desayuno = clean(alim.desayuno);
    apPayload.comida = clean(alim.comida);
    apPayload.cena = clean(alim.cena);
    apPayload.alimentos_que_le_caen_mal = clean(alim.alimentos_que_le_caen_mal);
    apPayload.componentes_habituales_dieta = clean(alim.componentes_habituales_dieta);
    apPayload.desayuno = clean(alim.desayuno);
    apPayload.comida = clean(alim.comida);
    apPayload.cena = clean(alim.cena);
    apPayload.hay_cambios = clean(alim.hay_cambios);
    apPayload.vacunas = clean(apRaw.vacunas);
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
      fecha_ultima_menstruacion: clean(goRaw.fecha_ultima_menstruacion),
      vida_sexual_activa: clean(goRaw.vida_sexual_activa),
      anticoncepcion: clean(goRaw.anticoncepcion),
      tipo_anticonceptivo: clean(goRaw.tipo_anticonceptivo),
      gestas: clean(goRaw.gestas),
      partos: clean(goRaw.partos),
      cesareas: clean(goRaw.cesareas),
      abortos: clean(goRaw.abortos),
      fecha_ultimo_parto: clean(goRaw.fecha_ultimo_parto),
      fecha_menopausia: clean(goRaw.fecha_menopausia),
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
      ta_mmhg: clean(efRaw.ta_mmhg),
      pam: clean(efRaw.pam),
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
    efPayload.lengua = clean(pick('lengua') ?? efRaw.lengua);
    efPayload.cuello = pick('cuello');
    const torax = areas.find((a) => {
      const n = (a?.nombre || '').toLowerCase();
      return n === 'tórax' || n === 'torax';
    });
    efPayload.torax = torax ? (torax.descripcion ?? null) : null;
    efPayload.abdomen = pick('abdomen');
    efPayload.genitales = pick('genitales');
    efPayload.extremidades = pick('extremidades');
    // Pulso se captura desde inspección_general (selector) y se guarda en columna dedicada.
    efPayload.pulso = clean(pick('pulso') ?? efRaw.pulso);

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

    // Construye pares { row, pers } por cada entrada cruda
	    const consPairs = consRaw.map((entry) => {
	      const row = {
	        fecha_consulta: clean(toYMD(entry?.fecha_consulta)),
	        recordatorio: clean(toYMD(entry?.recordatorio)),
	        fum: clean(norm(entry?.fum)),
	        historia_clinica: clean(entry?.historia_clinica),
	        padecimiento_actual: clean(entry?.padecimiento_actual),
	        diagnostico: clean(entry?.diagnostico),
	        medicamentos: clean(entry?.medicamentos),
	        tratamiento: clean(entry?.tratamiento),
	        notas: clean(entry?.notas),
        notas_evolucion: clean(entry?.notas_evolucion),
        oreja: clean(entry?.oreja),
        agua: clean(entry?.agua),
        laboratorios: clean(entry?.laboratorios),
        presion: clean(entry?.presion),
        glucosa: clean(entry?.glucosa),
        pam: clean(entry?.pam),
        peso: clean(entry?.peso),
        ejercicio: clean(entry?.ejercicio),
        desparacitacion: clean(entry?.desparacitacion),
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

      const persRaw = Array.isArray(entry?.personalizados) ? entry.personalizados : [];
      const pers = persRaw
        .map((it) => ({
          nombre: (it?.nombre ?? '').toString().trim(),
          descripcion: (it?.descripcion ?? '').toString().trim(),
          estado: (it?.estado ?? '').toString().trim(),
        }))
        .filter((it) => it.nombre.length > 0 || it.descripcion.length > 0);

      return { row, pers };
    });

    // Filtra entradas vacías (según lógica ya existente)
    const filtered = consPairs.filter(({ row }) =>
      Object.values(row).some((value) => value != null && value !== '')
    );
    const consItems = filtered.map(({ row }) => row);
    const persLists = filtered.map(({ pers }) => pers.filter((p) => p.nombre && p.nombre.trim().length > 0));

    const cons_result = await bd.replaceConsultas(id, consItems);

    // Reemplaza todos los personalizados del perfil y re-inserta por consulta recién creada
    await bd.deletePersonalizadosByPerfil(id);
    let pers_total = 0;
    const insertIds = Array.isArray(cons_result?.insertIds) ? cons_result.insertIds : [];
    for (let i = 0; i < insertIds.length; i++) {
      const cid = insertIds[i];
      const list = Array.isArray(persLists[i]) ? persLists[i] : [];
      if (!cid || list.length === 0) continue;
      const n = await bd.addPersonalizados(id, cid, list);
      pers_total += n;
    }

    return res.status(200).json({
      ok: true,
      id_perfil: id,
      perfil_actualizado: perfil_result?.affectedRows ?? 0,
      af_reemplazados: af_replaced,
      ap_upserted: ap_result?.affectedRows ?? 0,
      go_upserted: go_result?.affectedRows ?? 0,
      ef_upserted: ef_result?.affectedRows ?? 0,
      consultas_reemplazadas: cons_result?.inserted ?? 0,
      personalizados_reemplazados: pers_total,
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

// POST /cloneday
// Body: { source_date: 'YYYY-MM-DD', target_date: 'YYYY-MM-DD', events: [{ id_cita?, nombre, telefono, color, inicio_utc, fin_utc }] }
const cloneDay = async (req, res) => {
  try {
    const { source_date, target_date, events } = req.body || {};
    if (!source_date || !target_date) {
      return res.status(400).json({ ok: false, error: 'source_date y target_date son obligatorios' });
    }
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ ok: false, error: 'No hay eventos para clonar' });
    }

    const parseYMD = (value) => {
      if (!value) return null;
      const str = String(value).trim();
      const m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
      return new Date(y, mo - 1, d, 0, 0, 0, 0);
    };

    const srcDate = parseYMD(source_date);
    const dstDate = parseYMD(target_date);
    if (!srcDate || !dstDate) {
      return res.status(400).json({ ok: false, error: 'Formato de fecha inválido (use YYYY-MM-DD)' });
    }

    const dayDiffMs = dstDate.getTime() - srcDate.getTime();

    const addDaysKeepingTime = (raw) => {
      if (!raw) return null;
      const base = new Date(raw);
      if (Number.isNaN(base.getTime())) return null;
      const shifted = new Date(base.getTime() + dayDiffMs);
      return shifted;
    };

    const toNaiveLocal = (d) => {
      if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
      const pad = (v) => String(v).padStart(2, '0');
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      const ss = pad(d.getSeconds());
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
    };

    let created = 0;
    for (const ev of events) {
      const startShifted = addDaysKeepingTime(ev.inicio_utc || ev.start);
      const endShifted = addDaysKeepingTime(ev.fin_utc || ev.end || ev.inicio_utc);
      if (!startShifted || !endShifted) continue;
      const inicio_utc = toNaiveLocal(startShifted);
      const fin_utc = toNaiveLocal(endShifted);
      if (!inicio_utc || !fin_utc) continue;
      const nombre = ev.nombre || ev.title || 'Sin título';
      const telefono = ev.telefono || null;
      const color = ev.color || null;
      const r = await bd.addAppointment({ inicio_utc, fin_utc, nombre, telefono, color });
      if (r && r.id_cita) created += 1;
    }

    return res.status(201).json({ ok: true, created });
  } catch (err) {
    console.error('Error al clonar día:', err);
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
  const user = String(req.body?.username || req.body?.usuario || '').toLowerCase() || '-';
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
// Body: { username, password, pin } (compat: { usuario, contrasena, pin })
const login = (req, res) => {
  const username = req.body?.username ?? req.body?.usuario;
  const password = req.body?.password ?? req.body?.contrasena;
  const pin = req.body?.pin;

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

  if (!process.env.USER_NAME || !process.env.PASS || !process.env.PIN) {
    return res.status(500).json({ ok: false, error: 'Servidor mal configurado' });
  }

  // Validación de credenciales desde .env
  const ok = (
    username === process.env.USER_NAME &&
    password === process.env.PASS &&
    pin === process.env.PIN
  );

  if (ok) {
    // ✅ Éxito: resetea el historial de intentos
    loginAttempts.delete(key);
    try {
      const sub = username || 'admin';
      const accessToken = signAccessToken(sub);
      const refreshToken = signRefreshToken(sub);

      setAuthCookies(res, accessToken, refreshToken);
      return res.status(200).json({ ok: true, message: 'Inicio de sesión exitoso' });
    } catch (err) {
      if (err?.message === 'JWT_SECRET_MISSING') {
        return res.status(500).json({ ok: false, error: 'JWT_SECRET_MISSING' });
      }
      return res.status(500).json({ ok: false, error: 'Error al generar autenticación' });
    }
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

  return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
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
      id_legado: toInt(dp.id_legado),
      fecha_legado: clean(toYMD(dp.fecha_legado)),
      recordatorio: clean(toYMD(dp.recordatorio)),
      recordatorio_desc: clean(dp.recordatorio_desc),
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
        apPayload.tiempo_inactivo_alc = clean(c.tiempo_inactivo_alc);
      } else if (tipo.includes('taba')) {
        apPayload.cigarrillos_por_dia = clean(c.cigarrillos_por_dia);
        apPayload.tiempo_activo_tab = clean(c.tiempo_activo_tab);
        apPayload.tiempo_inactivo_tab = clean(c.tiempo_inactivo_tab);
      } else if (tipo.includes('toxico')) {
        apPayload.tipo_toxicomania = clean(c.tipo_toxicomania);
        apPayload.tiempo_activo_tox = clean(c.tiempo_activo_tox);
        apPayload.tiempo_inactivo_tox = clean(c.tiempo_inactivo_tox);
      }
    }

    // Alimentación
    const alim = apRaw.alimentacion || {};
    apPayload.calidad = clean(alim.calidad);
    apPayload.alimentos_que_le_caen_mal = clean(alim.alimentos_que_le_caen_mal);
    apPayload.componentes_habituales_dieta = clean(alim.componentes_habituales_dieta);
    apPayload.desayuno = clean(alim.desayuno);
    apPayload.comida = clean(alim.comida);
    apPayload.cena = clean(alim.cena);
    apPayload.hay_cambios = clean(alim.hay_cambios);
    apPayload.vacunas = clean(apRaw.vacunas);
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
      fecha_ultima_menstruacion: clean(goRaw.fecha_ultima_menstruacion),
      vida_sexual_activa: clean(goRaw.vida_sexual_activa),
      anticoncepcion: clean(goRaw.anticoncepcion),
      tipo_anticonceptivo: clean(goRaw.tipo_anticonceptivo),
      gestas: clean(goRaw.gestas),
      partos: clean(goRaw.partos),
      cesareas: clean(goRaw.cesareas),
      abortos: clean(goRaw.abortos),
      fecha_ultimo_parto: clean(goRaw.fecha_ultimo_parto),
      fecha_menopausia: clean(goRaw.fecha_menopausia),
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
    //       columnas de texto: cabeza, lengua, cuello, torax, abdomen, genitales, extremidades
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
      ta_mmhg: clean(efRaw.ta_mmhg),
      pam: clean(efRaw.pam),
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
    efPayload.lengua = clean(pick('lengua') ?? efRaw.lengua);
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
    // Pulso se captura desde inspección_general (selector) y se guarda en columna dedicada.
    efPayload.pulso = clean(pick('pulso') ?? efRaw.pulso);

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
      fum: clean(norm(consRaw.fum)),
      historia_clinica: clean(consRaw.historia_clinica),
      padecimiento_actual: clean(consRaw.padecimiento_actual),
      diagnostico: clean(consRaw.diagnostico),
      medicamentos: clean(consRaw.medicamentos),
      tratamiento: clean(consRaw.tratamiento),
      notas: clean(consRaw.notas),
      oreja: clean(consRaw.oreja),
      agua: clean(consRaw.agua),
      laboratorios: clean(consRaw.laboratorios),
      presion: clean(consRaw.presion),
      glucosa: clean(consRaw.glucosa),
      pam: clean(consRaw.pam),
      peso: clean(consRaw.peso),
      ejercicio: clean(consRaw.ejercicio),
      desparacitacion: clean(consRaw.desparacitacion),
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
    const id_consulta = cons_result?.insertId;

    // 7) personalizados (1:N) -> INSERT en `personalizados`
    //    - Viene dentro de body.consultas.personalizados [{ nombre, descripcion }]
    //    - Inserta una fila por cada elemento con nombre no vacío
    const persRaw = Array.isArray(body?.consultas?.personalizados)
      ? body.consultas.personalizados
      : [];
    const persItems = persRaw
      .map((it) => ({
        nombre: (it?.nombre ?? '').toString().trim(),
        descripcion: (it?.descripcion ?? '').toString().trim(),
      }))
      .filter((it) => it.nombre.length > 0);
    let personalizados_inserted = 0;
    if (id_consulta) {
      personalizados_inserted = await bd.addPersonalizados(id_perfil, id_consulta, persItems);
    }

    // Respuesta minimal con los ids/efectos clave para continuar el flujo
    return res.status(201).json({
      ok: true,
      id_perfil,
      af_inserted,
      ap_upserted: ap_result?.affectedRows ?? 0,
      go_upserted: go_result?.affectedRows ?? 0,
      ef_upserted: ef_result?.affectedRows ?? 0,
      cons_upserted: cons_result?.affectedRows ?? 0,
      id_consulta,
      personalizados_inserted,
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

// GET /profilepending - perfiles con recordatorio en tabla `perfil`
const getProfilePending = async (req, res) => {
  try {
    const items = await bd.getProfilesWithReminder();
    return res.status(200).json({ ok: true, items });
  } catch (err) {
    console.error('Error al obtener perfiles con recordatorio:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// POST /profile/postpone - limpia recordatorio de un perfil
const clearProfileReminder = async (req, res) => {
  try {
    const { id_perfil, id } = req.body || {};
    const targetId = Number(id_perfil ?? id);
    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({ ok: false, error: 'ID de perfil inválido' });
    }
    const result = await bd.clearPerfilReminder(targetId);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Perfil no encontrado' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error al limpiar recordatorio de perfil:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// POST /profile/:id/consultas/latest/historia-clinica
const saveLatestConsultaHistoriaClinica = async (req, res) => {
  try {
    const id = Number(req.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'ID de perfil inválido' });
    }

    const raw = req.body?.historia_clinica;
    const historia = typeof raw === 'string' ? raw.trim() : '';
    if (!historia) {
      return res.status(400).json({ ok: false, error: 'historia_clinica es obligatoria' });
    }

    const existing = await bd.getById(id);
    if (!existing || existing.ok === false) {
      return res.status(404).json({ ok: false, error: 'Perfil no encontrado' });
    }

    const result = await bd.updateLatestConsultaHistoriaClinica(id, historia);
    if (!result?.id_consulta) {
      return res.status(404).json({ ok: false, error: 'No hay consultas para actualizar' });
    }

    return res.status(200).json({
      ok: true,
      id_consulta: result.id_consulta,
      historia_clinica: historia,
    });
  } catch (err) {
    console.error('Error guardando historia clínica desde IA:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

// GET /limits - devuelve uso actual de IA
const getLimits = (req, res) => {
  try {
    const gemini = iaLimiter.getInfo('gemini');
    return res.status(200).json({ ok: true, month: gemini.month, gemini });
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
  getProfilePending,
  clearProfileReminder,
  getById,
  removeById,
  postpone,
  modify,
  createCalendar,
  updateCalendar,
  listCalendar,
  deleteCalendar,
  saveLatestConsultaHistoriaClinica,
  getLimits,
  cloneDay
};
