// src/components/ContactCard.jsx
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Name,
  InfoSection,
  InfoRow,
  ButtonRow,
  ActionButton,
} from './ContactCard.styles.jsx';
import { MdOutlineNumbers } from 'react-icons/md';
import { FaPhoneAlt, FaRegClock, FaBirthdayCake, FaTrashAlt, FaEye, FaEdit } from 'react-icons/fa';

// Componente adaptado al nuevo payload de /summary
// props esperadas: { id, name, phone, age, created, updated, onDelete }
export default function ContactCard(props) {
  const navigate = useNavigate();

  // Soporta múltiples alias de campos para compatibilidad
  const id = props.id ?? props.id_perfil ?? props.id_cliente;
  const name = props.name ?? props.nombre;
  const phone = props.phone ?? props.telefono_movil ?? props.telefono;
  const age = props.age ?? props.edad;
  const created = props.created ?? props.creado;
  const updated = props.updated ?? props.actualizado;
  const onDelete = props.onDelete;

  const handleView = () => navigate(`/profile/${id}`);
  const handleModify = () => navigate(`/modify/${id}`);

  return (
    <Card>
      <Name>{name}</Name>

      <InfoSection>
        <InfoRow>
          <FaPhoneAlt />
          <span>{phone || '-'}</span>
        </InfoRow>

        <InfoRow>
          <FaBirthdayCake />
          <span>{typeof age === 'number' ? `${age} años` : '-'}</span>
        </InfoRow>

        <InfoRow>
          <FaRegClock />
          <span>Creado: {created || '-'}</span>
        </InfoRow>

        <InfoRow>
          <FaRegClock />
          <span>Última modificación: {updated || '-'}</span>
        </InfoRow>

        <InfoRow>
          <MdOutlineNumbers />
          <span>ID: {id}</span>
        </InfoRow>
      </InfoSection>

      <ButtonRow>
        <ActionButton className="delete" onClick={onDelete}>
          <FaTrashAlt />
        </ActionButton>
        <ActionButton onClick={handleModify}>
          <FaEdit />
        </ActionButton>
        <ActionButton onClick={handleView}>
          <FaEye />
        </ActionButton>
      </ButtonRow>
    </Card>
  );
}
