const db = require('../models/db');

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(str) {
  return normalize(str).replace(/[\s.-]/g, '');
}

const ALLOWED = {
  perfil: {
    table: 'perfil',
    fields: {
      name:   { column: 'nombre',         type: 'text' },
      id:     { column: 'id_perfil',      type: 'id'   },
      number: { column: 'telefono_movil', type: 'id'   }
    }
  }
};

async function search(req, res) {
  try {
    const allowedParams = new Set(['type', 'field', 'q', 'limit']);
    for (const k of Object.keys(req.query)) {
      if (!allowedParams.has(k)) {
        return res.status(400).json({ ok: false, error: `Parámetro no permitido: ${k}` });
      }
    }

    const { type, field, q } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 20);

    if (!type || !field || q == null) {
      return res.status(400).json({ ok: false, error: 'Parámetros requeridos: type, field, q' });
    }
    if (!q.trim()) {
      return res.status(400).json({ ok: false, error: 'q no puede estar vacío' });
    }

    const cfgType = ALLOWED[type];
    if (!cfgType) {
      return res.status(400).json({ ok: false, error: 'type inválido' });
    }
    const cfgField = cfgType.fields[field];
    if (!cfgField) {
      return res.status(400).json({ ok: false, error: 'field inválido' });
    }

    const qNorm = normalize(q);
    const qCompact = compact(q);
    const isNumericQ = /^[0-9]+$/.test(qCompact);

    console.log('[search]', { ip: req.ip, type, field });

    let sql = '';
    let params = [];

    // Solo búsqueda de perfiles en tabla `perfil`
    // Alias updated_at para mantener tu ordenamiento
    sql = `
      SELECT
        id_perfil,
        nombre,
        telefono_movil,
        fecha_nacimiento,
        creado,
        actualizado,
        COALESCE(actualizado, creado, fecha_nacimiento, '1970-01-01') AS updated_at
      FROM perfil
    `;
    if (field === 'name') {
      sql += ' WHERE nombre COLLATE utf8mb4_general_ci LIKE ?';
      params = [`%${qNorm}%`];
    } else if (field === 'id') {
      sql += ' WHERE CAST(id_perfil AS CHAR) LIKE ?';
      params = [`%${qNorm}%`];
    } else if (field === 'number') {
      sql += " WHERE REPLACE(REPLACE(REPLACE(IFNULL(telefono_movil,''),' ',''),'-',''),'.','') LIKE ?";
      params = [`%${qCompact}%`];
    }
    sql += ' ORDER BY updated_at DESC LIMIT 500';

    const [rows] = await db.query(sql, params);

    const items = [];
    for (const row of rows) {
      let rawValue = '';
      if (field === 'name') rawValue = row.nombre;
      else if (field === 'id') rawValue = String(row.id_perfil);
      else if (field === 'number') rawValue = row.telefono_movil || '';

      const valNorm = normalize(rawValue);
      const valComp = compact(rawValue);

      let pos = valNorm.indexOf(qNorm);
      let match = pos >= 0;
      if (!match) {
        pos = valComp.indexOf(qCompact);
        if (pos >= 0) match = true;
      }
      if (!match) continue;

      const exact = cfgField.type === 'id' && isNumericQ && valComp === qCompact;

      // calcular edad si hay fecha_nacimiento
      let age = null;
      if (row.fecha_nacimiento) {
        const dob = new Date(row.fecha_nacimiento);
        if (!Number.isNaN(dob.getTime())) {
          const today = new Date();
          let a = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
          age = a;
        }
      }

      items.push({
        id: row.id_perfil,
        name: row.nombre,
        phone: row.telefono_movil,
        age,
        created: row.creado,
        updated: row.actualizado,
        updated_at: row.updated_at,
        __pos: pos,
        __exact: exact,
        __title: row.nombre,
      });
    }

    items.sort((a, b) => {
      if (cfgField.type === 'id' && isNumericQ) {
        if (b.__exact - a.__exact) return b.__exact - a.__exact;
      }
      if (a.__pos !== b.__pos) return a.__pos - b.__pos;
      const ta = new Date(a.updated_at).getTime();
      const tb = new Date(b.updated_at).getTime();
      if (ta !== tb) return tb - ta;
      return String(a.__title).localeCompare(String(b.__title));
    });

    const total = items.length;
    const slice = items.slice(0, limit).map(({ __pos, __exact, __title, ...rest }) => rest);

    return res.status(200).json({ items: slice, meta: { limit: 20, totalEstimado: total } });
  } catch (err) {
    console.error('search error:', err.message);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
}

module.exports = { search, normalize, compact };
