// modify.jsx (actualizado para edicion de perfiles)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useBeforeUnload, useBlocker, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { AddContainer, FormCard, Title, Form, ButtonRow, SubmitButton, CancelButton } from './Add.styles';
import { SISTEMAS_OPCIONES, INSPECCION_OPCIONES } from '../helpers/add/catalogos';
import { initialState } from '../helpers/add/initialState';
import { usePerfilModify } from '../components/modify/usePerfilModify';
import { useSubmitPerfilModify, buildPayloadWithConsultas } from '../components/modify/useSubmitPerfilModify';
import ConfirmModal from '../components/ConfirmModal';

// iconos
import { FaSave, FaArrowUp, FaUser } from 'react-icons/fa';
import { FloatingSave } from './modify.styles';
import DatosPersonalesSection from '../components/modify/DatosPersonalesSection';
import AntecedentesFamiliaresSectionY from '../components/modify/AntecedentesFamiliaresSectionY';
import AntecedentesPersonalesSection from '../components/modify/AntecedentesPersonalesSection';
import GinecoObstetricosSection from '../components/modify/GinecoObstetricosSection';
import ExploracionFisicaSection from '../components/modify/ExploracionFisicaSection';
import ConsultasSection from '../components/modify/ConsultasSection';
import AntecedentesPatologicosSection from '../components/modify/AntecedentesPatologicosSection';




// (consultas subcomponent moved: nested styles now live inside ConsultasSection)

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

 

const createEmptyConsulta = () => ({
  uid: generateConsultaUid(),
  fecha_consulta: todayISO(),
  recordatorio: '',
  padecimiento_actual: '',
  diagnostico: '',
  medicamentos: '',
  tratamiento: '',
  notas: '',
  notas_evolucion: '',
  interrogatorio_aparatos: [],
  personalizados: [],
});

// buildPayloadWithConsultas fue movido al hook useSubmitPerfilModify

const Modify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { formData, setFormData, isLoading, original } = usePerfilModify(id);
  const { isSubmitting, submit } = useSubmitPerfilModify(id);
  const initialPayloadStringRef = useRef('');
  const allowNavigationRef = useRef(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const shouldBlockNavigation = useCallback(
    () => hasChanges && !allowNavigationRef.current,
    [hasChanges],
  );
  const blocker = useBlocker(shouldBlockNavigation);
  const blockerState = blocker.state;
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
  const generoRef = useRef(null);
  const fechaNacimientoRef = useRef(null);
  const telefonoMovilRef = useRef(null);
  const correoElectronicoRef = useRef(null);
  const referidoPorRef = useRef(null);
  const residenciaRef = useRef(null);
  const ocupacionRef = useRef(null);
  const escolaridadRef = useRef(null);
  const estadoCivilRef = useRef(null);
  const tipoSangreRef = useRef(null);
  const idLegadoRef = useRef(null);
  const fechaLegadoRef = useRef(null);
  const recordatorioRef = useRef(null);
  const recordatorioDescRef = useRef(null);
  const imcAutoCalcRef = useRef(false);
  const updateSnapshot = useCallback((data, payload) => {
    if (!data) return;
    const resolvedPayload = payload ?? buildPayloadWithConsultas(data, id);
    initialPayloadStringRef.current = JSON.stringify(resolvedPayload);
    setHasChanges(false);
    allowNavigationRef.current = false;
  }, [id]);

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
    setNuevoAntecedente('');
    setNuevoHabito('');
    setNuevoPatologico('');
    setNuevoSistemaPorConsulta({});
    setNuevoInspeccion('');
  }, [isLoading]);

  // Si venimos desde el perfil con un campo objetivo, abrir sección y enfocar
  useEffect(() => {
    if (isLoading) return;
    const target = location && location.state && location.state.editTarget;
    if (target && target.section === 'datos') {
      setOpenSection('datos');
      setTimeout(() => {
        const focusRef = (() => {
          switch (target.field) {
            case 'genero':
              return generoRef;
            case 'nombre':
              return nombreRef;
            case 'fecha_nacimiento':
              return fechaNacimientoRef;
            case 'telefono_movil':
              return telefonoMovilRef;
            case 'correo_electronico':
              return correoElectronicoRef;
            case 'referido_por':
              return referidoPorRef;
            case 'residencia':
              return residenciaRef;
            case 'ocupacion':
              return ocupacionRef;
            case 'escolaridad':
              return escolaridadRef;
            case 'estado_civil':
              return estadoCivilRef;
            case 'tipo_sangre':
              return tipoSangreRef;
            case 'id_legado':
              return idLegadoRef;
            case 'fecha_legado':
              return fechaLegadoRef;
            case 'recordatorio':
              return recordatorioRef;
            case 'recordatorio_desc':
              return recordatorioDescRef;
            default:
              return null;
          }
        })();
        if (focusRef && focusRef.current && typeof focusRef.current.focus === 'function') {
          focusRef.current.focus();
        }
      }, 0);
    } else {
      setOpenSection('datos');
    }
  }, [isLoading, location]);

  useEffect(() => {
    if (isLoading) return;
    updateSnapshot(original);
  }, [isLoading, original, updateSnapshot]);

