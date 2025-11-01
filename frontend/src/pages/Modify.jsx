// modify.jsx (actualizado para edicion de perfiles)
import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
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
  AlergicoContainer,
  AlergicoOptions,
  AlergicoOption,
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
import { usePerfilModify } from '../components/modify/usePerfilModify';

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
  FaClipboardCheck,
  FaTrash,
  FaPlusCircle,
  FaSave,
} from 'react-icons/fa';
import { MdEmail, MdHome, MdWork, MdDescription } from 'react-icons/md';
import { GiLungs } from 'react-icons/gi';
import { EstadoChecklist, EstadoOptionLabel, EstadoCheckbox, FloatingSave } from './modify.styles';




// Estilos locales para elementos anidados de Consultas
const NestedDetails = styled.details`
  margin-left: 1rem;
`;
const NestedToolbar = styled.div`
  margin-left: 1rem;
`;
const InnerSummary = styled(Summary)`
  background: #f7fbff;
  border-left: 4px solid ${Palette.primary};
  border-radius: 4px;
`;

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
  // Prefer the last numeric group (e.g., incremental id or timestamp)
  const last = matches[matches.length - 1];
  const num = parseInt(last, 10);
  return Number.isFinite(num) ? num : Number.NaN;
};

const sortConsultasAsc = (entries = []) => {
  // decorate with original index to ensure stable final ordering
  const decorated = entries.map((item, index) => ({ item, index }));

  decorated.sort((a, b) => {
    const da = parseDateValue(a.item?.fecha_consulta);
    const db = parseDateValue(b.item?.fecha_consulta);
    const aHasDate = Number.isFinite(da);
    const bHasDate = Number.isFinite(db);

    // Primary: by date ascending (oldest first) when both have valid dates and are different
    if (aHasDate && bHasDate && da !== db) return da - db;

    // Fallback: by numeric id (highest first) when dates are equal or unavailable
    const ida = extractNumericId(a.item);
    const idb = extractNumericId(b.item);
    const aHasId = Number.isFinite(ida);
    const bHasId = Number.isFinite(idb);
    if (aHasId && bHasId && ida !== idb) return idb - ida; // highest id first

    // If one has date and the other doesn't, prefer the one with a valid date
    if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;

    // Stable fallback: original order
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
  { needle: 'Medicamentos', descKeys: ['medicamentos_desc', 'medicamentos'], estadoKey: 'medicamentos_estado' },
];

const SISTEMA_FIELD_LOOKUP = SISTEMA_FIELD_MAPPINGS.reduce((acc, config) => {
  acc[normalize(config.needle)] = config;
  return acc;
}, {});

const findSistemaConfig = (nombre) => SISTEMA_FIELD_LOOKUP[normalize(nombre)] || null;

const SISTEMA_ESTADO_OPTIONS = [
  { value: 'mejoro', label: 'Mejor\u00f3' },
  { value: 'igual', label: 'Igual' },
  { value: 'empeoro', label: 'Empeor\u00f3' },
  { value: 'se_quito', label: 'Se quit\u00f3' },
];

const mapSistemasFromSource = (source = {}) => {
  const direct = toArr(source?.interrogatorio_aparatos)
    .map((item) => {
      const nombre = toStr(item?.nombre);
      const descripcion = toStr(item?.descripcion);
      const estado = toStr(item?.estado).trim();
      if (!nombre && !descripcion && !estado) return null;
      return {
        nombre,
        descripcion,
        estado,
      };
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
      return {
        nombre: label,
        descripcion: descripcion || '',
        estado,
      };
    })
    .filter(Boolean);
};

const createEmptyConsulta = () => ({
  uid: generateConsultaUid(),
  fecha_consulta: todayISO(),
  recordatorio: '',
  padecimiento_actual: '',
  diagnostico: '',
  tratamiento: '',
  notas: '',
  interrogatorio_aparatos: [],
  personalizados: [],
});

const trimValue = (value) => {
  if (typeof value === 'string') return value.trim();
  return value ?? '';
};

const buildPayloadWithConsultas = (data, idPerfil) => {
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
      return {
        nombre,
        descripcion,
        estado,
      };
    });

    const personalizados = toArr(consulta?.personalizados)
      .map((p) => ({
        nombre: trimValue(p?.nombre),
        descripcion: trimValue(p?.descripcion),
      }))
      .filter((p) => p.nombre !== '' || p.descripcion !== '');

    return {
      ...payload,
      interrogatorio_aparatos,
      personalizados,
    };
  });

  base.consultas = consultas;
  if (idPerfil != null && idPerfil !== '') {
    const numericId = Number(idPerfil);
    base.id_perfil = Number.isFinite(numericId) && numericId > 0 ? numericId : idPerfil;
  }
  return base;
};

