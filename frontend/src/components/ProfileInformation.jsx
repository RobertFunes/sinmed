// src/components/ProfileInformation.jsx
import PropTypes from 'prop-types';
import {
  FaUser,
  FaBirthdayCake,
  FaPhone,
  FaUserPlus,
  FaGraduationCap,
  FaUsers,
  FaTint,
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
  FaEdit,
  FaTrashAlt,
} from 'react-icons/fa';
import { MdEmail, MdHome, MdWork } from 'react-icons/md';
import { GiLungs } from 'react-icons/gi';
import { ActionButton } from './ContactCard.styles.jsx';
import {
  Section,
  FieldRow,
  Label,
  Value,
  Actions,
  TwoColumnRow,
  Stack,
  Group,
  GroupTitle,
} from './ProfileInformation.styles.jsx';
import {
  HABITOS_OPCIONES,
  SISTEMAS_OPCIONES,
  INSPECCION_OPCIONES,
} from '../helpers/add/catalogos.js';

// Valor presente: distinto de null/undefined y strings no vacíos
const present = (value) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const toStr = (value) => (value == null ? '' : String(value));
const toArr = (value) => (Array.isArray(value) ? value : []);

const formatDate = (value) => {
  const str = toStr(value).trim();
  if (!str) return '';
  const match = str.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : str;
};

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

// Mapeo de campos de sistemas para descripciones y estados (seguimiento)
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

const SISTEMA_ESTADO_OPTIONS = [
  { value: 'mejoro', label: 'Mejoró' },
  { value: 'igual', label: 'Igual' },
  { value: 'empeoro', label: 'Empeoró' },
  { value: 'se_quito', label: 'Se quitó' },
];

const estadoLabel = (value) => {
  const v = toStr(value).trim();
  if (!v) return '';
  const opt = SISTEMA_ESTADO_OPTIONS.find((o) => o.value === v);
  return opt ? opt.label : v;
};

const parseDateValue = (value) => {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const sortConsultasDesc = (entries = []) => {
  const fallbackMap = new Map();
  const orderMap = new Map();
  entries.forEach((item, index) => {
    const fallbackKey = `idx-${index}`;
    fallbackMap.set(item, fallbackKey);
    orderMap.set(item?.uid ?? fallbackKey, index);
  });

  return [...entries].sort((a, b) => {
    const diff = parseDateValue(b?.fecha_consulta) - parseDateValue(a?.fecha_consulta);
    if (diff !== 0) return diff;
    const keyA = a?.uid ?? fallbackMap.get(a);
    const keyB = b?.uid ?? fallbackMap.get(b);
    const idxA = orderMap.get(keyA) ?? 0;
    const idxB = orderMap.get(keyB) ?? 0;
    return idxA - idxB;
  });
};

const mapSistemasFromSource = (source = {}) => {
  const direct = toArr(source?.interrogatorio_aparatos)
    .map((item) => {
      const nombre = toStr(item?.nombre);
      const descripcion = toStr(item?.descripcion);
      const estado = toStr(item?.estado);
      if (!present(nombre) && !present(descripcion) && !present(estado)) return null;
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
      if (!present(descripcion) && !present(estado)) return null;
      return { nombre: label, descripcion: descripcion || '', estado };
    })
    .filter(Boolean);
};

const mapInspectionFromSource = (ef = {}) => {
  const inspectionMappings = [
    { needle: 'Cabeza', value: ef.cabeza },
    { needle: 'Cuello', value: ef.cuello },
    { needle: 'Torax', value: ef.torax },
    { needle: 'Abdomen', value: ef.abdomen },
    { needle: 'Genitales', value: ef.genitales },
    { needle: 'Extremidades', value: ef.extremidades },
  ];

  return inspectionMappings
    .map(({ needle, value }) => {
      const descripcion = toStr(value).trim();
      if (!descripcion) return null;
      const nombre = findMatchingLabel(INSPECCION_OPCIONES, needle, needle);
      return { nombre, descripcion };
    })
    .filter(Boolean);
};

const buildHabitos = (ap = {}) => {
  const habitos = [];

  if (present(ap.bebidas_por_dia) || present(ap.tiempo_activo_alc)) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Alcoholismo', HABITOS_OPCIONES[0] || 'Alcoholismo');
    habitos.push({
      titulo: label,
      rows: [
        { label: 'Bebidas por día', value: ap.bebidas_por_dia, icon: <FaBeer /> },
        { label: 'Tiempo activo', value: ap.tiempo_activo_alc, icon: <FaClock /> },
      ],
    });
  }

  if (present(ap.cigarrillos_por_dia) || present(ap.tiempo_activo_tab)) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Tabaquismo', HABITOS_OPCIONES[1] || 'Tabaquismo');
    habitos.push({
      titulo: label,
      rows: [
        { label: 'Cigarrillos por día', value: ap.cigarrillos_por_dia, icon: <FaSmoking /> },
        { label: 'Tiempo activo', value: ap.tiempo_activo_tab, icon: <FaClock /> },
      ],
    });
  }

  if (present(ap.tipo_toxicomania) || present(ap.tiempo_activo_tox)) {
    const label = findMatchingLabel(HABITOS_OPCIONES, 'Toxicomanias', HABITOS_OPCIONES[2] || 'Toxicomanias');
    habitos.push({
      titulo: label,
      rows: [
        { label: 'Tipo', value: ap.tipo_toxicomania, icon: <FaPills /> },
        { label: 'Tiempo activo', value: ap.tiempo_activo_tox, icon: <FaClock /> },
      ],
    });
  }

  return habitos;
};

