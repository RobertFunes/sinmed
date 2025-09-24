// modify.jsx (actualizado para edicion de perfiles)
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  AddContainer,
  FormCard,
  Title,
  Form,
  Summary,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
  ButtonRow,
  SubmitButton,
  CancelButton,
  TwoColumnRow,
  ThreeColumnRow,
  ItemCard,
  ItemActions,
  DangerButton,
  ButtonLabel,
  ListContainer,
} from './Add.styles';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';
import {
  ANTECEDENTES_OPCIONES,
  HABITOS_OPCIONES,
  PATOLOGICOS_OPCIONES,
  SISTEMAS_OPCIONES,
  INSPECCION_OPCIONES,
} from '../helpers/add/catalogos';
import { initialState } from '../helpers/add/initialState';
import { buildNestedPayload } from '../helpers/add/buildPayload';

// iconos
import { AiFillStar } from 'react-icons/ai';
import {
  FaUser,
  FaBirthdayCake,
  FaPhone,
  FaUserPlus,
  FaGraduationCap,
  FaTint,
  FaUsers,
  FaBeer,
  FaClock,
  FaSmoking,
  FaPills,
  FaUtensils,
  FaExchangeAlt,
  FaExclamationCircle,
  FaFemale,
  FaCalendarAlt,
  FaCalendarCheck,
  FaBaby,
  FaBabyCarriage,
  FaProcedures,
  FaHeartbeat,
  FaCalendarDay,
  FaCalendarTimes,
  FaFileMedical,
  FaWeight,
  FaHistory,
  FaRulerVertical,
  FaRulerCombined,
  FaRulerHorizontal,
  FaBullseye,
  FaBalanceScale,
  FaChartBar,
  FaHeart,
  FaThermometerHalf,
  FaStethoscope,
  FaBell,
  FaNotesMedical,
  FaDiagnoses,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaTrash,
  FaPlusCircle,
} from 'react-icons/fa';
import { MdEmail, MdHome, MdWork, MdDescription } from 'react-icons/md';
import { GiLungs } from 'react-icons/gi';




const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const buildInitialForm = () => ({
  ...initialState,
  fecha_consulta: todayISO(),
});

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const findMatchingLabel = (options, needle, fallback) => {
  const normalizedNeedle = normalize(needle);
  const exact = options.find((opt) => normalize(opt) === normalizedNeedle);
  if (exact) return exact;
  const partial = options.find((opt) => normalize(opt).includes(normalizedNeedle));
  return partial || fallback || needle;
};

const SYSTEM_MAPPINGS = [
  {
    needle: 'Sintomas generales',
    label: 'Síntomas generales',
    keys: ['sintomas_generales_desc', 'sintomas_generales'],
    descKey: 'sintomas_generales_desc',
  },
  {
    needle: 'Endocrino',
    label: 'Endocrino',
    keys: ['endocrino_desc', 'endocrino'],
    descKey: 'endocrino_desc',
  },
  {
    needle: 'Organos de los sentidos',
    label: 'Órganos de los sentidos',
    keys: ['organos_sentidos_desc', 'organos_sentidos'],
    descKey: 'organos_sentidos_desc',
  },
  {
    needle: 'Gastrointestinal',
    label: 'Gastrointestinal',
    keys: ['gastrointestinal_desc', 'gastrointestinal'],
    descKey: 'gastrointestinal_desc',
  },
  {
    needle: 'Cardiopulmonar',
    label: 'Cardiopulmonar',
    keys: ['cardiopulmonar_desc', 'cardiopulmonar'],
    descKey: 'cardiopulmonar_desc',
  },
  {
    needle: 'Genitourinario',
    label: 'Genitourinario',
    keys: ['genitourinario_desc', 'genitourinario'],
    descKey: 'genitourinario_desc',
  },
  {
    needle: 'Genital femenino',
    label: 'Genital femenino',
    keys: ['genital_femenino_desc', 'genital_femenino'],
    descKey: 'genital_femenino_desc',
  },
  {
    needle: 'Sexualidad',
    label: 'Sexualidad',
    keys: ['sexualidad_desc', 'sexualidad'],
    descKey: 'sexualidad_desc',
  },
  {
    needle: 'Dermatologico',
    label: 'Dermatológico',
    keys: ['dermatologico_desc', 'dermatologico'],
    descKey: 'dermatologico_desc',
  },
  {
    needle: 'Neurologico',
    label: 'Neurológico',
    keys: ['neurologico_desc', 'neurologico'],
    descKey: 'neurologico_desc',
  },
  {
    needle: 'Hematologico',
    label: 'Hematológico',
    keys: ['hematologico_desc', 'hematologico'],
    descKey: 'hematologico_desc',
  },
  {
    needle: 'Reumatologico',
    label: 'Reumatológico',
    keys: ['reumatologico_desc', 'reumatologico'],
    descKey: 'reumatologico_desc',
  },
  {
    needle: 'Psiquiatrico',
    label: 'Psiquiátrico',
    keys: ['psiquiatrico_desc', 'psiquiatrico'],
    descKey: 'psiquiatrico_desc',
  },
  {
    needle: 'Medicamentos',
    label: 'Medicamentos',
    keys: ['medicamentos_desc', 'medicamentos'],
    descKey: 'medicamentos_desc',
  },
];

const CONSULTA_SYSTEM_FIELDS = SYSTEM_MAPPINGS.map(({ descKey, label }) => ({ key: descKey, label }));

let consultaClientIdCounter = 0;
const generateConsultaClientId = (prefix = 'consulta') => {
  consultaClientIdCounter += 1;
  return `${prefix}-${Date.now()}-${consultaClientIdCounter}`;
};

const toSafeString = (value) => (value == null ? '' : String(value));

const dateToSortableValue = (value) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
};

const idToSortableValue = (consulta) => {
  if (consulta.id_consulta == null) {
    return consulta.__isNew ? Number.MAX_SAFE_INTEGER : 0;
  }
  const numeric = Number(consulta.id_consulta);
  if (Number.isFinite(numeric)) return numeric;
  const digits = String(consulta.id_consulta).match(/\d+/);
  return digits ? Number(digits[0]) : 0;
};

