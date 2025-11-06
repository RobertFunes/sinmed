import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../../helpers/url';
import { buildNestedPayload } from '../../helpers/add/buildPayload';

// Helpers usados solo al enviar
const toArr = (value) => (Array.isArray(value) ? value : []);
const trimValue = (value) => {
  if (typeof value === 'string') return value.trim();
  return value ?? '';
};

const parseDateValue = (value) => {
  if (!value) return Number.NaN;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NaN : parsed;
};
const extractNumericId = (entry) => {
  const raw = entry?.id ?? entry?.uid;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const str = String(raw ?? '').trim();
  if (!str) return Number.NaN;
  const matches = str.match(/\d+/g);
  if (!matches || matches.length === 0) return Number.NaN;
  const last = matches[matches.length - 1];
  const num = parseInt(last, 10);
  return Number.isFinite(num) ? num : Number.NaN;
};
const sortConsultasAsc = (entries = []) => {
  const decorated = entries.map((item, index) => ({ item, index }));
  decorated.sort((a, b) => {
    const da = parseDateValue(a.item?.fecha_consulta);
    const db = parseDateValue(b.item?.fecha_consulta);
    const aHasDate = Number.isFinite(da);
    const bHasDate = Number.isFinite(db);
    if (aHasDate && bHasDate && da !== db) return da - db;
    const ida = extractNumericId(a.item);
    const idb = extractNumericId(b.item);
    const aHasId = Number.isFinite(ida);
    const bHasId = Number.isFinite(idb);
    if (aHasId && bHasId && ida !== idb) return idb - ida;
    if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
    return a.index - b.index;
  });
  return decorated.map((d) => d.item);
};

// Mapeo de estado de sistemas -> llaves planas en payload
const normalize = (text) => String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const SISTEMA_FIELD_MAPPINGS = [
  { needle: 'Sintomas generales', estadoKey: 'sintomas_generales_estado' },
  { needle: 'Endocrino', estadoKey: 'endocrino_estado' },
  { needle: 'Organos de los sentidos', estadoKey: 'organos_sentidos_estado' },
  { needle: 'Gastrointestinal', estadoKey: 'gastrointestinal_estado' },
  { needle: 'Cardiopulmonar', estadoKey: 'cardiopulmonar_estado' },
  { needle: 'Genitourinario', estadoKey: 'genitourinario_estado' },
  { needle: 'Genital femenino', estadoKey: 'genital_femenino_estado' },
  { needle: 'Sexualidad', estadoKey: 'sexualidad_estado' },
  { needle: 'Dermatologico', estadoKey: 'dermatologico_estado' },
  { needle: 'Neurologico', estadoKey: 'neurologico_estado' },
  { needle: 'Hematologico', estadoKey: 'hematologico_estado' },
  { needle: 'Reumatologico', estadoKey: 'reumatologico_estado' },
  { needle: 'Psiquiatrico', estadoKey: 'psiquiatrico_estado' },
  { needle: 'Medicamentos', estadoKey: 'medicamentos_estado' },
];
const SISTEMA_FIELD_LOOKUP = SISTEMA_FIELD_MAPPINGS.reduce((acc, cfg) => {
  acc[normalize(cfg.needle)] = cfg;
  return acc;
}, {});
const findSistemaConfig = (nombre) => SISTEMA_FIELD_LOOKUP[normalize(nombre)] || null;

export const buildPayloadWithConsultas = (data, idPerfil) => {
  const base = buildNestedPayload(data);
  const consultas = sortConsultasAsc(toArr(data?.consultas)).map((consulta) => {
    const payload = {
      fecha_consulta: trimValue(consulta?.fecha_consulta),
      recordatorio: trimValue(consulta?.recordatorio),
      padecimiento_actual: trimValue(consulta?.padecimiento_actual),
      diagnostico: trimValue(consulta?.diagnostico),
      tratamiento: trimValue(consulta?.tratamiento),
      notas: trimValue(consulta?.notas),
    };

    const interrogatorio_aparatos = toArr(consulta?.interrogatorio_aparatos).map((item) => {
      const nombre = trimValue(item?.nombre);
      const descripcion = trimValue(item?.descripcion);
      const estado = trimValue(item?.estado);
      const config = findSistemaConfig(nombre);
      if (config?.estadoKey) {
        payload[config.estadoKey] = estado;
      }
      return { nombre, descripcion, estado };
    });

    const personalizados = toArr(consulta?.personalizados)
      .map((p) => ({ nombre: trimValue(p?.nombre), descripcion: trimValue(p?.descripcion) }))
      .filter((p) => p.nombre !== '' || p.descripcion !== '');

    return { ...payload, interrogatorio_aparatos, personalizados };
  });

  base.consultas = consultas;
  if (idPerfil != null && idPerfil !== '') {
    const numericId = Number(idPerfil);
    base.id_perfil = Number.isFinite(numericId) && numericId > 0 ? numericId : idPerfil;
  }
  return base;
};

export const useSubmitPerfilModify = (id) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submit = async (formData, opts = {}) => {
    setIsSubmitting(true);
    const payload = buildPayloadWithConsultas(formData, id);
    try {
      const res = await fetch(`${url}/api/profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = 'Ocurrió un error al actualizar el perfil';
        try {
          const errJson = await res.json();
          if (errJson?.error) message = errJson.error;
        } catch {}
        alert(message);
        return false;
      }
      if (typeof opts.onSuccess === 'function') {
        await opts.onSuccess();
      } else {
        navigate(`/profile/${id}`);
      }
      return true;
    } catch (err) {
      console.error('[useSubmitPerfilModify] Error al actualizar perfil:', err);
      alert('Error de red al intentar modificar el perfil');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submit };
};