const buildConsultas = (data = {}) => {
  const consRows = sortConsultasDesc(toArr(data.consultas));

  const consultas = consRows
    .map((row, idx) => {
      const base = {
        id: row?.uid || row?.id || `consulta-${idx}`,
        fecha_consulta: formatDate(row?.fecha_consulta),
        recordatorio: formatDate(row?.recordatorio),
        padecimiento_actual: toStr(row?.padecimiento_actual),
        diagnostico: toStr(row?.diagnostico),
        tratamiento: toStr(row?.tratamiento),
        notas: toStr(row?.notas),
        interrogatorio: mapSistemasFromSource(row),
      };
      const hasData =
        ['fecha_consulta', 'recordatorio', 'padecimiento_actual', 'diagnostico', 'tratamiento', 'notas']
          .some((key) => present(base[key])) || present(base.interrogatorio);
      return hasData ? base : null;
    })
    .filter(Boolean);

  const legacyRows = toArr(data.padecimiento_actual_interrogatorio);
  const dtRows = toArr(data.diagnostico_tratamiento);
  const pronostico = toStr(dtRows[0]?.pronostico);

  if (consultas.length === 0) {
    const fallbackSource = { ...(legacyRows[0] || {}), ...(dtRows[0] || {}) };
    const fallback = {
      id: 'consulta-legacy',
      fecha_consulta: formatDate(fallbackSource.fecha_consulta),
      recordatorio: formatDate(fallbackSource.recordatorio),
      padecimiento_actual: toStr(fallbackSource.padecimiento_actual),
      diagnostico: toStr(fallbackSource.diagnostico),
      tratamiento: toStr(fallbackSource.tratamiento),
      notas: toStr(fallbackSource.notas),
      interrogatorio: mapSistemasFromSource(fallbackSource),
    };
    const hasData =
      ['fecha_consulta', 'recordatorio', 'padecimiento_actual', 'diagnostico', 'tratamiento', 'notas']
        .some((key) => present(fallback[key])) || present(fallback.interrogatorio);
    if (hasData) consultas.push(fallback);
  }

  return { consultas, pronostico };
};

const Row = ({ icon, label, value }) => {
  if (!present(value)) return null;
  return (
    <FieldRow>
      <Label>
        {icon ? <span className="icon">{icon}</span> : null}
        {label}
      </Label>
      <Value>{value}</Value>
    </FieldRow>
  );
};

