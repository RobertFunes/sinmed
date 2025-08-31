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

export default function ProfileInformation({ data, onEditProfile, onDeleteProfile }) {
  return (
    <Section>
      {/* IDENTIFICACIÓN BÁSICA */}
      <FieldRow><Label><FiHome /> Nombre:</Label><Value>{data.nombre}</Value></FieldRow>
      <TwoRow>
        <FieldRow><Label><FiLayers /> Género:</Label><Value>{data.genero || '-'}</Value></FieldRow>
        <FieldRow><Label><FiCalendar /> Fecha de nacimiento:</Label><Value>{data.fecha_nacimiento || '-'}</Value></FieldRow>
        <FieldRow><Label><FiPhone /> Teléfono:</Label><Value>{data.telefono_movil || '-'}</Value></FieldRow>
        <FieldRow><Label><FiMail /> Correo:</Label><Value>{data.correo_electronico || '-'}</Value></FieldRow>
      </TwoRow>

      {/* CONTACTO */}
      <FieldRow><Label><FiCalendar /> Último contacto:</Label><Value>{data.ultima_fecha_contacto || '-'}</Value></FieldRow>

      {/* DIRECCIÓN DETALLADA */}
      <FieldRow><Label><FiHome style={{opacity:0.7}} /> Calle:</Label><Value>{data.calle || '-'}</Value></FieldRow>
      <TwoRow>
        <FieldRow><Label><FiSlash style={{opacity:0.7}} /> Núm. int/ext:</Label><Value>{data.numero_int_ext || '-'}</Value></FieldRow>
        <FieldRow><Label><FiMapPin style={{opacity:0.7}} /> Colonia:</Label><Value>{data.colonia || '-'}</Value></FieldRow>
      </TwoRow>
      <TwoRow>
        <FieldRow><Label><FiMapPin style={{opacity:0.7}} /> Ciudad/Municipio:</Label><Value>{data.ciudad_municipio || '-'}</Value></FieldRow>
        <FieldRow><Label><FiMapPin style={{opacity:0.7}} /> C.P.:</Label><Value>{data.codigo_postal || '-'}</Value></FieldRow>
      </TwoRow>

      {/* OCUPACIÓN */}
      <FieldRow><Label><FiBriefcase /> Ocupación:</Label><Value>{data.ocupacion || '-'}</Value></FieldRow>

      {/* Campo de aseguradora eliminado del perfil; ahora pertenece a pólizas */}

      {/* SEGUROS Y POTENCIALES */}
      <FieldRow><Label><FiCheckCircle /> Seguros probables:</Label><Value>{data.potenciales_seguros || '-'}</Value></FieldRow>

      {/* EXTRAS */}
      <FieldRow><Label><FiTruck /> Datos de vehículo:</Label><Value>{data.autos || '-'}</Value></FieldRow>
      <FieldRow><Label><FiTarget /> Aspiraciones / Sueños:</Label><Value>{data.aspiraciones_suenos || '-'}</Value></FieldRow>
      <FieldRow><Label><PiNoteFill /> Notas:</Label><Value>{data.notas || '-'}</Value></FieldRow>
      <Actions>
        <ActionButton onClick={onEditProfile} title="Editar perfil">
          <FaEdit /> Editar perfil
        </ActionButton>
        <ActionButton className="delete" onClick={onDeleteProfile} title="Eliminar perfil">
          <FaTrashAlt /> Eliminar
        </ActionButton>
      </Actions>
    </Section>
  );
}

ProfileInformation.propTypes = {
  data: PropTypes.object.isRequired,
  onEditProfile: PropTypes.func,
  onDeleteProfile: PropTypes.func,
};