// Eliminado: log de payload en vivo (payload ahora vive en el hook de submit)

  useEffect(() => {
    if (isLoading) return;
    const currentPayloadString = JSON.stringify(buildPayloadWithConsultas(formData, id));
    const different = currentPayloadString !== initialPayloadStringRef.current;
    setHasChanges(prev => (prev !== different ? different : prev));
  }, [formData, id, isLoading]);

  useBeforeUnload(
    useCallback((event) => {
      if (!hasChanges || allowNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    }, [hasChanges]),
  );

  useEffect(() => {
    setShowLeaveModal(blockerState === 'blocked');
  }, [blockerState]);

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

  useEffect(() => {
    if (isLoading) return;
    const taStr = (formData.ta_mmhg || '').trim();
    const match = taStr.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    let pamValue = '';
    if (match) {
      const sist = parseFloat(match[1]);
      const diast = parseFloat(match[2]);
      if (Number.isFinite(sist) && Number.isFinite(diast)) {
        const pam = ((sist - diast) / 3) + diast;
        if (Number.isFinite(pam)) pamValue = pam.toFixed(2);
      }
    }
    setFormData((prev) => (prev.pam === pamValue ? prev : { ...prev, pam: pamValue }));
  }, [formData.ta_mmhg, isLoading]);

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

    const ok = await submit(formData, {
      onSuccess: () => {
        updateSnapshot(formData);
        allowNavigationRef.current = true;
        alert('Perfil actualizado correctamente');
        window.location.reload();
      },
    });
    if (!ok) return;
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
    updateSnapshot(snapshot);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Ref para submit programático (botón flotante)
  const formElRef = useRef(null);
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
    if (tipoNormalized.includes('alcohol')) {
      base.campos = { bebidas_por_dia: '', tiempo_activo_alc: '', tiempo_inactivo_alc: '' };
    }
    if (tipoNormalized.includes('taba')) {
      base.campos = { cigarrillos_por_dia: '', tiempo_activo_tab: '', tiempo_inactivo_tab: '' };
    }
    if (tipoNormalized.includes('toxico')) {
      base.campos = { tipo_toxicomania: '', tiempo_activo_tox: '', tiempo_inactivo_tox: '' };
    }
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

  const syncPrimaryConsulta = (data, consultasList) => {
    const last = consultasList[consultasList.length - 1] || {};
    return {
      ...data,
      fecha_consulta: last.fecha_consulta || '',
      consulta_recordatorio: last.recordatorio || '',
      padecimiento_actual: last.padecimiento_actual || '',
      diagnostico: last.diagnostico || '',
      medicamentos: last.medicamentos || '',
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
      nueva.medicamentos = toStr(last.medicamentos);
      nueva.oreja = toStr(last.oreja);
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
          interrogatorio_aparatos: [
            ...toArr(consulta.interrogatorio_aparatos),
            { nombre: seleccionado, descripcion: '', estado: '' },
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
          personalizados: [
            ...list,
            { nombre: '', descripcion: '', estado: '' },
          ],
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

  const handleTogglePersonalizadoEstado = (uid, idx, value) => {
    updateConsultas((current) =>
      current.map((consulta) => {
        if (consulta.uid !== uid) return consulta;
        const updated = toArr(consulta.personalizados).map((p, i) => {
          if (i !== idx) return p;
          const currentEstado = toStr(p?.estado);
          const nextEstado = currentEstado === value ? '' : value;
          return { ...p, estado: nextEstado };
        });
        return { ...consulta, personalizados: updated };
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
  

  // 👩‍⚕️ Visibilidad Gineco-Obstétricos
  // Muestra la sección solo si el género NO es "Hombre" ("", "Mujer", etc.)
  const showGineco = (formData.genero || '').trim() !== 'Hombre';

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Editar</span> historia clinica{formData.nombre ? ` de ${formData.nombre}` : ''}.
          </Title>

          {isLoading && (
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              Cargando datos del perfil...
            </p>
          )}

          {!isLoading && (
          <Form ref={formElRef} onSubmit={handleSubmit} noValidate>
            {/* 🧍 Datos personales -> payload.datos_personales */}
            <DatosPersonalesSection
              formData={formData}
              onChange={handleChange}
              isOpen={openSection === 'datos'}
              onToggle={handleToggle('datos')}
              nombreRef={nombreRef}
              generoRef={generoRef}
              fechaNacimientoRef={fechaNacimientoRef}
              telefonoMovilRef={telefonoMovilRef}
              correoElectronicoRef={correoElectronicoRef}
              referidoPorRef={referidoPorRef}
              residenciaRef={residenciaRef}
              ocupacionRef={ocupacionRef}
              escolaridadRef={escolaridadRef}
              estadoCivilRef={estadoCivilRef}
              tipoSangreRef={tipoSangreRef}
              idLegadoRef={idLegadoRef}
              fechaLegadoRef={fechaLegadoRef}
              recordatorioRef={recordatorioRef}
              recordatorioDescRef={recordatorioDescRef}
            />

            {/* 👪 Antecedentes familiares -> payload.antecedentes_familiares[] */}
            {/* ?? Antecedentes familiares -> payload.antecedentes_familiares[] */}
            <AntecedentesFamiliaresSectionY
              formData={formData}
              nuevoAntecedente={nuevoAntecedente}
              setNuevoAntecedente={setNuevoAntecedente}
              addAntecedente={addAntecedente}
              removeAntecedenteAt={removeAntecedenteAt}
              updateAntecedenteField={updateAntecedenteField}
              isOpen={openSection === 'familiares'}
              onToggle={handleToggle('familiares')}
              isLoading={isLoading}
            />

            {/* 🧗 Hábitos y alimentación -> payload.antecedentes_personales */}
            <AntecedentesPersonalesSection
              formData={formData}
              nuevoHabito={nuevoHabito}
              setNuevoHabito={setNuevoHabito}
              addHabito={addHabito}
              removeHabitoAt={removeHabitoAt}
              updateHabitoCampo={updateHabitoCampo}
              isOpen={openSection === 'personales'}
              onToggle={handleToggle('personales')}
              isLoading={isLoading}
              handleChange={handleChange}
            />

            {/* 👶 Gineco-Obstétricos -> payload.gineco_obstetricos (solo si no es Hombre) */}
            {showGineco && (
              <GinecoObstetricosSection
                formData={formData}
                onChange={handleChange}
                isOpen={openSection === 'gineco'}
                onToggle={handleToggle('gineco')}
              />
            )}

            {/* 🧬 Patológicos -> payload.antecedentes_personales_patologicos[] */}
            <AntecedentesPatologicosSection
              formData={formData}
              nuevoPatologico={nuevoPatologico}
              setNuevoPatologico={setNuevoPatologico}
              addPatologico={addPatologico}
              removePatologicoAt={removePatologicoAt}
              updatePatologicoDesc={updatePatologicoDesc}
              isOpen={openSection === 'patologicos'}
              onToggle={handleToggle('patologicos')}
              isLoading={isLoading}
            />
            {/* 📅 Consultas (padecimiento + interrogatorio) -> payload.consultas */}
            <ConsultasSection
              isOpen={openSection === 'consultas'}
              onToggle={handleToggle('consultas')}
              alergico={formData.alergico}
              toggleAlergico={toggleAlergico}
              isLoading={isLoading}
              consultasOrdenadas={consultasOrdenadas}
              oldestConsultaUid={oldestConsultaUid}
              SISTEMAS_OPCIONES={SISTEMAS_OPCIONES}
              SISTEMA_ESTADO_OPTIONS={SISTEMA_ESTADO_OPTIONS}
              findSistemaConfig={findSistemaConfig}
              nuevoSistemaPorConsulta={nuevoSistemaPorConsulta}
              openConsultaUid={openConsultaUid}
              handleToggleConsulta={handleToggleConsulta}
              handleNuevaConsulta={handleNuevaConsulta}
              handleEliminarConsulta={handleEliminarConsulta}
              handleConsultaFieldChange={handleConsultaFieldChange}
              handleSistemaSelectChange={handleSistemaSelectChange}
              handleAgregarSistema={handleAgregarSistema}
              handleEliminarSistema={handleEliminarSistema}
              handleActualizarSistemaDesc={handleActualizarSistemaDesc}
              handleToggleSistemaEstado={handleToggleSistemaEstado}
              handleAgregarPersonalizado={handleAgregarPersonalizado}
              handleEliminarPersonalizado={handleEliminarPersonalizado}
              handleActualizarPersonalizado={handleActualizarPersonalizado}
              handleTogglePersonalizadoEstado={handleTogglePersonalizadoEstado}
            />
            {/* 🩺 Exploración física -> payload.exploracion_fisica */}
            <ExploracionFisicaSection
              formData={formData}
              onChange={handleChange}
              isOpen={openSection === 'exploracion'}
              onToggle={handleToggle('exploracion')}
              INSPECCION_OPCIONES={INSPECCION_OPCIONES}
              nuevoInspeccion={nuevoInspeccion}
              setNuevoInspeccion={setNuevoInspeccion}
              addInspeccion={addInspeccion}
              removeInspeccionAt={removeInspeccionAt}
              updateInspeccionDesc={updateInspeccionDesc}
              isLoading={isLoading}
            />

            

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
                onClick={handleScrollToTop}
                title="Ir al inicio"
                aria-label="Ir al inicio de la página"
              >
                <FaArrowUp />
              </SubmitButton>
              <SubmitButton
                type="button"
                onClick={() => navigate(`/profile/${id}`)}
                title="Ver perfil"
                aria-label="Ver perfil"
                disabled={isSubmitting || isLoading}
              >
                <FaUser />
              </SubmitButton>
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
          )}
        </FormCard>
      </AddContainer>
      <ConfirmModal
        open={showLeaveModal}
        title="Cambios sin guardar"
        text="Tienes cambios sin guardar. Si sales perderás la información ingresada."
        confirmLabel="Salir sin guardar"
        onCancel={() => {
          allowNavigationRef.current = false;
          blocker.reset();
          setShowLeaveModal(false);
        }}
        onConfirm={() => {
          allowNavigationRef.current = true;
          setShowLeaveModal(false);
          blocker.proceed();
        }}
      />
    </>
  );
};

export default Modify;


