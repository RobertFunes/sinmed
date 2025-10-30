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

  const formatDate = (value) => {
    const str = String(value ?? '').trim();
    if (!str) return '';
    const m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [, y, mo, d] = m;
      return `${d}-${mo}-${y}`;
    }
    const t = Date.parse(str);
    if (!Number.isNaN(t)) {
      const dt = new Date(t);
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yyyy = String(dt.getFullYear());
      return `${dd}-${mm}-${yyyy}`;
    }
    return str;
  };

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
          <span>Creado: {formatDate(created) || '-'}</span>
        </InfoRow>

        <InfoRow>
          <FaRegClock />
          <span>Modificado: {formatDate(updated) || '-'}</span>
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
