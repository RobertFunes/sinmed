import { useEffect, useRef, useState } from 'react';
import { url } from '../../helpers/url';
import {
  ANTECEDENTES_OPCIONES,
  HABITOS_OPCIONES,
  SISTEMAS_OPCIONES,
  INSPECCION_OPCIONES,
} from '../../helpers/add/catalogos';
import { initialState } from '../../helpers/add/initialState';

// Utilidades locales (duplicadas desde Modify.jsx para evitar acoplar UI)
const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const buildInitialForm = () => ({
  ...initialState,
  fecha_consulta: todayISO(),
  consultas: [],
});

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const toStr = (value) => (value == null ? '' : String(value));
const toArr = (value) => (Array.isArray(value) ? value : []);

let consultaUidCounter = 0;
const generateConsultaUid = () => {
  consultaUidCounter += 1;
  return `consulta-${Date.now()}-${consultaUidCounter}`;
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

const findMatchingLabel = (options, needle, fallback) => {
  const normalizedNeedle = normalize(needle);
  const exact = options.find((opt) => normalize(opt) === normalizedNeedle);
  if (exact) return exact;
  const partial = options.find((opt) => normalize(opt).includes(normalizedNeedle));
  return partial || fallback || needle;
};

const SISTEMA_FIELD_MAPPINGS = [
  { needle: 'Sintomas generales', descKeys: ['sintomas_generales_desc', 'sintomas_generales'], estadoKey: 'sintomas_generales_estado' },
  { needle: 'Endocrino', descKeys: ['endocrino_desc', 'endocrino'], estadoKey: 'endocrino_estado' },
  { needle: 'Organos de los sentidos', descKeys: ['organos_sentidos_desc', 'organos_sentidos'], estadoKey: 'organos_sentidos_estado' },
  { needle: 'Gastrointestinal', descKeys: ['gastrointestinal_desc', 'gastrointestinal'], estadoKey: 'gastrointestinal_estado' },
  { needle: 'Cardiopulmonar', descKeys: ['cardiopulmonar_desc', 'cardiopulmonar'], estadoKey: 'cardiopulmonar_estado' },
  { needle: 'Genitourinario', descKeys: ['genitourinario_desc', 'genitourinario'], estadoKey: 'genitourinario_estado' },
  { needle: 'Genital femenino', descKeys: ['genital_femenino_desc', 'genital_femenino'], estadoKey: 'genital_femenino_estado' },
  { needle: 'Sexualidad', descKeys: ['sexualidad_desc', 'sexualidad'], estadoKey: 'sexualidad_estado' },
  { needle: 'Dermatologico', descKeys: ['dermatologico_desc', 'dermatologico'], estadoKey: 'dermatologico_estado' },
  { needle: 'Neurologico', descKeys: ['neurologico_desc', 'neurologico'], estadoKey: 'neurologico_estado' },
  { needle: 'Hematologico', descKeys: ['hematologico_desc', 'hematologico'], estadoKey: 'hematologico_estado' },
  { needle: 'Reumatologico', descKeys: ['reumatologico_desc', 'reumatologico'], estadoKey: 'reumatologico_estado' },
  { needle: 'Psiquiatrico', descKeys: ['psiquiatrico_desc', 'psiquiatrico'], estadoKey: 'psiquiatrico_estado' },
];

const SISTEMA_FIELD_LOOKUP = SISTEMA_FIELD_MAPPINGS.reduce((acc, config) => {
  acc[normalize(config.needle)] = config;
  return acc;
}, {});



const mapSistemasFromSource = (source = {}) => {
  const direct = toArr(source?.interrogatorio_aparatos)
    .map((item) => {
      const nombre = toStr(item?.nombre);
      const descripcion = toStr(item?.descripcion);
      const estado = toStr(item?.estado).trim();
      if (!nombre && !descripcion && !estado) return null;
      return { nombre, descripcion, estado };
    })
    .filter(Boolean);

  if (direct.length > 0) return direct;

  return SISTEMA_FIELD_MAPPINGS
    .map(({ needle, descKeys, estadoKey }) => {
      const label = findMatchingLabel(SISTEMAS_OPCIONES, needle, needle);
      const descripcion = toArr(descKeys)
        .map((key) => toStr(source?.[key]).trim())
        .find((value) => value.length > 0);
      const estado = estadoKey ? toStr(source?.[estadoKey]).trim() : '';
      if (!descripcion && !estado) return null;
      return { nombre: label, descripcion: descripcion || '', estado };
    })
    .filter(Boolean);
};

const mapApiToForm = (api) => {
  const base = buildInitialForm();
  if (!api || api.ok === false) return base;

  const next = deepClone(base);
  const assign = (key, value) => { next[key] = toStr(value); };
  const assignIf = (key, value) => { const str = toStr(value).trim(); if (str !== '') next[key] = str; };

  assign('nombre', api.nombre);
  assign('fecha_nacimiento', api.fecha_nacimiento);
  assign('genero', api.genero);
  assign('telefono_movil', api.telefono_movil);
  assign('correo_electronico', api.correo_electronico);
  assign('residencia', api.residencia);
  assign('ocupacion', api.ocupacion);
  assign('escolaridad', api.escolaridad);
  assign('estado_civil', api.estado_civil);
  assign('tipo_sangre', api.tipo_sangre);
  assign('referido_por', api.referido_por);
  assign('alergico', api.alergico);
  assign('id_legado', api.id_legado);
  assign('fecha_legado', api.fecha_legado);
  assign('recordatorio', api.recordatorio);
  assign('recordatorio_desc', api.recordatorio_desc);

  next.antecedentes_familiares = toArr(api.antecedentes_familiares).map((item) => {
    const nombre = toStr(item?.nombre);
    const descripcion = toStr(item?.descripcion);
    const esCatalogo = ANTECEDENTES_OPCIONES.some((opt) => normalize(opt) === normalize(nombre));
    return { nombre, descripcion, esOtro: !nombre || !esCatalogo || item?.esOtro === true };
  });

  const ap = api.antecedentes_personales || {};
  const habitos = [];
  if (ap.bebidas_por_dia || ap.tiempo_activo_alc || ap.tiempo_inactivo_alc) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Alcoholismo', HABITOS_OPCIONES[0] || 'Alcoholismo');
    habitos.push({
      tipo: label,
      campos: {
        bebidas_por_dia: toStr(ap.bebidas_por_dia),
        tiempo_activo_alc: toStr(ap.tiempo_activo_alc),
        tiempo_inactivo_alc: toStr(ap.tiempo_inactivo_alc),
      },
    });
  }
  if (ap.cigarrillos_por_dia || ap.tiempo_activo_tab || ap.tiempo_inactivo_tab) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Tabaquismo', HABITOS_OPCIONES[1] || 'Tabaquismo');
    habitos.push({
      tipo: label,
      campos: {
        cigarrillos_por_dia: toStr(ap.cigarrillos_por_dia),
        tiempo_activo_tab: toStr(ap.tiempo_activo_tab),
        tiempo_inactivo_tab: toStr(ap.tiempo_inactivo_tab),
      },
    });
  }
  if (ap.tipo_toxicomania || ap.tiempo_activo_tox || ap.tiempo_inactivo_tox) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Toxicomanias', HABITOS_OPCIONES[2] || 'Toxicomanias');
    habitos.push({
      tipo: label,
      campos: {
        tipo_toxicomania: toStr(ap.tipo_toxicomania),
        tiempo_activo_tox: toStr(ap.tiempo_activo_tox),
        tiempo_inactivo_tox: toStr(ap.tiempo_inactivo_tox),
      },
    });
  }
  next.antecedentes_personales_habitos = habitos;

  assign('calidad', ap.calidad);
  assign('alimentos_que_le_caen_mal', ap.alimentos_que_le_caen_mal);
  assign('componentes_habituales_dieta', ap.componentes_habituales_dieta);
  assign('desayuno', ap.desayuno);
  assign('comida', ap.comida);
  assign('cena', ap.cena);
  assign('vacunas', ap.vacunas);
  assign('hay_cambios', ap.hay_cambios);
  assign('cambio_tipo', ap.cambio_tipo);
  assign('cambio_causa', ap.cambio_causa);
  assign('cambio_tiempo', ap.cambio_tiempo);

  const goSource = Array.isArray(api.gineco_obstetricos) ? api.gineco_obstetricos[0] || {} : api.gineco_obstetricos || {};
  assign('gineco_edad_menarca', goSource.edad_primera_menstruacion);
  assign('gineco_ciclo', goSource.ciclo_dias);
  assign('gineco_cantidad', goSource.cantidad);
  assign('gineco_dolor', goSource.dolor);
  assign('gineco_fecha_ultima_menstruacion', goSource.fecha_ultima_menstruacion);
  assign('gineco_vida_sexual_activa', goSource.vida_sexual_activa);
  assign('gineco_anticoncepcion', goSource.anticoncepcion);
  assign('gineco_tipo_anticonceptivo', goSource.tipo_anticonceptivo);
  assign('gineco_gestas', goSource.gestas);
  assign('gineco_partos', goSource.partos);
  assign('gineco_cesareas', goSource.cesareas);
  assign('gineco_abortos', goSource.abortos);
  assign('gineco_fecha_ultimo_parto', goSource.fecha_ultimo_parto);
  assign('gineco_fecha_menopausia', goSource.fecha_menopausia);

  next.antecedentes_personales_patologicos = toArr(api.antecedentes_personales_patologicos).map((item) => ({
    antecedente: toStr(item?.antecedente),
    descripcion: toStr(item?.descripcion),
  }));

  const consRows = toArr(api.consultas);
  const legacyRows = toArr(api.padecimiento_actual_interrogatorio);
  const legacy = legacyRows[0] || null;
  const dtRows = toArr(api.diagnostico_tratamiento);
  const dt = dtRows[0] || null;

  const personalizadosByConsulta = new Map();
  toArr(api.personalizados).forEach((it) => {
    const cid = Number(it?.id_consulta);
    if (!Number.isFinite(cid)) return;
    const nombre = toStr(it?.nombre);
    const descripcion = toStr(it?.descripcion);
    const estado = toStr(it?.estado);
    if (!nombre && !descripcion && !estado) return;
    const list = personalizadosByConsulta.get(cid) || [];
    list.push({ nombre, descripcion, estado });
    personalizadosByConsulta.set(cid, list);
  });

  const consultasFromApi = consRows.map((row) => ({
    uid: row?.uid || row?.id || generateConsultaUid(),
    id_consulta: Number(row?.id_consulta) || undefined,
    fecha_consulta: toStr(row?.fecha_consulta),
    recordatorio: toStr(row?.recordatorio),
    padecimiento_actual: toStr(row?.padecimiento_actual),
    diagnostico: toStr(row?.diagnostico),
    medicamentos: toStr(row?.medicamentos),
    tratamiento: toStr(row?.tratamiento),
    notas: toStr(row?.notas),
    notas_evolucion: toStr(row?.notas_evolucion),
    interrogatorio_aparatos: mapSistemasFromSource(row).map((item) => ({
      nombre: toStr(item?.nombre),
      descripcion: toStr(item?.descripcion),
      estado: toStr(item?.estado),
    })),
    personalizados: (personalizadosByConsulta.get(Number(row?.id_consulta)) || []).map((p) => ({
      nombre: toStr(p?.nombre),
      descripcion: toStr(p?.descripcion),
      estado: toStr(p?.estado),
    })),
  }));

  let consultas = consultasFromApi;

  if (consultas.length === 0 && (legacy || dt)) {
    const fallbackSource = { ...(legacy || {}), ...(dt || {}) };
    consultas = [
      {
        uid: generateConsultaUid(),
        fecha_consulta: toStr(fallbackSource.fecha_consulta),
      recordatorio: toStr(fallbackSource.recordatorio),
      padecimiento_actual: toStr(fallbackSource.padecimiento_actual),
      diagnostico: toStr(fallbackSource.diagnostico),
      medicamentos: toStr(fallbackSource.medicamentos),
      tratamiento: toStr(fallbackSource.tratamiento),
      notas: toStr(fallbackSource.notas),
        interrogatorio_aparatos: mapSistemasFromSource(fallbackSource).map((item) => ({
          nombre: toStr(item?.nombre),
          descripcion: toStr(item?.descripcion),
          estado: toStr(item?.estado),
        })),
      },
    ];
  }

  const sortedConsultas = sortConsultasAsc(
    consultas.map((consulta) => ({
      ...consulta,
      uid: consulta.uid || generateConsultaUid(),
      interrogatorio_aparatos: toArr(consulta.interrogatorio_aparatos).map((item) => ({
        nombre: toStr(item?.nombre),
        descripcion: toStr(item?.descripcion),
        estado: toStr(item?.estado),
      })),
      personalizados: toArr(consulta.personalizados).map((p) => ({
        nombre: toStr(p?.nombre),
        descripcion: toStr(p?.descripcion),
        estado: toStr(p?.estado),
      })),
    })),
  );

  next.consultas = sortedConsultas;

  const lastConsulta = sortedConsultas[sortedConsultas.length - 1] || null;
  if (lastConsulta) {
    assignIf('fecha_consulta', lastConsulta.fecha_consulta);
    assignIf('consulta_recordatorio', lastConsulta.recordatorio);
    assignIf('padecimiento_actual', lastConsulta.padecimiento_actual);
    assignIf('diagnostico', lastConsulta.diagnostico);
    assignIf('medicamentos', lastConsulta.medicamentos);
    if (!toStr(lastConsulta.diagnostico).trim()) assignIf('diagnostico', dt && dt.diagnostico);
    assignIf('tratamiento', lastConsulta.tratamiento);
    if (!toStr(lastConsulta.tratamiento).trim()) assignIf('tratamiento', dt && dt.tratamiento);
    assignIf('notas', lastConsulta.notas);
    if (!toStr(lastConsulta.notas).trim()) assignIf('notas', dt && dt.notas);
    next.interrogatorio_aparatos = toArr(lastConsulta.interrogatorio_aparatos);
  } else {
    assignIf('fecha_consulta', legacy && legacy.fecha_consulta);
    assignIf('consulta_recordatorio', legacy && legacy.recordatorio);
    assignIf('padecimiento_actual', legacy && legacy.padecimiento_actual);
    assignIf('diagnostico', dt && dt.diagnostico);
    assignIf('medicamentos', legacy && legacy.medicamentos);
    assignIf('tratamiento', dt && dt.tratamiento);
    assignIf('notas', dt && dt.notas);
    next.interrogatorio_aparatos = mapSistemasFromSource({ ...(legacy || {}), ...(dt || {}) });
  }

  assignIf('pronostico', dt && dt.pronostico);

  const efSource = api.exploracion_fisica;
  const ef = Array.isArray(efSource)
    ? efSource[0] || {}
    : typeof efSource === 'object' && efSource !== null
    ? efSource
    : {};
  assignIf('peso_actual', ef.peso_actual);
  assignIf('peso_anterior', ef.peso_anterior);
  assignIf('peso_deseado', ef.peso_deseado);
  assignIf('peso_ideal', ef.peso_ideal);
  assignIf('talla_cm', ef.talla_cm);
  assignIf('imc', ef.imc);
  assignIf('ta_mmhg', ef.ta_mmhg);
  assignIf('pam', ef.pam);
  assignIf('frecuencia_cardiaca', ef.frecuencia_cardiaca);
  assignIf('frecuencia_respiratoria', ef.frecuencia_respiratoria);
  assignIf('temperatura_c', ef.temperatura_c);
  assignIf('cadera_cm', ef.cadera_cm);
  assignIf('cintura_cm', ef.cintura_cm);

  const inspectionMappings = [
    { needle: 'Cabeza', value: ef.cabeza },
    { needle: 'Cuello', value: ef.cuello },
    { needle: 'Torax', value: ef.torax },
    { needle: 'Abdomen', value: ef.abdomen },
    { needle: 'Genitales', value: ef.genitales },
    { needle: 'Extremidades', value: ef.extremidades },
  ];

  next.inspeccion_general = inspectionMappings
    .map(({ needle, value }) => {
      const descripcion = toStr(value).trim();
      if (!descripcion) return null;
      const nombre = findMatchingLabel(INSPECCION_OPCIONES, needle, needle);
      return { nombre, descripcion };
    })
    .filter(Boolean);

  return next;
};

export const usePerfilModify = (id) => {
  const [formData, setFormData] = useState(() => buildInitialForm());
  const [isLoading, setIsLoading] = useState(true);
  const originalRef = useRef(buildInitialForm());

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${url}/api/profile/${id}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!res.ok) {
          console.error(`[usePerfilModify] GET /api/profile/${id} ->`, res.status);
          if (res.status === 404 && alive) {
            alert('Perfil no encontrado');
          }
          return;
        }
        const json = await res.json();
        const mapped = mapApiToForm(json);
        if (alive) {
          const snapshot = deepClone(mapped);
          originalRef.current = snapshot;
          setFormData(snapshot);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('[usePerfilModify] Error al cargar perfil:', err);
          alert('Error de red al cargar el perfil');
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  return { formData, setFormData, isLoading, original: originalRef.current };
};