const sortConsultas = (items = []) => {
  const clone = [...items];
  clone.sort((a, b) => {
    const byDate = dateToSortableValue(b.fecha_consulta) - dateToSortableValue(a.fecha_consulta);
    if (byDate !== 0) return byDate;
    const byId = idToSortableValue(b) - idToSortableValue(a);
    if (byId !== 0) return byId;
    const byCreated = (b.__createdAt || 0) - (a.__createdAt || 0);
    if (byCreated !== 0) return byCreated;
    return String(b.__clientId || '').localeCompare(String(a.__clientId || ''));
  });
  return clone;
};

const formatConsultaForState = (consulta = {}, fallbackIndex = 0) => {
  const base = {
    id_consulta: consulta.id_consulta ?? null,
    fecha_consulta: toSafeString(consulta.fecha_consulta),
    recordatorio: toSafeString(consulta.recordatorio),
    padecimiento_actual: toSafeString(consulta.padecimiento_actual),
    diagnostico: toSafeString(consulta.diagnostico),
    tratamiento: toSafeString(consulta.tratamiento),
    notas: toSafeString(consulta.notas),
    __clientId:
      consulta.__clientId ||
      (consulta.id_consulta != null
        ? `consulta-${consulta.id_consulta}`
        : generateConsultaClientId('consulta-temp')),
    __createdAt:
      typeof consulta.__createdAt === 'number'
        ? consulta.__createdAt
        : Date.now() + fallbackIndex,
    __isNew: Boolean(consulta.__isNew),
  };

  CONSULTA_SYSTEM_FIELDS.forEach(({ key }) => {
    base[key] = toSafeString(consulta[key]);
  });

  return base;
};

const createEmptyConsulta = () => {
  const template = {
    id_consulta: null,
    fecha_consulta: todayISO(),
    recordatorio: '',
    padecimiento_actual: '',
    diagnostico: '',
    tratamiento: '',
    notas: '',
    __isNew: true,
  };
  CONSULTA_SYSTEM_FIELDS.forEach(({ key }) => {
    template[key] = '';
  });
  const formatted = formatConsultaForState(template);
  formatted.__createdAt = Date.now();
  return formatted;
};

const buildConsultasPayload = (consultas = []) => {
  const trim = (value) => (typeof value === 'string' ? value.trim() : value ?? '');
  return sortConsultas(consultas).map((consulta) => {
    const payloadConsulta = {
      id_consulta: consulta.id_consulta ?? null,
      fecha_consulta: trim(consulta.fecha_consulta),
      recordatorio: trim(consulta.recordatorio),
      padecimiento_actual: trim(consulta.padecimiento_actual),
      diagnostico: trim(consulta.diagnostico),
      tratamiento: trim(consulta.tratamiento),
      notas: trim(consulta.notas),
    };

    CONSULTA_SYSTEM_FIELDS.forEach(({ key }) => {
      payloadConsulta[key] = trim(consulta[key]);
    });

    return payloadConsulta;
  });
};

const mapApiToForm = (api) => {
  const base = buildInitialForm();
  if (!api || api.ok === false) return base;

  const next = deepClone(base);

  const toStr = (value) => (value == null ? '' : String(value));
  const toArr = (value) => (Array.isArray(value) ? value : []);
  const assign = (key, value) => {
    next[key] = toStr(value);
  };
  const assignIf = (key, value) => {
    const str = toStr(value).trim();
    if (str !== '') next[key] = str;
  };

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

  next.antecedentes_familiares = toArr(api.antecedentes_familiares).map((item) => {
    const nombre = toStr(item?.nombre);
    const descripcion = toStr(item?.descripcion);
    const esCatalogo = ANTECEDENTES_OPCIONES.some((opt) => normalize(opt) === normalize(nombre));
    return {
      nombre,
      descripcion,
      esOtro: !nombre || !esCatalogo || item?.esOtro === true,
    };
  });

  const ap = api.antecedentes_personales || {};
  const habitos = [];
  if (ap.bebidas_por_dia || ap.tiempo_activo_alc) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Alcoholismo', HABITOS_OPCIONES[0] || 'Alcoholismo');
    habitos.push({
      tipo: label,
      campos: {
        bebidas_por_dia: toStr(ap.bebidas_por_dia),
        tiempo_activo_alc: toStr(ap.tiempo_activo_alc),
      },
    });
  }
  if (ap.cigarrillos_por_dia || ap.tiempo_activo_tab) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Tabaquismo', HABITOS_OPCIONES[1] || 'Tabaquismo');
    habitos.push({
      tipo: label,
      campos: {
        cigarrillos_por_dia: toStr(ap.cigarrillos_por_dia),
        tiempo_activo_tab: toStr(ap.tiempo_activo_tab),
      },
    });
  }
  if (ap.tipo_toxicomania || ap.tiempo_activo_tox) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Toxicomanias', HABITOS_OPCIONES[2] || 'Toxicomanias');
    habitos.push({
      tipo: label,
      campos: {
        tipo_toxicomania: toStr(ap.tipo_toxicomania),
        tiempo_activo_tox: toStr(ap.tiempo_activo_tox),
      },
    });
  }
  next.antecedentes_personales_habitos = habitos;

  assign('calidad', ap.calidad);
  assign('descripcion', ap.descripcion);
  assign('hay_cambios', ap.hay_cambios);
  assign('cambio_tipo', ap.cambio_tipo);
  assign('cambio_causa', ap.cambio_causa);
  assign('cambio_tiempo', ap.cambio_tiempo);

  const goSource = Array.isArray(api.gineco_obstetricos)
    ? api.gineco_obstetricos[0] || {}
    : api.gineco_obstetricos || {};

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
  const cons = consRows[0] || null;
  const legacyRows = toArr(api.padecimiento_actual_interrogatorio);
  const legacy = legacyRows[0] || null;
  const dtRows = toArr(api.diagnostico_tratamiento);
  const dt = dtRows[0] || null;

  assignIf('fecha_consulta', (cons && cons.fecha_consulta) || (legacy && legacy.fecha_consulta));
  assignIf('recordatorio', (cons && cons.recordatorio) || (legacy && legacy.recordatorio));
  assignIf('padecimiento_actual', (cons && cons.padecimiento_actual) || (legacy && legacy.padecimiento_actual));
  assignIf('diagnostico', (cons && cons.diagnostico) || (dt && dt.diagnostico));
  assignIf('tratamiento', (cons && cons.tratamiento) || (dt && dt.tratamiento));
  assignIf('notas', (cons && cons.notas) || (dt && dt.notas));
  assignIf('pronostico', dt && dt.pronostico);

  const systemSource = { ...(legacy || {}), ...(cons || {}) };

  next.interrogatorio_aparatos = SYSTEM_MAPPINGS
    .map(({ needle, keys }) => {
      const label = findMatchingLabel(SISTEMAS_OPCIONES, needle, needle);
      const descripcion = keys
        .map((key) => toStr(systemSource[key]).trim())
        .find((value) => value.length > 0);
      return descripcion ? { nombre: label, descripcion } : null;
    })
    .filter(Boolean);

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
  assignIf('rtg', ef.rtg);
  assignIf('ta_mmhg', ef.ta_mmhg);
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