Row.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

export default function ProfileInformation({ data, onEditProfile, onDeleteProfile }) {
  if (!data || data.ok !== true) return null;

  const personalOrder = [
    'id_perfil', 'nombre', 'genero', 'fecha_nacimiento', 'telefono_movil', 'correo_electronico',
    'residencia', 'ocupacion', 'escolaridad', 'estado_civil', 'tipo_sangre', 'referido_por',
    'creado', 'actualizado',
  ];

  const getDateStr = (value) => {
    const str = formatDate(value);
    return str || null;
  };

  const computeMaxDates = () => {
    let creadoMax = getDateStr(data.creado) || null;
    let actualizadoMax = getDateStr(data.actualizado) || null;

    if (data.antecedentes_personales && typeof data.antecedentes_personales === 'object') {
      const c = getDateStr(data.antecedentes_personales.creado);
      const a = getDateStr(data.antecedentes_personales.actualizado);
      if (c && (!creadoMax || c > creadoMax)) creadoMax = c;
      if (a && (!actualizadoMax || a > actualizadoMax)) actualizadoMax = a;
    }

    const arrays = [
      data.antecedentes_familiares,
      data.antecedentes_personales_patologicos,
      data.diagnostico_tratamiento,
      data.exploracion_fisica,
      data.padecimiento_actual_interrogatorio,
      data.consultas,
    ];

    for (const arr of arrays) {
      if (!Array.isArray(arr)) continue;
      for (const it of arr) {
        const c = getDateStr(it?.creado);
        const a = getDateStr(it?.actualizado);
        if (c && (!creadoMax || c > creadoMax)) creadoMax = c;
        if (a && (!actualizadoMax || a > actualizadoMax)) actualizadoMax = a;
      }
    }

    const aMaxFromBackend = getDateStr(data.actualizado_max);
    if (aMaxFromBackend && (!actualizadoMax || aMaxFromBackend > actualizadoMax)) {
      actualizadoMax = aMaxFromBackend;
    }
    return { creadoMax, actualizadoMax };
  };

  const { creadoMax, actualizadoMax } = computeMaxDates();
  const personalData = { ...data, creado: creadoMax || data.creado, actualizado: actualizadoMax || data.actualizado };

  const iconFor = (key) => {
    switch (key) {
      case 'id_perfil':
        return <FaClipboardCheck />;
      case 'nombre':
        return <FaUser />;
      case 'genero':
        return null;
      case 'fecha_nacimiento':
        return <FaBirthdayCake />;
      case 'telefono_movil':
        return <FaPhone />;
      case 'correo_electronico':
        return <MdEmail />;
      case 'residencia':
        return <MdHome />;
      case 'ocupacion':
        return <MdWork />;
      case 'escolaridad':
        return <FaGraduationCap />;
      case 'estado_civil':
        return null;
      case 'tipo_sangre':
        return <FaTint />;
      case 'referido_por':
        return <FaUserPlus />;
      case 'creado':
        return <FaCalendarDay />;
      case 'actualizado':
        return <FaCalendarCheck />;
      default:
        return <FaClipboardCheck />;
    }
  };

  const labelFor = (key) => {
    switch (key) {
      case 'id_perfil': return 'ID de perfil:';
      case 'nombre': return 'Nombre:';
      case 'genero': return 'Género:';
      case 'fecha_nacimiento': return 'Fecha de nacimiento:';
      case 'telefono_movil': return 'Teléfono:';
      case 'correo_electronico': return 'Correo:';
      case 'residencia': return 'Residencia:';
      case 'ocupacion': return 'Ocupación:';
      case 'escolaridad': return 'Escolaridad:';
      case 'estado_civil': return 'Estado civil:';
      case 'tipo_sangre': return 'Tipo de sangre:';
      case 'referido_por': return 'Referido por:';
      case 'creado': return 'Creado:';
      case 'actualizado': return 'Actualizado:';
      default: return `${key.replace(/_/g, ' ')}:`;
    }
  };

  const personalRows = personalOrder
    .filter((key) => present(personalData[key]))
    .map((key) => (
      <Row key={key} icon={iconFor(key)} label={labelFor(key)} value={personalData[key]} />
    ));

  const antecedentesFamiliares = toArr(data.antecedentes_familiares)
    .map((item) => ({
      nombre: toStr(item?.nombre),
      descripcion: toStr(item?.descripcion),
    }))
    .filter((item) => present(item.nombre) || present(item.descripcion));

  const antecedentesPersonales = data.antecedentes_personales || {};
  const apGenerales = [
    { label: 'Calidad del sueño:', value: antecedentesPersonales.calidad },
    { label: 'Descripción:', value: antecedentesPersonales.descripcion, icon: <FaUtensils /> },
    { label: '¿Hay cambios?:', value: antecedentesPersonales.hay_cambios },
    { label: 'Tipo de cambio:', value: antecedentesPersonales.cambio_tipo, icon: <FaExchangeAlt /> },
    { label: 'Causa del cambio:', value: antecedentesPersonales.cambio_causa, icon: <FaExclamationCircle /> },
    { label: 'Tiempo del cambio:', value: antecedentesPersonales.cambio_tiempo, icon: <FaClock /> },
  ].filter((row) => present(row.value));
  const apHabitos = buildHabitos(antecedentesPersonales);

  const ginecoSource = Array.isArray(data.gineco_obstetricos)
    ? data.gineco_obstetricos[0] || {}
    : data.gineco_obstetricos || {};

  const ginecoRows = [
    { label: 'Edad de menarca:', value: ginecoSource.edad_primera_menstruacion, icon: <FaFemale /> },
    { label: 'Ciclo / días:', value: ginecoSource.ciclo_dias, icon: <FaCalendarAlt /> },
    { label: 'Cantidad:', value: ginecoSource.cantidad, icon: <FaTint /> },
    { label: 'Dolor:', value: ginecoSource.dolor },
    { label: 'Fecha de última menstruación:', value: formatDate(ginecoSource.fecha_ultima_menstruacion), icon: <FaCalendarCheck /> },
    { label: 'Vida sexual activa:', value: ginecoSource.vida_sexual_activa },
    { label: 'Anticoncepción:', value: ginecoSource.anticoncepcion },
    { label: 'Tipo de anticonceptivo:', value: ginecoSource.tipo_anticonceptivo, icon: <FaPills /> },
    { label: 'Gestas:', value: ginecoSource.gestas, icon: <FaBaby /> },
    { label: 'Partos:', value: ginecoSource.partos, icon: <FaBabyCarriage /> },
    { label: 'Cesáreas:', value: ginecoSource.cesareas, icon: <FaProcedures /> },
    { label: 'Abortos:', value: ginecoSource.abortos, icon: <FaHeartbeat /> },
    { label: 'Fecha del último parto:', value: formatDate(ginecoSource.fecha_ultimo_parto), icon: <FaCalendarDay /> },
    { label: 'Fecha de menopausia:', value: formatDate(ginecoSource.fecha_menopausia), icon: <FaCalendarTimes /> },
  ].filter((row) => present(row.value));

  const patologicos = toArr(data.antecedentes_personales_patologicos)
    .map((item, idx) => ({
      id: item?.id || `app-${idx}`,
      antecedente: toStr(item?.antecedente),
      descripcion: toStr(item?.descripcion),
    }))
    .filter((item) => present(item.antecedente) || present(item.descripcion));

  const { consultas, pronostico } = buildConsultas(data);

  const efSource = Array.isArray(data.exploracion_fisica)
    ? data.exploracion_fisica[0] || {}
    : typeof data.exploracion_fisica === 'object' && data.exploracion_fisica !== null
    ? data.exploracion_fisica
    : {};

  const efRows = [
    { label: 'Peso actual (kg):', value: efSource.peso_actual, icon: <FaWeight /> },
    { label: 'Peso anterior (kg):', value: efSource.peso_anterior, icon: <FaHistory /> },
    { label: 'Peso deseado (kg):', value: efSource.peso_deseado, icon: <FaBullseye /> },
    { label: 'Peso ideal (kg):', value: efSource.peso_ideal, icon: <FaBalanceScale /> },
    { label: 'Talla (cm):', value: efSource.talla_cm, icon: <FaRulerVertical /> },
    { label: 'IMC:', value: efSource.imc, icon: <FaChartBar /> },
    { label: 'RTG:', value: efSource.rtg, icon: <FaHeartbeat /> },
    { label: 'TA (mmHg):', value: efSource.ta_mmhg, icon: <FaHeart /> },
    { label: 'Frecuencia cardiaca:', value: efSource.frecuencia_cardiaca, icon: <FaHeart /> },
    { label: 'Frecuencia respiratoria:', value: efSource.frecuencia_respiratoria, icon: <GiLungs /> },
    { label: 'Temperatura (°C):', value: efSource.temperatura_c, icon: <FaThermometerHalf /> },
    { label: 'Cadera (cm):', value: efSource.cadera_cm, icon: <FaRulerCombined /> },
    { label: 'Cintura (cm):', value: efSource.cintura_cm, icon: <FaRulerHorizontal /> },
  ].filter((row) => present(row.value));

  const inspeccion = mapInspectionFromSource(efSource);
  const totalConsultas = consultas.length;

  return (
    <>
      {personalRows.length > 0 && (
        <Section>
          <h3>Datos Personales</h3>
          <TwoColumnRow>
            {personalRows}
          </TwoColumnRow>
        </Section>
      )}

      {antecedentesFamiliares.length > 0 && (
        <Section>
          <h3>Antecedentes Familiares</h3>
          <Stack>
            {antecedentesFamiliares.map((item, idx) => (
              <Group key={`af-${idx}`}>
                
                <Row icon={<FaUsers />} label="Antecedente:" value={item.nombre} />
                <Row icon={<FaStickyNote />} label="Descripción:" value={item.descripcion} />
              </Group>
            ))}
          </Stack>
        </Section>
      )}

      {(apGenerales.length > 0 || apHabitos.length > 0) && (
        <Section>
          <h3>Antecedentes Personales</h3>
          {apGenerales.length > 0 && (
            <TwoColumnRow>
              {apGenerales.map(({ label, value, icon }, idx) => (
                <Row key={`ap-${idx}`} icon={icon ?? null} label={label} value={value} />
              ))}
            </TwoColumnRow>
          )}
          {apHabitos.length > 0 && (
            <>
              <h4 style={{ color: 'black', textAlign: 'center' }}>Hábitos</h4>
              <Stack>
                {apHabitos.map((habito, idx) => (
                  <Group key={`habito-${idx}`}>
                    <GroupTitle>{habito.titulo}</GroupTitle>
                    {habito.rows.map(({ label, value, icon }, rowIdx) => (
                      <Row
                        key={`habito-${idx}-${rowIdx}`}
                        icon={icon ?? null}
                        label={label}
                        value={value}
                      />
                    ))}
                  </Group>
                ))}
              </Stack>
            </>
          )}
        </Section>
      )}

      {ginecoRows.length > 0 && (
        <Section>
          <h3>Antecedentes Gineco-Obstétricos</h3>
          <TwoColumnRow>
            {ginecoRows.map(({ label, value, icon }, idx) => (
              <Row key={`gineco-${idx}`} icon={icon ?? null} label={label} value={value} />
            ))}
          </TwoColumnRow>
        </Section>
      )}

      {patologicos.length > 0 && (
        <Section>
          <h3>Antecedentes Personales Patológicos</h3>
          <Stack>
            {patologicos.map((item, idx) => (
              <Group key={item.id || `pat-${idx}`}>
                <GroupTitle>Registro {idx + 1}</GroupTitle>
                <Row icon={<FaFileMedical />} label="Antecedente:" value={item.antecedente} />
                <Row icon={<FaStickyNote />} label="Descripción:" value={item.descripcion} />
              </Group>
            ))}
          </Stack>
        </Section>
      )}

      {(efRows.length > 0 || inspeccion.length > 0) && (
        <Section>
          <h3>Exploración Física</h3>
          {efRows.length > 0 && (
            <TwoColumnRow>
              {efRows.map(({ label, value, icon }, idx) => (
                <Row key={`ef-${idx}`} icon={icon ?? null} label={label} value={value} />
              ))}
            </TwoColumnRow>
          )}
          {inspeccion.length > 0 && (
            <>
              <h4 style={{ color: 'black', textAlign: 'center' }}>Inspección general</h4>
              <Stack>
                {inspeccion.map((item, idx) => (
                  <Group key={`ins-${idx}`}>
                    <GroupTitle>{item.nombre}</GroupTitle>
                    <Row icon={<FaStethoscope />} label="Descripción:" value={item.descripcion} />
                  </Group>
                ))}
              </Stack>
            </>
          )}
        </Section>
      )}

      {consultas.length > 0 && (
        <Section>
          <h3>Consultas</h3>
          <Stack>
            {consultas.map((consulta, idx) => (
              <Group key={consulta.id || `consulta-${idx}`}>
                <GroupTitle>
                  Consulta {totalConsultas - idx}{present(consulta.fecha_consulta) ? ` · ${consulta.fecha_consulta}` : ''}
                </GroupTitle>
                <Row icon={<FaCalendarDay />} label="Fecha de consulta:" value={consulta.fecha_consulta} />
                <Row icon={<FaBell />} label="Recordatorio:" value={consulta.recordatorio} />
                <Row icon={<FaNotesMedical />} label="Padecimiento actual:" value={consulta.padecimiento_actual} />
                <Row icon={<FaDiagnoses />} label="Diagnóstico:" value={consulta.diagnostico} />
                <Row icon={<FaPrescriptionBottleAlt />} label="Tratamiento:" value={consulta.tratamiento} />
                <Row icon={<FaStickyNote />} label="Notas:" value={consulta.notas} />
                {consulta.interrogatorio.length > 0 && (
                  <>
                    <h4 style={{ color: 'black',alignSelf:'center'}}>Interrogatorio por aparatos y sistemas</h4>
                    {consulta.interrogatorio.map((item, interrogatorioIdx) => (
                      [
                        (
                          <Row
                            key={`${consulta.id}-interrogatorio-${interrogatorioIdx}-desc`}
                            icon={<FaClipboardCheck />}
                            label={`${item.nombre}:`}
                            value={item.descripcion}
                          />
                        ),
                        present(item.estado)
                          ? (
                            <Row
                              key={`${consulta.id}-interrogatorio-${interrogatorioIdx}-estado`}
                              icon={null}
                              label={"Seguimiento:"}
                              value={estadoLabel(item.estado)}
                            />
                          )
                          : null,
                      ]
                    ))}
                  </>
                )}
              </Group>
            ))}
          </Stack>
          {present(pronostico) && (
            <Stack>
              <Group>
                <GroupTitle>Pronóstico</GroupTitle>
                <Row icon={<FaStickyNote />} label="Pronóstico general:" value={pronostico} />
              </Group>
            </Stack>
          )}
        </Section>
      )}

      <Section>
        <Actions>
          <ActionButton onClick={onEditProfile} title="Editar perfil">
            <FaEdit /> Editar perfil
          </ActionButton>
          <ActionButton className="delete" onClick={onDeleteProfile} title="Eliminar perfil">
            <FaTrashAlt /> Eliminar
          </ActionButton>
        </Actions>
      </Section>
    </>
  );
}

ProfileInformation.propTypes = {
  data: PropTypes.object.isRequired,
  onEditProfile: PropTypes.func,
  onDeleteProfile: PropTypes.func,
};
