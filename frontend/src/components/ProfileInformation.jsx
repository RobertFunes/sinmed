// src/components/ProfileInformation.jsx
import PropTypes from 'prop-types';
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiBriefcase,
  FiHome,
  FiLayers,
} from 'react-icons/fi';
import { PiNoteFill } from 'react-icons/pi';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { ActionButton } from './ContactCard.styles.jsx';
import {
  Section,
  FieldRow,
  Label,
  Value,
  Actions,
  TwoColumnRow,
} from './ProfileInformation.styles.jsx';

// Valor presente: distinto de null/undefined y strings no vacíos
const present = (v) => {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
};

const Row = ({ icon, label, value }) => {
  if (!present(value)) return null;
  return (
    <FieldRow>
      <Label>{icon} {label}</Label>
      <Value>{value}</Value>
    </FieldRow>
  );
};

// Oculta cualquier id_* excepto id_perfil (que solo se muestra en Datos Personales)
const notSecondaryId = (key) => !(key.startsWith('id_') && key !== 'id_perfil');

// Etiquetas legibles y fallback
const LABELS = {
  // Perfil
  id_perfil: 'ID de perfil',
  nombre: 'Nombre',
  genero: 'Género',
  fecha_nacimiento: 'Fecha de nacimiento',
  telefono_movil: 'Teléfono',
  correo_electronico: 'Correo',
  residencia: 'Residencia',
  ocupacion: 'Ocupación',
  escolaridad: 'Escolaridad',
  estado_civil: 'Estado civil',
  tipo_sangre: 'Tipo de sangre',
  referido_por: 'Referido por',
  creado: 'Creado',
  actualizado: 'Actualizado',

  // Antecedentes personales (1:1)
  bebidas_por_dia: 'Bebidas por día',
  tiempo_activo_alc: 'Tiempo activo alcohol',
  cigarrillos_por_dia: 'Cigarrillos por día',
  tiempo_activo_tab: 'Tiempo activo tabaco',
  tipo_toxicomania: 'Tipo de toxicomanía',
  tiempo_activo_tox: 'Tiempo activo toxicomanía',
  calidad: 'Calidad del sueño',
  descripcion: 'Descripción',
  hay_cambios: '¿Hay cambios?',
  cambio_tipo: 'Tipo de cambio',
  cambio_causa: 'Causa del cambio',
  cambio_tiempo: 'Tiempo del cambio',

  // Familiares / Patológicos
  antecedente: 'Antecedente',
  nombre_familiar: 'Nombre',

  // Padecimiento/interrogatorio
  padecimiento_actual: 'Padecimiento actual',
  sintomas_generales: 'Síntomas generales',
  endocrino: 'Endocrino',
  organos_sentidos: 'Órganos de los sentidos',
  gastrointestinal: 'Gastrointestinal',
  cardiopulmonar: 'Cardiopulmonar',
  genitourinario: 'Genitourinario',
  genital_femenino: 'Genital femenino',
  sexualidad: 'Sexualidad',
  dermatologico: 'Dermatológico',
  neurologico: 'Neurológico',
  hematologico: 'Hematológico',
  reumatologico: 'Reumatológico',
  psiquiatrico: 'Psiquiátrico',
  medicamentos: 'Medicamentos',

  // Exploración física
  peso_actual: 'Peso actual (kg)',
  peso_anterior: 'Peso anterior (kg)',
  peso_deseado: 'Peso deseado (kg)',
  peso_ideal: 'Peso ideal (kg)',
  talla_cm: 'Talla (cm)',
  imc: 'IMC',
  rtg: 'RTG',
  ta_mmhg: 'TA (mmHg)',
  pulso: 'Pulso',
  frecuencia_cardiaca: 'Frecuencia cardiaca',
  frecuencia_respiratoria: 'Frecuencia respiratoria',
  temperatura_c: 'Temperatura (°C)',
  cadera_cm: 'Cadera (cm)',
  cintura_cm: 'Cintura (cm)',
  cabeza: 'Cabeza',
  cuello: 'Cuello',
  torax: 'Tórax',
  abdomen: 'Abdomen',
  genitales: 'Genitales',
  extremidades: 'Extremidades',
};
const prettify = (key) => key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
const labelFor = (key) => LABELS[key] || prettify(key);