const Modify = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => buildInitialForm());
  const [consultas, setConsultas] = useState([]);
  // Control de acordeón: solo una sección abierta a la vez
  const [openSection, setOpenSection] = useState('datos');
  const handleToggle = (key) => (e) => {
    if (e.currentTarget.open) {
      // Abrir esta sección y mantener cerradas las demás
      setOpenSection(key);
    } else {
      // Solo cerrar si es la sección actualmente activa; ignorar cierres de otras
      setOpenSection((prev) => (prev === key ? null : prev));
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(true);
  const [nuevoAntecedente, setNuevoAntecedente] = useState('');
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [nuevoPatologico, setNuevoPatologico] = useState('');
  const [nuevoInspeccion, setNuevoInspeccion] = useState('');
  const prefillRef = useRef(buildInitialForm());
  const consultasPrefillRef = useRef([]);
  const nombreRef = useRef(null);
  const imcAutoCalcRef = useRef(false);

  const handleChange = ({ target: { name, value } }) => {
    if (name === 'peso_actual' || name === 'talla_cm') {
      imcAutoCalcRef.current = true;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    setIsPrefilling(true);
    (async () => {
      try {
        const res = await fetch(`${url}/api/profile/${id}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!res.ok) {
          console.error(`[Modify] GET /api/profile/${id} ->`, res.status);
          if (res.status === 404 && alive) {
            alert('Perfil no encontrado');
          }
          return;
        }
        const json = await res.json();
        console.log('[Modify] Prefill recibido:', json);
        const consultasFromApi = Array.isArray(json?.consultas) ? json.consultas : [];
        const preparedConsultas = sortConsultas(
          consultasFromApi.map((item, index) => formatConsultaForState(item, index))
        );
        const mapped = mapApiToForm(json);
        if (preparedConsultas[0]) {
          mapped.fecha_consulta = preparedConsultas[0].fecha_consulta || mapped.fecha_consulta;
          mapped.recordatorio = preparedConsultas[0].recordatorio || mapped.recordatorio;
          mapped.padecimiento_actual = preparedConsultas[0].padecimiento_actual || mapped.padecimiento_actual;
          mapped.diagnostico = preparedConsultas[0].diagnostico || mapped.diagnostico;
          mapped.tratamiento = preparedConsultas[0].tratamiento || mapped.tratamiento;
          mapped.notas = preparedConsultas[0].notas || mapped.notas;
        }
        console.log('[Modify] Prefill mapeado:', mapped);
        if (alive) {
          const snapshot = deepClone(mapped);
          prefillRef.current = snapshot;
          consultasPrefillRef.current = deepClone(preparedConsultas);
          setFormData(snapshot);
          setConsultas(preparedConsultas);
          setOpenSection('datos');
          setNuevoAntecedente('');
          setNuevoHabito('');
          setNuevoPatologico('');
          setNuevoInspeccion('');
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('[Modify] Error al cargar perfil:', err);
          alert('Error de red al cargar el perfil');
        }
      } finally {
        if (alive) {
          setIsPrefilling(false);
        }
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    setFormData((prev) => {
      const first = consultas[0];
      const fallback = {
        fecha_consulta: todayISO(),
        recordatorio: '',
        padecimiento_actual: '',
        diagnostico: '',
        tratamiento: '',
        notas: '',
      };
      const source = first
        ? {
            fecha_consulta: first.fecha_consulta || '',
            recordatorio: first.recordatorio || '',
            padecimiento_actual: first.padecimiento_actual || '',
            diagnostico: first.diagnostico || '',
            tratamiento: first.tratamiento || '',
            notas: first.notas || '',
          }
        : fallback;

      let changed = false;
      const next = { ...prev };
      Object.entries(source).forEach(([key, value]) => {
        if ((prev[key] ?? '') !== value) {
          next[key] = value;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [consultas]);

  // Log en tiempo real cada vez que cambia el payload
  useEffect(() => {
    const livePayload = buildNestedPayload(formData);
    livePayload.consultas = buildConsultasPayload(consultas);
    console.log('[Modify] Payload actualizado:', livePayload);
  }, [formData, consultas]);

  // Calculo automatico de IMC cuando hay peso y talla
  useEffect(() => {
    if (isPrefilling) return;
    if (!imcAutoCalcRef.current) return;
    imcAutoCalcRef.current = false;
    const w = parseFloat(formData.peso_actual);
    const hcm = parseFloat(formData.talla_cm);
    const newImc = Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0
      ? (w / Math.pow(hcm / 100, 2)).toFixed(2)
      : '';
    setFormData((prev) => (prev.imc === newImc ? prev : { ...prev, imc: newImc }));
  }, [formData.peso_actual, formData.talla_cm, isPrefilling]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setOpenSection('datos');
      setTimeout(() => {
        if (nombreRef.current) nombreRef.current.focus();
      }, 0);
      alert('El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);

    const payload = buildNestedPayload(formData);
    payload.consultas = buildConsultasPayload(consultas);
    console.log('[Modify] Payload a enviar:', payload);

    try {
      const res = await fetch(`${url}/api/profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Ocurrio un error al actualizar el perfil';
        try {
          const errJson = await res.json();
          if (errJson?.error) message = errJson.error;
        } catch (_) {
          /* noop */
        }
        alert(message);
        return;
      }

      alert('Perfil actualizado correctamente');
      prefillRef.current = deepClone(formData);
      consultasPrefillRef.current = deepClone(sortConsultas(consultas));
      navigate(`/profile/${id}`);
    } catch (err) {
      console.error('[Modify] Error al actualizar perfil:', err);
      alert('Error de red al intentar modificar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const snapshot = deepClone(prefillRef.current || buildInitialForm());
    const consultasSnapshot = deepClone(consultasPrefillRef.current || []);
    setFormData(snapshot);
    setConsultas(sortConsultas(consultasSnapshot));
    setOpenSection('datos');
    setNuevoAntecedente('');
    setNuevoHabito('');
    setNuevoPatologico('');
    setNuevoInspeccion('');
  };
  const addAntecedente = () => {
    if (!nuevoAntecedente) return;
    const esOtro = normalize(nuevoAntecedente) === normalize('Otras');
    setFormData((prev) => ({
      ...prev,
      antecedentes_familiares: [
        ...prev.antecedentes_familiares,
        esOtro
          ? { nombre: '', descripcion: '', esOtro: true }
          : { nombre: nuevoAntecedente, descripcion: '', esOtro: false },
      ],
    }));
    setNuevoAntecedente('');
  };
  const removeAntecedenteAt = (idx) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.filter((_, i) => i !== idx),
    }));
  };
  const updateAntecedenteField = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  // ---- Antecedentes personales: hábitos ----
  const addHabito = () => {
    if (!nuevoHabito) return;
    const base = { tipo: nuevoHabito, campos: {} };
    const tipoNormalized = normalize(nuevoHabito);
    if (tipoNormalized.includes('alcohol')) base.campos = { bebidas_por_dia: '', tiempo_activo_alc: '' };
    if (tipoNormalized.includes('taba')) base.campos = { cigarrillos_por_dia: '', tiempo_activo_tab: '' };
    if (tipoNormalized.includes('toxico')) base.campos = { tipo_toxicomania: '', tiempo_activo_tox: '' };
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_habitos: [...prev.antecedentes_personales_habitos, base],
    }));
    setNuevoHabito('');
  };
  const removeHabitoAt = (idx) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.filter((_, i) => i !== idx),
    }));
  };
  const updateHabitoCampo = (idx, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.map((h, i) => i === idx ? { ...h, campos: { ...h.campos, [campo]: valor } } : h),
    }));
  };

  // Eliminado: lógica de componentes de la dieta (add/remove/update)

  // ---- Antecedentes personales patológicos ----
  const addPatologico = () => {
    if (!nuevoPatologico) return;
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_patologicos: [
        ...prev.antecedentes_personales_patologicos,
        { antecedente: nuevoPatologico, descripcion: '' },
      ],
    }));
    setNuevoPatologico('');
  };
  const removePatologicoAt = (idx) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.filter((_, i) => i !== idx),
    }));
  };
  const updatePatologicoDesc = (idx, valor) => {
    setFormData((prev) => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.map((p, i) => i === idx ? { ...p, descripcion: valor } : p),
    }));
  };

  // ---- Consultas ----
  const handleAddConsulta = () => {
    setConsultas((prev) => sortConsultas([...prev, createEmptyConsulta()]));
  };

  const updateConsultaField = (idx, field, value) => {
    setConsultas((prev) => {
      const next = prev.map((item, index) =>
        index === idx
          ? { ...item, [field]: value, ...(field === 'fecha_consulta' ? { __createdAt: item.__createdAt || Date.now() } : {}) }
          : item
      );
      if (field === 'fecha_consulta') {
        return sortConsultas(next);
      }
      return next;
    });
  };

  // ---- Exploración física: inspección general ----
  const addInspeccion = () => {
    if (!nuevoInspeccion) return;
    setFormData((prev) => ({
      ...prev,
      inspeccion_general: [
        ...prev.inspeccion_general,
        { nombre: nuevoInspeccion, descripcion: '' },
      ],
    }));
    setNuevoInspeccion('');
  };
  const removeInspeccionAt = (idx) => {
    setFormData((prev) => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.filter((_, i) => i !== idx),
    }));
  };
  const updateInspeccionDesc = (idx, valor) => {
    setFormData((prev) => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.map((s, i) => i === idx ? { ...s, descripcion: valor } : s),
    }));
  };
  const Required = () => (
    <AiFillStar
      style={{
        marginLeft: '0.25rem',
        verticalAlign: 'middle',
        color: Palette.primary,
        fontSize: '2.2rem',
      }}
      title="Obligatorio"
    />
  );

  // 👩‍⚕️ Visibilidad Gineco-Obstétricos
  // Muestra la sección solo si el género NO es "Hombre" ("", "Mujer", etc.)
  const showGineco = (formData.genero || '').trim() !== 'Hombre';

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Editar</span> historia clinica.
          </Title>

          <Form onSubmit={handleSubmit} noValidate>
            {/* 🧍 Datos personales -> payload.datos_personales */}
            <details open={openSection === 'datos'} onToggle={handleToggle('datos')}>
              <Summary>
                Datos personales
              </Summary>

              {/* Nombre (requerido) y Género */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="nombre">
                    <FaUser style={{ marginRight: '0.5rem' }} />
                    Nombre
                    <Required />
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    ref={nombreRef}
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Nombre completo"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="genero">
                    {/* icon removed */}
                    Género
                  </Label>
                  <Select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="NA">NA</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>

              {/* Fecha de nacimiento y Teléfono */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="fecha_nacimiento">
                    <FaBirthdayCake style={{ marginRight: '0.5rem' }} />
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="telefono_movil">
                    <FaPhone style={{ marginRight: '0.5rem' }} />
                    Teléfono móvil
                  </Label>
                  <Input
                    id="telefono_movil"
                    type="tel"
                    name="telefono_movil"
                    value={formData.telefono_movil}
                    onChange={handleChange}
                    maxLength={20}
                    placeholder="Ej. +525512345678"
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Correo y Referido por */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="correo_electronico">
                    <MdEmail style={{ marginRight: '0.5rem' }} />
                    Correo electrónico
                  </Label>
                  <Input
                    id="correo_electronico"
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="mail@ejemplo.com"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="referido_por">
                    <FaUserPlus style={{ marginRight: '0.5rem' }} />
                    Referido por
                  </Label>
                  <Input
                    id="referido_por"
                    name="referido_por"
                    value={formData.referido_por}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Persona o canal de referencia"
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Dirección Completa (full width) */}
              <FieldGroup>
                <Label htmlFor="residencia">
                  <MdHome style={{ marginRight: '0.5rem' }} />
                  Dirección Completa
                </Label>
                <TextArea
                  id="residencia"
                  name="residencia"
                  value={formData.residencia}
                  onChange={handleChange}
                  maxLength={255}
                  rows={4}
                  placeholder="Calle, número, colonia, ciudad, CP"
                />
              </FieldGroup>

              {/* Ocupación y Escolaridad */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="ocupacion">
                    <MdWork style={{ marginRight: '0.5rem' }} />
                    Ocupación
                  </Label>
                  <Input
                    id="ocupacion"
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="escolaridad">
                    <FaGraduationCap style={{ marginRight: '0.5rem' }} />
                    Escolaridad
                  </Label>
                  <Input
                    id="escolaridad"
                    name="escolaridad"
                    value={formData.escolaridad}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Estado civil y Tipo de sangre */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="estado_civil">
                    Estado civil
                  </Label>
                  <Select
                    id="estado_civil"
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Soltero">Soltero</option>
                    <option value="Casado">Casado</option>
                    <option value="Divorciado">Divorciado</option>
                    <option value="Viudo">Viudo</option>
                    <option value="Union libre">Union libre</option>
                    <option value="Otro">Otro</option>
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="tipo_sangre">
                    <FaTint style={{ marginRight: '0.5rem' }} />
                    Tipo de sangre
                  </Label>
                  <Input
                    id="tipo_sangre"
                    name="tipo_sangre"
                    value={formData.tipo_sangre}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Ej. O+, A-"
                  />
                </FieldGroup>
              </TwoColumnRow>
              {/* Eliminado: fila separada de Referido por (se movió junto a Correo) */}
            </details>

            {/* 👪 Antecedentes familiares -> payload.antecedentes_familiares[] */}
            <details open={openSection === 'familiares'} onToggle={handleToggle('familiares')}>
              <Summary>Antecedentes familiares</Summary>

              {/* Selector para agregar antecedente */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_antecedente">Selecciona un antecedente</Label>
                  <Select
                    id="select_antecedente"
                    value={nuevoAntecedente}
                    onChange={e => setNuevoAntecedente(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {ANTECEDENTES_OPCIONES
                      .filter(opt => {
                        const selectedNames = formData.antecedentes_familiares.map(a => (a.esOtro ? 'Otras' : a.nombre));
                        return !selectedNames.some(name => normalize(name) === normalize(opt));
                      })
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addAntecedente} disabled={!nuevoAntecedente || isPrefilling}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar antecedente
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {/* Lista de antecedentes seleccionados */}
              {formData.antecedentes_familiares.length > 0 && (
                <ListContainer>
                  {formData.antecedentes_familiares.map((a, idx) => (
                    <ItemCard key={idx}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label><FaUsers style={{ marginRight: '0.5rem' }} />{a.esOtro ? 'Otra (especifique)' : 'Antecedente'}</Label>
                          {a.esOtro ? (
                            <Input
                              value={a.nombre}
                              onChange={e => updateAntecedenteField(idx, 'nombre', e.target.value)}
                              placeholder="Especifique el antecedente"
                              maxLength={100}
                            />
                          ) : (
                            <Input value={a.nombre} disabled />
                          )}
                        </FieldGroup>
                        <FieldGroup>
                          <Label>Descripción</Label>
                          <TextArea
                            value={a.descripcion}
                            onChange={e => updateAntecedenteField(idx, 'descripcion', e.target.value)}
                            rows={3}
                            placeholder="Detalles relevantes, familiar afectado, edad de inicio, etc."
                          />
                        </FieldGroup>
                      </TwoColumnRow>
                      <ItemActions>
                        <DangerButton type="button" onClick={() => removeAntecedenteAt(idx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}
            </details>

            {/* 🧗 Hábitos y alimentación -> payload.antecedentes_personales */}
            <details open={openSection === 'personales'} onToggle={handleToggle('personales')}>
              <Summary>
                Antecedentes personales
              </Summary>
              {/* Select dinámico: Alcoholismo / Tabaquismo / Toxicomanías */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_habito">Selecciona hábito</Label>
                  <Select
                    id="select_habito"
                    value={nuevoHabito}
                    onChange={e => setNuevoHabito(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {HABITOS_OPCIONES
                      .filter(opt => !formData.antecedentes_personales_habitos.some(h => normalize(h.tipo) === normalize(opt)))
                      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addHabito} disabled={!nuevoHabito || isPrefilling}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar hábito
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {formData.antecedentes_personales_habitos.length > 0 && (
                <ListContainer>
                  {formData.antecedentes_personales_habitos.map((h, idx) => (
                    <ItemCard key={idx}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{h.tipo}</strong>
                      <TwoColumnRow>
                        {h.tipo === 'Alcoholismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`bebidas_${idx}`}>Alcohol: Bebidas por día</Label>
                              <Input
                                id={`bebidas_${idx}`}
                                value={h.campos.bebidas_por_dia}
                                onChange={e => updateHabitoCampo(idx, 'bebidas_por_dia', e.target.value)}
                                inputMode="numeric"
                                placeholder="Ej. 2"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`freq_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`freq_${idx}`}
                                value={h.campos.tiempo_activo_alc}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_alc', e.target.value)}
                                placeholder="Ej. 5 años"
                              />
                            </FieldGroup>
                          </>
                        )}

                        {h.tipo === 'Tabaquismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`cigs_${idx}`}>Cigarrillos por día</Label>
                              <Input
                                id={`cigs_${idx}`}
                                value={h.campos.cigarrillos_por_dia}
                                onChange={e => updateHabitoCampo(idx, 'cigarrillos_por_dia', e.target.value)}
                                inputMode="numeric"
                                placeholder="Ej. 10"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`tiempo_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`tiempo_${idx}`}
                                value={h.campos.tiempo_activo_tab}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_tab', e.target.value)}
                                placeholder="Ej. 5 años"
                              />
                            </FieldGroup>
                          </>
                        )}

                        {h.tipo === 'Toxicomanías' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`tox_${idx}`}>Tipo de toxicomanía</Label>
                              <Input
                                id={`tox_${idx}`}
                                value={h.campos.tipo_toxicomania}
                                onChange={e => updateHabitoCampo(idx, 'tipo_toxicomania', e.target.value)}
                                placeholder="Sustancia"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`tox_freq_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`tox_freq_${idx}`}
                                value={h.campos.tiempo_activo_tox}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_tox', e.target.value)}
                                placeholder="Ej. diario, esporádico"
                              />
                            </FieldGroup>
                          </>
                        )}
                      </TwoColumnRow>

                      <ItemActions>
                        <DangerButton type="button" onClick={() => removeHabitoAt(idx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}

              {/* Eliminado: Select y lista de componentes de la dieta */}

              {/* Campos fijos */}
              <TwoColumnRow>
                {/* Eliminado: Vacunación */}
                <FieldGroup>
                  <Label htmlFor="alimentacion_calidad">Alimentación (calidad)</Label>
                  <Select id="calidad" name="calidad" value={formData.calidad} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Buena">Buena</option>
                    <option value="Regular">Regular</option>
                    <option value="Mala">Mala</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>

              <FieldGroup>
                <Label htmlFor="alimentacion_descripcion"><FaUtensils style={{ marginRight: '0.5rem' }} />Descripción de la alimentación</Label>
                <TextArea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} placeholder="Describe la alimentación del paciente" />
              </FieldGroup>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="hay_cambios">Cambios en la alimentación</Label>
                  <Select id="hay_cambios" name="hay_cambios" value={formData.hay_cambios} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>
                {formData.hay_cambios === 'Si' && (
                  <FieldGroup>
                    <Label htmlFor="cambio_tipo"><FaExchangeAlt style={{ marginRight: '0.5rem' }} />Tipo de cambio</Label>
                    <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
                  </FieldGroup>
                )}
              </TwoColumnRow>

              {formData.hay_cambios === 'Si' && (
                <TwoColumnRow>
                  <FieldGroup>
                    <Label htmlFor="cambio_causa"><FaExclamationCircle style={{ marginRight: '0.5rem' }} />Causa del cambio</Label>
                    <Input id="cambio_causa" name="cambio_causa" value={formData.cambio_causa} onChange={handleChange} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label htmlFor="cambio_tiempo"><FaClock style={{ marginRight: '0.5rem' }} />Tiempo</Label>
                    <Input id="cambio_tiempo" name="cambio_tiempo" value={formData.cambio_tiempo} onChange={handleChange} placeholder="Ej. 6 meses" />
                  </FieldGroup>
                </TwoColumnRow>
              )}
            </details>

            {/* 👶 Gineco-Obstétricos -> payload.gineco_obstetricos (solo si no es Hombre) */}
            {showGineco && (
            <details open={openSection === 'gineco'} onToggle={handleToggle('gineco')}>
              <Summary>Gineco-Obstetricos</Summary>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_edad_menarca"><FaFemale style={{ marginRight: '0.5rem' }} />Edad de la primera menstruacion</Label>
                  <Input
                    id="gineco_edad_menarca"
                    name="gineco_edad_menarca"
                    value={formData.gineco_edad_menarca}
                    onChange={handleChange}
                    placeholder="Ej. 12"
                    inputMode="numeric"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_ciclo"><FaCalendarAlt style={{ marginRight: '0.5rem' }} />Ciclo/Dias</Label>
                  <Input
                    id="gineco_ciclo"
                    name="gineco_ciclo"
                    value={formData.gineco_ciclo}
                    onChange={handleChange}
                    placeholder="Ej. 28 dias"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_cantidad"><FaTint style={{ marginRight: '0.5rem' }} />Cantidad</Label>
                  <Input
                    id="gineco_cantidad"
                    name="gineco_cantidad"
                    value={formData.gineco_cantidad}
                    onChange={handleChange}
                    placeholder="Ej. Moderado"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_dolor">Dolor</Label>
                  <Select
                    id="gineco_dolor"
                    name="gineco_dolor"
                    value={formData.gineco_dolor}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_ultima_menstruacion"><FaCalendarCheck style={{ marginRight: '0.5rem' }} />Fecha de la ultima menstruacion</Label>
                  <Input
                    id="gineco_fecha_ultima_menstruacion"
                    name="gineco_fecha_ultima_menstruacion"
                    type="date"
                    value={formData.gineco_fecha_ultima_menstruacion}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_vida_sexual_activa">Vida sexual activa</Label>
                  <Select
                    id="gineco_vida_sexual_activa"
                    name="gineco_vida_sexual_activa"
                    value={formData.gineco_vida_sexual_activa}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>
              {formData.gineco_vida_sexual_activa === 'Si' ? (
                <TwoColumnRow>
                  <FieldGroup>
                    <Label htmlFor="gineco_anticoncepcion">Anticoncepcion</Label>
                    <Select
                      id="gineco_anticoncepcion"
                      name="gineco_anticoncepcion"
                      value={formData.gineco_anticoncepcion}
                      onChange={handleChange}
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="Si">Si</option>
                      <option value="No">No</option>
                    </Select>
                  </FieldGroup>
                  {formData.gineco_anticoncepcion === 'Si' ? (
                    <FieldGroup>
                      <Label htmlFor="gineco_tipo_anticonceptivo"><FaPills style={{ marginRight: '0.5rem' }} />Tipo de anticonceptivo</Label>
                      <Input
                        id="gineco_tipo_anticonceptivo"
                        name="gineco_tipo_anticonceptivo"
                        value={formData.gineco_tipo_anticonceptivo}
                        onChange={handleChange}
                        placeholder="Ej. DIU, Implante, Pastillas"
                      />
                    </FieldGroup>
                  ) : null}
                </TwoColumnRow>
              ) : null}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_gestas"><FaBaby style={{ marginRight: '0.5rem' }} />Gestas</Label>
                  <Input
                    id="gineco_gestas"
                    name="gineco_gestas"
                    value={formData.gineco_gestas}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 2"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_partos"><FaBabyCarriage style={{ marginRight: '0.5rem' }} />Partos</Label>
                  <Input
                    id="gineco_partos"
                    name="gineco_partos"
                    value={formData.gineco_partos}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 1"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_cesareas"><FaProcedures style={{ marginRight: '0.5rem' }} />Cesareas</Label>
                  <Input
                    id="gineco_cesareas"
                    name="gineco_cesareas"
                    value={formData.gineco_cesareas}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 0"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_abortos"><FaHeartbeat style={{ marginRight: '0.5rem' }} />Abortos</Label>
                  <Input
                    id="gineco_abortos"
                    name="gineco_abortos"
                    value={formData.gineco_abortos}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 0"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_ultimo_parto"><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha del ultimo parto</Label>
                  <Input
                    id="gineco_fecha_ultimo_parto"
                    name="gineco_fecha_ultimo_parto"
                    type="date"
                    value={formData.gineco_fecha_ultimo_parto}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_menopausia"><FaCalendarTimes style={{ marginRight: '0.5rem' }} />Fecha de menopausia</Label>
                  <Input
                    id="gineco_fecha_menopausia"
                    name="gineco_fecha_menopausia"
                    type="date"
                    value={formData.gineco_fecha_menopausia}
                    onChange={handleChange}
                  />
                </FieldGroup>
              </TwoColumnRow>
            </details>
            )}

            {/* 🧬 Patológicos -> payload.antecedentes_personales_patologicos[] */}
            <details open={openSection === 'patologicos'} onToggle={handleToggle('patologicos')}>
              <Summary>Antecedentes personales patológicos</Summary>

              {/* Selector para agregar patológico */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_patologico">Selecciona un antecedente</Label>
                  <Select
                    id="select_patologico"
                    value={nuevoPatologico}
                    onChange={e => setNuevoPatologico(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {PATOLOGICOS_OPCIONES
                      .filter(opt => !formData.antecedentes_personales_patologicos.some(p => normalize(p.antecedente) === normalize(opt)))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addPatologico} disabled={!nuevoPatologico || isPrefilling}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {/* Lista de patológicos agregados */}
              {formData.antecedentes_personales_patologicos.length > 0 && (
                <ListContainer>
                  {formData.antecedentes_personales_patologicos.map((p, idx) => (
                    <ItemCard key={idx}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label><FaFileMedical style={{ marginRight: '0.5rem' }} />Antecedente</Label>
                          <Input value={p.antecedente} disabled />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>{`Descripción de antecedente: ${p.antecedente.toLowerCase()}`}</Label>
                          <TextArea
                            value={p.descripcion}
                            onChange={e => updatePatologicoDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${p.antecedente.toLowerCase()}`}
                          />
                        </FieldGroup>
                      </TwoColumnRow>
                      <ItemActions>
                        <DangerButton type="button" onClick={() => removePatologicoAt(idx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}
            </details>

            {/* 🩺 Exploración física -> payload.exploracion_fisica */}
            <details open={openSection === 'exploracion'} onToggle={handleToggle('exploracion')}>
              <Summary>Exploración física</Summary>

              {/* Datos antropométricos y vitales */}
              <TwoColumnRow $cols={3}>
                <FieldGroup>
                  <Label htmlFor="peso_actual"><FaWeight style={{ marginRight: '0.5rem' }} />Peso actual (kg)</Label>
                  <Input id="peso_actual" name="peso_actual" value={formData.peso_actual} onChange={handleChange} inputMode="decimal" placeholder="Ej. 72" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="peso_anterior"><FaHistory style={{ marginRight: '0.5rem' }} />Peso anterior (kg)</Label>
                  <Input id="peso_anterior" name="peso_anterior" value={formData.peso_anterior} onChange={handleChange} inputMode="decimal" placeholder="Ej. 75" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="talla_cm"><FaRulerVertical style={{ marginRight: '0.5rem' }} />Talla (cm)</Label>
                  <Input id="talla_cm" name="talla_cm" value={formData.talla_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 170" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow $cols={3}>
                <FieldGroup>
                  <Label htmlFor="peso_deseado"><FaBullseye style={{ marginRight: '0.5rem' }} />Peso deseado (kg)</Label>
                  <Input id="peso_deseado" name="peso_deseado" value={formData.peso_deseado} onChange={handleChange} inputMode="decimal" placeholder="Ej. 68" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="peso_ideal"><FaBalanceScale style={{ marginRight: '0.5rem' }} />Peso ideal (kg)</Label>
                  <Input id="peso_ideal" name="peso_ideal" value={formData.peso_ideal} onChange={handleChange} inputMode="decimal" placeholder="Ej. 70" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="imc"><FaChartBar style={{ marginRight: '0.5rem' }} />IMC</Label>
                  <Input id="imc" name="imc" value={formData.imc} readOnly placeholder="Ej. 24.90" />
                </FieldGroup>
              </TwoColumnRow>
              
              <TwoColumnRow $cols={3}>
                <FieldGroup>
                  <Label htmlFor="rtg"><FaHeartbeat style={{ marginRight: '0.5rem' }} />% RTG</Label>
                  <Input id="rtg" name="rtg" value={formData.rtg} onChange={handleChange} inputMode="decimal" placeholder="Ej. 20" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="ta_mmhg"><FaHeart style={{ marginRight: '0.5rem' }} />TA (mmHg)</Label>
                  <Input id="ta_mmhg" name="ta_mmhg" value={formData.ta_mmhg} onChange={handleChange} placeholder="Ej. 120/80" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="frecuencia_cardiaca"><FaHeart style={{ marginRight: '0.5rem' }} />FC (frecuencia cardiaca)</Label>
                  <Input id="frecuencia_cardiaca" name="frecuencia_cardiaca" value={formData.frecuencia_cardiaca} onChange={handleChange} inputMode="numeric" placeholder="lpm" />
                </FieldGroup>
                
              </TwoColumnRow>
              
              <TwoColumnRow $cols={3}>
                <FieldGroup>
                  <Label htmlFor="frecuencia_respiratoria"><GiLungs style={{ marginRight: '0.5rem' }} />FR (frecuencia respiratoria)</Label>
                  <Input id="frecuencia_respiratoria" name="frecuencia_respiratoria" value={formData.frecuencia_respiratoria} onChange={handleChange} inputMode="numeric" placeholder="rpm" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="temperatura_c"><FaThermometerHalf style={{ marginRight: '0.5rem' }} />Temp (°C)</Label>
                  <Input id="temperatura_c" name="temperatura_c" value={formData.temperatura_c} onChange={handleChange} inputMode="decimal" placeholder="Ej. 36.7" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="cadera_cm"><FaRulerCombined style={{ marginRight: '0.5rem' }} />Cadera (cm)</Label>
                  <Input id="cadera_cm" name="cadera_cm" value={formData.cadera_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 95" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow $cols={4}>
                
                <FieldGroup>
                  <Label htmlFor="cintura_cm"><FaRulerHorizontal style={{ marginRight: '0.5rem' }} />Cintura (cm)</Label>
                  <Input id="cintura_cm" name="cintura_cm" value={formData.cintura_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 80" />
                </FieldGroup>
              </TwoColumnRow>

              {/* Inspección general (dinámica) */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_inspeccion">Inspección general</Label>
                  <Select
                    id="select_inspeccion"
                    value={nuevoInspeccion}
                    onChange={e => setNuevoInspeccion(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {INSPECCION_OPCIONES
                      .filter(opt => !formData.inspeccion_general.some(s => normalize(s.nombre) === normalize(opt)))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addInspeccion} disabled={!nuevoInspeccion || isPrefilling}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {formData.inspeccion_general.length > 0 && (
                <ListContainer>
                  {formData.inspeccion_general.map((s, idx) => (
                    <ItemCard key={idx}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label><FaStethoscope style={{ marginRight: '0.5rem' }} />Área</Label>
                          <Input value={s.nombre} disabled />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>{`Descripción de ${s.nombre.toLowerCase()}`}</Label>
                          <TextArea
                            value={s.descripcion}
                            onChange={e => updateInspeccionDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${s.nombre.toLowerCase()}`}
                          />
                        </FieldGroup>
                      </TwoColumnRow>
                      <ItemActions>
                        <DangerButton type="button" onClick={() => removeInspeccionAt(idx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}
            </details>

            {/* 📅 Consultas (padecimiento + interrogatorio) -> payload.consultas */}
            <details open={openSection === 'consultas'} onToggle={handleToggle('consultas')}>
              <Summary>Consultas</Summary>

              <FieldGroup>
                <SubmitButton
                  type="button"
                  onClick={handleAddConsulta}
                  disabled={isPrefilling || isSubmitting}
                >
                  <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                  Nueva consulta
                </SubmitButton>
              </FieldGroup>

              {consultas.length === 0 && (
                <p style={{ margin: '1rem 0', fontStyle: 'italic' }}>
                  No hay consultas registradas.
                </p>
              )}

              {consultas.length > 0 && (
                <div>
                  {consultas.map((consulta, idx) => {
                    const consultaKey = consulta.__clientId || `consulta-${idx}`;
                    const titulo = `Consulta ${consultas.length - idx}`;
                    const separatorStyle = idx === 0 ? {} : { borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' };

                    return (
                      <div key={consultaKey} style={{ marginBottom: '2rem', ...separatorStyle }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1.6rem', color: Palette.primary }}>{titulo}</h4>

                        <TwoColumnRow>
                          <FieldGroup>
                            <Label htmlFor={`${consultaKey}-fecha`}><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta</Label>
                            <Input
                              type="date"
                              id={`${consultaKey}-fecha`}
                              value={consulta.fecha_consulta}
                              onChange={(e) => updateConsultaField(idx, 'fecha_consulta', e.target.value)}
                            />
                          </FieldGroup>
                          <FieldGroup>
                            <Label htmlFor={`${consultaKey}-recordatorio`}><FaBell style={{ marginRight: '0.5rem' }} />Recordatorio</Label>
                            <Input
                              type="date"
                              id={`${consultaKey}-recordatorio`}
                              value={consulta.recordatorio}
                              onChange={(e) => updateConsultaField(idx, 'recordatorio', e.target.value)}
                            />
                          </FieldGroup>
                        </TwoColumnRow>

                        <FieldGroup>
                          <Label htmlFor={`${consultaKey}-padecimiento`}><FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual</Label>
                          <TextArea
                            id={`${consultaKey}-padecimiento`}
                            value={consulta.padecimiento_actual}
                            onChange={(e) => updateConsultaField(idx, 'padecimiento_actual', e.target.value)}
                            rows={6}
                            placeholder="Describe el padecimiento actual"
                          />
                        </FieldGroup>

                        <FieldGroup>
                          <Label htmlFor={`${consultaKey}-diagnostico`}><FaDiagnoses style={{ marginRight: '0.5rem' }} />Diagnóstico</Label>
                          <TextArea
                            id={`${consultaKey}-diagnostico`}
                            value={consulta.diagnostico}
                            onChange={(e) => updateConsultaField(idx, 'diagnostico', e.target.value)}
                            rows={6}
                            placeholder="Escribe el diagnóstico clínico"
                          />
                        </FieldGroup>

                        <FieldGroup>
                          <Label htmlFor={`${consultaKey}-tratamiento`}><FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Tratamiento</Label>
                          <TextArea
                            id={`${consultaKey}-tratamiento`}
                            value={consulta.tratamiento}
                            onChange={(e) => updateConsultaField(idx, 'tratamiento', e.target.value)}
                            rows={6}
                            placeholder="Plan de tratamiento"
                          />
                        </FieldGroup>

                        <FieldGroup>
                          <Label htmlFor={`${consultaKey}-notas`}><FaStickyNote style={{ marginRight: '0.5rem' }} />Notas</Label>
                          <TextArea
                            id={`${consultaKey}-notas`}
                            value={consulta.notas}
                            onChange={(e) => updateConsultaField(idx, 'notas', e.target.value)}
                            rows={6}
                            placeholder="Notas de la consulta"
                          />
                        </FieldGroup>

                        {CONSULTA_SYSTEM_FIELDS.map(({ key, label }) => (
                          <FieldGroup key={key}>
                            <Label htmlFor={`${consultaKey}-${key}`}>{label}</Label>
                            <TextArea
                              id={`${consultaKey}-${key}`}
                              value={consulta[key]}
                              onChange={(e) => updateConsultaField(idx, key, e.target.value)}
                              rows={4}
                              placeholder={`Descripción de ${label.toLowerCase()}`}
                            />
                          </FieldGroup>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </details>

            {/* Botonera */}
            <ButtonRow>
              <CancelButton
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isPrefilling}
              >
                Deshacer cambios
              </CancelButton>
              <SubmitButton type="submit" disabled={isSubmitting || isPrefilling}>
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </SubmitButton>
            </ButtonRow>
          </Form>
        </FormCard>
      </AddContainer>
    </>
  );
};

export default Modify;

