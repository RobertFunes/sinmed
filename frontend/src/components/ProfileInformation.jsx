// src/components/ProfileInformation.jsx
import PropTypes from 'prop-types';
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiBriefcase,
  FiMapPin,
  FiHome,
  FiCheckCircle,
  FiTruck,
  FiTarget,
  FiLayers,
  FiSlash,
} from 'react-icons/fi';
import { PiNoteFill } from 'react-icons/pi';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { ActionButton } from './ContactCard.styles.jsx';
import {
  Section,
  FieldRow,
  Label,
  Value,
  TwoRow,
  Actions,
} from './ProfileInformation.styles.jsx';

// Helper: valor presente (no null/undefined ni string vacío)
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

// Filtro: ocultar cualquier id_* salvo id_perfil (pero no lo mostraremos en secciones)
const notSecondaryId = (key) => !(key.startsWith('id_') && key !== 'id_perfil');

export default function ProfileInformation({ data, onEditProfile, onDeleteProfile }) {
  if (!data || data.ok !== true) return null;

  // Sección: Datos Personales (en orden)
  const personalFields = [
    { key: 'nombre', label: 'Nombre:', icon: <FiHome /> },
    { key: 'genero', label: 'Género:', icon: <FiLayers /> },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento:', icon: <FiCalendar /> },
    { key: 'telefono_movil', label: 'Teléfono:', icon: <FiPhone /> },
    { key: 'correo_electronico', label: 'Correo:', icon: <FiMail /> },
    { key: 'residencia', label: 'Residencia:', icon: <FiHome /> },
    { key: 'ocupacion', label: 'Ocupación:', icon: <FiBriefcase /> },
    { key: 'escolaridad', label: 'Escolaridad:', icon: <FiLayers /> },
    { key: 'estado_civil', label: 'Estado civil:', icon: <FiLayers /> },
    { key: 'tipo_sangre', label: 'Tipo de sangre:', icon: <FiLayers /> },
    { key: 'referido_por', label: 'Referido por:', icon: <FiLayers /> },
    { key: 'creado', label: 'Creado:', icon: <FiCalendar /> },
    { key: 'actualizado', label: 'Actualizado:', icon: <FiCalendar /> },
  ];
  const personalRows = personalFields
    .filter(({ key }) => present(data[key]))
    .map(({ key, label, icon }) => (
      <Row key={key} icon={icon} label={label} value={data[key]} />
    ));
  const showPersonal = personalRows.length > 0;

  // 1:1: Antecedentes Personales
  let apBlock = null;
  if (data.antecedentes_personales && typeof data.antecedentes_personales === 'object') {
    const entries = Object.entries(data.antecedentes_personales)
      .filter(([k, v]) => notSecondaryId(k) && present(v));
    if (entries.length > 0) {
      apBlock = (
        <Section>
          <h3>Antecedentes Personales</h3>
          {entries.map(([k, v]) => (
            <FieldRow key={`ap_${k}`}>
              <Label><FiLayers /> {k}:</Label>
              <Value>{v}</Value>
            </FieldRow>
          ))}
        </Section>
      );
    }
  }

  // 1:N genérico con encabezado
  const renderArrayBlock = (arr, prefix, heading) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const rows = [];
    arr.forEach((item, idx) => {
      Object.entries(item || {}).forEach(([k, v]) => {
        if (notSecondaryId(k) && present(v)) {
          rows.push(
            <FieldRow key={`${prefix}_${idx}_${k}`}>
              <Label><FiLayers /> {k}:</Label>
              <Value>{v}</Value>
            </FieldRow>
          );
        }
      });
    });
    if (rows.length === 0) return null;
    return (
      <Section>
        <h3>{heading}</h3>
        {rows}
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
          {personalRows}
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

