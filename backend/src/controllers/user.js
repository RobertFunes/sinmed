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
  modify
};