const Modify = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { formData, setFormData, isLoading, original } = usePerfilModify(id);
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
  const [nuevoAntecedente, setNuevoAntecedente] = useState('');
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [nuevoPatologico, setNuevoPatologico] = useState('');
  const [nuevoSistemaPorConsulta, setNuevoSistemaPorConsulta] = useState({});
  // Toggle exclusivo para 'alérgico': permite ninguno o sólo uno (Sí/No)
  const toggleAlergico = (valor) => (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      alergico: checked ? valor : (prev.alergico === valor ? '' : prev.alergico),
    }));
  };
  const [nuevoInspeccion, setNuevoInspeccion] = useState('');
  const nombreRef = useRef(null);
  const imcAutoCalcRef = useRef(false);

  // Mostrar en la interfaz de la más reciente a la más antigua
  const consultasOrdenadas = sortConsultasAsc(toArr(formData.consultas)).slice().reverse();
  // Identificar siempre la consulta más antigua (nunca debe mostrar seguimiento)
  const oldestConsultaUid = (sortConsultasAsc(toArr(formData.consultas))[0]?.uid) ?? null;

  // Control de acordeón interno: solo una consulta abierta a la vez
  const [openConsultaUid, setOpenConsultaUid] = useState(null);
  const handleToggleConsulta = (uid) => (e) => {
    if (e.currentTarget.open) {
      setOpenConsultaUid(uid);
    } else if (openConsultaUid === uid) {
      setOpenConsultaUid(null);
    }
  };


  const handleChange = ({ target: { name, value } }) => {
    if (name === 'peso_actual' || name === 'talla_cm') {
      imcAutoCalcRef.current = true;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Al terminar de prellenar, reiniciar estados de UI auxiliares
  useEffect(() => {
    if (isLoading) return;
    setOpenSection('datos');
    setNuevoAntecedente('');
    setNuevoHabito('');
    setNuevoPatologico('');
    setNuevoSistemaPorConsulta({});
    setNuevoInspeccion('');
  }, [isLoading]);

  // Log en tiempo real cada vez que cambia el payload
  useEffect(() => {
    const livePayload = buildPayloadWithConsultas(formData, id);
    console.log('[Modify] Payload actualizado:', livePayload);
  }, [formData, id]);

  // Calculo automatico de IMC cuando hay peso y talla
  useEffect(() => {
    if (isLoading) return;
    if (!imcAutoCalcRef.current) return;
    imcAutoCalcRef.current = false;
    const w = parseFloat(formData.peso_actual);
    const hcm = parseFloat(formData.talla_cm);
    const newImc = Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0
      ? (w / Math.pow(hcm / 100, 2)).toFixed(2)
      : '';
    setFormData((prev) => (prev.imc === newImc ? prev : { ...prev, imc: newImc }));
  }, [formData.peso_actual, formData.talla_cm, isLoading]);

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

    const payload = buildPayloadWithConsultas(formData, id);
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
        } catch {
          /* noop */
        }
        alert(message);
        return;
      }

      alert('Perfil actualizado correctamente');
      navigate(`/profile/${id}`);
    } catch (err) {
      console.error('[Modify] Error al actualizar perfil:', err);
      alert('Error de red al intentar modificar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const snapshot = deepClone(original || buildInitialForm());
    setFormData(snapshot);
    setOpenSection('datos');
    setNuevoAntecedente('');
    setNuevoHabito('');
    setNuevoPatologico('');
    setNuevoSistemaPorConsulta({});
    setNuevoInspeccion('');
  };
  // Ref para submit programático (botón flotante)
  const formElRef = useRef(null);
  const addAntecedente = () => {
    if (!nuevoAntecedente) return;
    const esOtro = normalize(nuevoAntecedente) === normalize('Otras');
    setFormData((prev) => ({
      ...prev,
      // Insertar al inicio
      antecedentes_familiares: [
        esOtro
          ? { nombre: '', descripcion: '', esOtro: true }
          : { nombre: nuevoAntecedente, descripcion: '', esOtro: false },
        ...prev.antecedentes_familiares,
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
      // Insertar al inicio
      antecedentes_personales_habitos: [base, ...prev.antecedentes_personales_habitos],
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
      // Insertar al inicio
      antecedentes_personales_patologicos: [
        { antecedente: nuevoPatologico, descripcion: '' },
        ...prev.antecedentes_personales_patologicos,
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

  const syncPrimaryConsulta = (data, consultasList) => {
    const last = consultasList[consultasList.length - 1] || {};
    return {
      ...data,
      fecha_consulta: last.fecha_consulta || '',
      recordatorio: last.recordatorio || '',
      padecimiento_actual: last.padecimiento_actual || '',
      diagnostico: last.diagnostico || '',
      tratamiento: last.tratamiento || '',
      notas: last.notas || '',
      interrogatorio_aparatos: toArr(last.interrogatorio_aparatos),
    };
  };

  const updateConsultas = (updater) => {
    setFormData((prev) => {
      const current = toArr(prev.consultas);
      const updated = updater(current);
      const sorted = sortConsultasAsc(updated);
      return syncPrimaryConsulta({ ...prev, consultas: sorted }, sorted);
    });
  };

  const handleNuevaConsulta = () => {
    // Crear nueva consulta y autocompletar desde la más reciente
    const current = toArr(formData.consultas);
    const last = sortConsultasAsc(current)[current.length - 1] || null;
    const nueva = createEmptyConsulta();
    if (last) {
      nueva.padecimiento_actual = toStr(last.padecimiento_actual);
      nueva.diagnostico = toStr(last.diagnostico);
      nueva.interrogatorio_aparatos = deepClone(toArr(last.interrogatorio_aparatos));
      // Copiar también los personalizados de la última consulta para mantener continuidad visual
      nueva.personalizados = deepClone(toArr(last.personalizados));
    }
    updateConsultas((list) => [nueva, ...list]);
    setNuevoSistemaPorConsulta((prev) => ({ ...prev, [nueva.uid]: '' }));
  };

  const handleEliminarConsulta = (uid) => {
    updateConsultas((current) => current.filter((consulta) => consulta.uid !== uid));
    setNuevoSistemaPorConsulta((prev) => {
      if (!(uid in prev)) return prev;
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  const handleConsultaFieldChange = (uid, field) => (event) => {
    const { value } = event.target;
    updateConsultas((current) =>
      current.map((consulta) =>
        consulta.uid === uid ? { ...consulta, [field]: value } : consulta,
      ),
    );
  };

  const handleSistemaSelectChange = (uid) => (event) => {
    const { value } = event.target;
    setNuevoSistemaPorConsulta((prev) => ({ ...prev, [uid]: value }));
  };

  const handleAgregarSistema = (uid) => {
    const seleccionado = (nuevoSistemaPorConsulta[uid] || '').trim();
    if (!seleccionado) return;
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        return {
          ...consulta,
          // Insertar el nuevo sistema al inicio de la lista
          interrogatorio_aparatos: [
            { nombre: seleccionado, descripcion: '', estado: '' },
            ...toArr(consulta.interrogatorio_aparatos),
          ],
        };
      }),
    );
    setNuevoSistemaPorConsulta((prev) => ({ ...prev, [uid]: '' }));
  };

  // ---- Consultas: personalizados (título + descripción) por consulta ----
  const handleAgregarPersonalizado = (uid) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        const list = toArr(consulta.personalizados);
        if (list.length >= 10) return consulta;
        return {
          ...consulta,
          personalizados: [{ nombre: '', descripcion: '' }, ...list],
        };
      }),
    );
  };
  const handleEliminarPersonalizado = (uid, idx) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        return {
          ...consulta,
          personalizados: toArr(consulta.personalizados).filter((_, i) => i !== idx),
        };
      }),
    );
  };
  const handleActualizarPersonalizado = (uid, idx, field, valor) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        return {
          ...consulta,
          personalizados: toArr(consulta.personalizados).map((p, i) => (i === idx ? { ...p, [field]: valor } : p)),
        };
      }),
    );
  };

  const handleEliminarSistema = (uid, idx) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        return {
          ...consulta,
          interrogatorio_aparatos: toArr(consulta.interrogatorio_aparatos).filter((_, i) => i !== idx),
        };
      }),
    );
  };

  const handleActualizarSistemaDesc = (uid, idx, valor) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        return {
          ...consulta,
          interrogatorio_aparatos: toArr(consulta.interrogatorio_aparatos).map((s, i) =>
            i === idx ? { ...s, descripcion: valor } : s,
          ),
        };
      }),
    );
  };

  const handleToggleSistemaEstado = (uid, idx, value) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        const updated = toArr(consulta.interrogatorio_aparatos).map((s, i) => {
          if (i !== idx) return s;
          const currentEstado = toStr(s?.estado);
          const nextEstado = currentEstado === value ? '' : value;
          return { ...s, estado: nextEstado };
        });
        return { ...consulta, interrogatorio_aparatos: updated };
      }),
    );
  };

  // ---- Exploración física: inspección general ----
  const addInspeccion = () => {
    if (!nuevoInspeccion) return;
    setFormData((prev) => ({
      ...prev,
      // Insertar nueva inspección al inicio
      inspeccion_general: [
        { nombre: nuevoInspeccion, descripcion: '' },
        ...prev.inspeccion_general,
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

          <Form ref={formElRef} onSubmit={handleSubmit} noValidate>
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
              {/* Alérgico (Sí/No) exclusivo, permite ninguno o uno */}
              {false && (
              <AlergicoContainer>
                <Label>Alérgico</Label>
                <AlergicoOptions>
                  <AlergicoOption $selected={formData.alergico === 'Si'}>
                    <input
                      type="checkbox"
                      name="alergico_si"
                      checked={formData.alergico === 'Si'}
                      onChange={toggleAlergico('Si')}
                    />
                    <span>Sí</span>
                  </AlergicoOption>
                  <AlergicoOption $selected={formData.alergico === 'No'}>
                    <input
                      type="checkbox"
                      name="alergico_no"
                      checked={formData.alergico === 'No'}
                      onChange={toggleAlergico('No')}
                    />
                    <span>No</span>
                  </AlergicoOption>
                </AlergicoOptions>
              </AlergicoContainer>
              )}
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
                  <SubmitButton type="button" onClick={addAntecedente} disabled={!nuevoAntecedente || isLoading}>
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
                  <SubmitButton type="button" onClick={addHabito} disabled={!nuevoHabito || isLoading}>
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
                  <SubmitButton type="button" onClick={addPatologico} disabled={!nuevoPatologico || isLoading}>
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
                  <SubmitButton type="button" onClick={addInspeccion} disabled={!nuevoInspeccion || isLoading}>
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

              {/* Alérgico (Sí/No) exclusivo, permite ninguno o uno - visual primero en Consultas */}
              <AlergicoContainer style={{ marginBottom: '1.5rem',marginLeft:'1rem' }}>
                <Label>Al&eacute;rgico</Label>
                <AlergicoOptions>
                  <AlergicoOption $selected={formData.alergico === 'Si'}>
                    <input
                      type="checkbox"
                      name="alergico_si"
                      checked={formData.alergico === 'Si'}
                      onChange={toggleAlergico('Si')}
                    />
                    <span>S&iacute;</span>
                  </AlergicoOption>
                  <AlergicoOption $selected={formData.alergico === 'No'}>
                    <input
                      type="checkbox"
                      name="alergico_no"
                      checked={formData.alergico === 'No'}
                      onChange={toggleAlergico('No')}
                    />
                    <span>No</span>
                  </AlergicoOption>
                </AlergicoOptions>
              </AlergicoContainer>

              <NestedToolbar style={{ marginBottom: '1.5rem' }}>
                <SubmitButton
                  type="button"
                  onClick={handleNuevaConsulta}
                  disabled={isLoading}
                  style={{ width: 'auto' }}
                >
                  <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                  Crear nueva consulta
                </SubmitButton>
              </NestedToolbar>

              {consultasOrdenadas.map((consulta, idx) => {
                const totalConsultas = consultasOrdenadas.length;
                const displayNumber = Math.max(1, totalConsultas - idx);
                const titulo = `Consulta ${displayNumber}`;
                const uid = consulta.uid || `consulta-${idx}`;
                const fechaId = `fecha_consulta_${uid}`;
                const recordatorioId = `recordatorio_${uid}`;
                const padecimientoId = `padecimiento_${uid}`;
                const diagnosticoId = `diagnostico_${uid}`;
                const tratamientoId = `tratamiento_${uid}`;
                const notasId = `notas_${uid}`;
                const selectId = `select_sistema_${uid}`;
                const sistemasSeleccionados = toArr(consulta.interrogatorio_aparatos);
                const opcionesDisponibles = SISTEMAS_OPCIONES.filter(
                  (opt) => !sistemasSeleccionados.some((s) => normalize(s.nombre) === normalize(opt)),
                );
                const selectValue = nuevoSistemaPorConsulta[uid] || '';

                return (
                  <div key={uid} style={{ marginBottom: '2.5rem' }}>
                    <NestedDetails open={openConsultaUid === uid} onToggle={handleToggleConsulta(uid)}>
                      <InnerSummary>{titulo}</InnerSummary>

                    <ItemActions style={{ justifyContent: 'flex-end' }}>
                      <DangerButton
                        type="button"
                        onClick={() => handleEliminarConsulta(uid)}
                        disabled={isLoading}
                      >
                        <FaTrash />
                        <ButtonLabel>Eliminar consulta</ButtonLabel>
                      </DangerButton>
                    </ItemActions>

                    <TwoColumnRow>
                      <FieldGroup>
                        <Label htmlFor={fechaId}><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta</Label>
                        <Input
                          type="date"
                          id={fechaId}
                          value={consulta.fecha_consulta || ''}
                          onChange={handleConsultaFieldChange(uid, 'fecha_consulta')}
                        />
                      </FieldGroup>
                      <FieldGroup>
                        <Label htmlFor={recordatorioId}><FaBell style={{ marginRight: '0.5rem' }} />Recordatorio</Label>
                        <Input
                          type="date"
                          id={recordatorioId}
                          value={consulta.recordatorio || ''}
                          onChange={handleConsultaFieldChange(uid, 'recordatorio')}
                        />
                      </FieldGroup>
                    </TwoColumnRow>

                    <FieldGroup>
                      <Label htmlFor={padecimientoId}><FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual</Label>
                      <TextArea
                        id={padecimientoId}
                        value={consulta.padecimiento_actual || ''}
                        onChange={handleConsultaFieldChange(uid, 'padecimiento_actual')}
                        rows={6}
                        placeholder="Describe el padecimiento actual"
                      />
                    </FieldGroup>

                    <TwoColumnRow>
                      <FieldGroup>
                        <Label htmlFor={selectId}>Selecciona un sistema</Label>
                        <Select
                          id={selectId}
                          value={selectValue}
                          onChange={handleSistemaSelectChange(uid)}
                        >
                          <option value="">-- Selecciona --</option>
                          {opcionesDisponibles.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </Select>
                      </FieldGroup>
                      <FieldGroup>
                        <Label>&nbsp;</Label>
                        <SubmitButton
                          type="button"
                          onClick={() => handleAgregarSistema(uid)}
                          disabled={!selectValue || isLoading}
                        >
                          <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                          Agregar
                        </SubmitButton>
                      </FieldGroup>
                    </TwoColumnRow>

                    {sistemasSeleccionados.length > 0 && (
                      <ListContainer>
                        {sistemasSeleccionados.map((s, sistemaIdx) => {
                          const config = findSistemaConfig(s.nombre);
                          const estadoValue = toStr(s.estado);
                          const isOldestConsulta = String(uid) === String(oldestConsultaUid ?? '');
                          const showEstadoChecklist = !isOldestConsulta && Boolean(config?.estadoKey);
                          return (
                            <ItemCard key={`${uid}-sistema-${sistemaIdx}`}>
                              <TwoColumnRow>
                                <FieldGroup>
                                  <Label><FaClipboardCheck style={{ marginRight: '0.5rem' }} />Sistema</Label>
                                  <Input value={s.nombre} disabled />
                                  {showEstadoChecklist && (
                                  <FieldGroup>
                                    <Label>Seguimiento</Label>
                                    <EstadoChecklist>
                                      {SISTEMA_ESTADO_OPTIONS.map((option) => {
                                        const optionId = `${uid}-sistema-${sistemaIdx}-${option.value}`;
                                        const checked = estadoValue === option.value;
                                        return (
                                          <EstadoOptionLabel key={option.value} htmlFor={optionId}>
                                            <EstadoCheckbox
                                              id={optionId}
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() => handleToggleSistemaEstado(uid, sistemaIdx, option.value)}
                                            />
                                            <span>{option.label}</span>
                                          </EstadoOptionLabel>
                                        );
                                      })}
                                    </EstadoChecklist>
                                  </FieldGroup>
                                )}
                                </FieldGroup>
                                <FieldGroup>
                                  <Label>{`Descripci\u00f3n de aparato ${s.nombre?.toLowerCase?.() || ''}`}</Label>
                                  <TextArea
                                    value={s.descripcion}
                                    onChange={(e) => handleActualizarSistemaDesc(uid, sistemaIdx, e.target.value)}
                                    rows={3}
                                    placeholder={`Detalle de ${s.nombre?.toLowerCase?.() || ''}`}
                                  />
                                </FieldGroup>
                              </TwoColumnRow>

                              <ItemActions>
                                <DangerButton type="button" onClick={() => handleEliminarSistema(uid, sistemaIdx)}>
                                  <FaTrash />
                                  <ButtonLabel>Eliminar sistema</ButtonLabel>
                                </DangerButton>
                              </ItemActions>
                            </ItemCard>
                          );
                        })}
                      </ListContainer>
                    )}

                    {/* Personalizados por consulta */}
                    <FieldGroup>
                      <Label>&nbsp;</Label>
                      <SubmitButton type="button" onClick={() => handleAgregarPersonalizado(uid)}>
                        Crear personalizado
                      </SubmitButton>
                    </FieldGroup>

                    {toArr(consulta.personalizados).length > 0 && (
                      <ListContainer>
                        {toArr(consulta.personalizados).map((p, pIdx) => (
                          <ItemCard key={`${uid}-pers-${pIdx}`}>
                            <TwoColumnRow>
                              <FieldGroup>
                                <Label>Título</Label>
                                <Input
                                  value={p.nombre}
                                  onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'nombre', e.target.value)}
                                  placeholder="Escribe el título"
                                  maxLength={100}
                                />
                              </FieldGroup>
                              <FieldGroup>
                                <Label>Descripción</Label>
                                <TextArea
                                  value={p.descripcion}
                                  onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'descripcion', e.target.value)}
                                  rows={3}
                                  placeholder="Describe el contenido"
                                />
                              </FieldGroup>
                            </TwoColumnRow>
                            <ItemActions>
                              <DangerButton type="button" onClick={() => handleEliminarPersonalizado(uid, pIdx)}>
                                <FaTrash />
                                <ButtonLabel>Eliminar</ButtonLabel>
                              </DangerButton>
                            </ItemActions>
                          </ItemCard>
                        ))}
                      </ListContainer>
                    )}

                    <FieldGroup>
                      <Label htmlFor={diagnosticoId}><FaDiagnoses style={{ marginRight: '0.5rem' }} />Diagnóstico</Label>
                      <TextArea
                        id={diagnosticoId}
                        value={consulta.diagnostico || ''}
                        onChange={handleConsultaFieldChange(uid, 'diagnostico')}
                        rows={6}
                        placeholder="Escribe el diagnóstico clínico"
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor={tratamientoId}><FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Tratamiento</Label>
                      <TextArea
                        id={tratamientoId}
                        value={consulta.tratamiento || ''}
                        onChange={handleConsultaFieldChange(uid, 'tratamiento')}
                        rows={6}
                        placeholder="Plan de tratamiento"
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor={notasId}><FaStickyNote style={{ marginRight: '0.5rem' }} />Notas</Label>
                      <TextArea
                        id={notasId}
                        value={consulta.notas || ''}
                        onChange={handleConsultaFieldChange(uid, 'notas')}
                        rows={6}
                        placeholder="Notas de la consulta"
                      />
                    </FieldGroup>
                    
                    </NestedDetails>
                  </div>
                );
              })}
            </details>

            {/* Botonera */}
            <ButtonRow>
              <CancelButton
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Deshacer cambios
              </CancelButton>
              <SubmitButton type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </SubmitButton>
            </ButtonRow>
            {/* Botón flotante fijo para guardar */}
            <FloatingSave>
              <SubmitButton
                type="button"
                onClick={() => formElRef.current?.requestSubmit?.()}
                title="Guardar cambios"
                aria-label="Guardar cambios"
                disabled={isSubmitting || isLoading}
              >
                <FaSave />
              </SubmitButton>
            </FloatingSave>
          </Form>
        </FormCard>
      </AddContainer>
    </>
  );
};

export default Modify;