export default function ProfileInformation({ data, onEditProfile, onDeleteProfile }) {
  if (!data || data.ok !== true) return null;

  // Datos Personales (id_perfil + campos raíz en orden)
  const personalOrder = [
    'id_perfil', 'nombre', 'genero', 'fecha_nacimiento', 'telefono_movil', 'correo_electronico',
    'residencia', 'ocupacion', 'escolaridad', 'estado_civil', 'tipo_sangre', 'referido_por',
    'creado', 'actualizado'
  ];
  // Helpers para fechas: usamos el valor máximo entre todas las secciones
  const getDateStr = (v) => {
    if (!v) return null;
    if (typeof v === 'string') {
      const s = v.slice(0, 10);
      return /\d{4}-\d{2}-\d{2}/.test(s) ? s : null;
    }
    return null;
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
  const iconFor = (k) => {
    switch (k) {
      case 'id_perfil': return <FiLayers />;
      case 'nombre': return <FiHome />;
      case 'genero':
      case 'escolaridad':
      case 'estado_civil':
      case 'tipo_sangre':
      case 'referido_por': return <FiLayers />;
      case 'fecha_nacimiento':
      case 'creado':
      case 'actualizado': return <FiCalendar />;
      case 'telefono_movil': return <FiPhone />;
      case 'correo_electronico': return <FiMail />;
      case 'residencia': return <FiHome />;
      case 'ocupacion': return <FiBriefcase />;
      default: return <FiLayers />;
    }
  };
  const personalRows = personalOrder
    .filter((k) => present(personalData[k]))
    .map((k) => (
      <Row key={k} icon={iconFor(k)} label={`${labelFor(k)}:`} value={personalData[k]} />
    ));
  const showPersonal = personalRows.length > 0;

  // 1:1: Antecedentes Personales
  let apBlock = null;
  if (data.antecedentes_personales && typeof data.antecedentes_personales === 'object') {
    const entries = Object.entries(data.antecedentes_personales)
      .filter(([k, v]) => !k.startsWith('id_') && k !== 'creado' && k !== 'actualizado' && present(v));
    if (entries.length > 0) {
      apBlock = (
        <Section>
          <h3>Antecedentes Personales</h3>
          <TwoColumnRow>
            {entries.map(([k, v]) => (
              <FieldRow key={`ap_${k}`}>
                <Label><FiLayers /> {labelFor(k)}:</Label>
                <Value>{v}</Value>
              </FieldRow>
            ))}
          </TwoColumnRow>
        </Section>
      );
    }
  }

  // 1:N helper con agrupación por "Registro N"
  const renderArrayBlock = (arr, prefix, heading) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const groups = arr.map((item, idx) => {
      const rows = Object.entries(item || {})
        .filter(([k, v]) => !k.startsWith('id_') && k !== 'creado' && k !== 'actualizado' && present(v))
        .map(([k, v]) => (
          <FieldRow key={`${prefix}_${idx}_${k}`}>
            <Label><FiLayers /> {labelFor(k)}:</Label>
            <Value>{v}</Value>
          </FieldRow>
        ));
      if (rows.length === 0) return null;
      return (
        <div key={`${prefix}_${idx}`}>
          <TwoColumnRow>
            {rows}
          </TwoColumnRow>
        </div>
      );
    }).filter(Boolean);
    if (groups.length === 0) return null;
    return (
      <Section>
        <h3>{heading}</h3>
        {groups}
      </Section>
    );
  };

  const afBlock  = renderArrayBlock(data.antecedentes_familiares, 'af', 'Antecedentes Familiares');
  const appBlock = renderArrayBlock(data.antecedentes_personales_patologicos, 'app', 'Antecedentes Personales Patológicos');
  const paiBlock = renderArrayBlock(data.padecimiento_actual_interrogatorio, 'pai', 'Padecimiento Actual Interrogatorio');
  const efBlock  = renderArrayBlock(data.exploracion_fisica, 'ef', 'Exploración Física');
  const dtBlock  = renderArrayBlock(data.diagnostico_tratamiento, 'dt', 'Diagnóstico y Tratamiento');

  return (
    <>
      {showPersonal && (
        <Section>
          <h3>Datos Personales</h3>
          <TwoColumnRow>
            {personalRows}
          </TwoColumnRow>
        </Section>
      )}

      {afBlock}
      {apBlock}
      {appBlock}
      {paiBlock}
      {efBlock}
      {dtBlock}

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
