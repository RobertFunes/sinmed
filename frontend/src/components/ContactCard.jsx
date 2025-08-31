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
import { MdOutlineNumbers } from "react-icons/md";
import {
  FaPhoneAlt,
  FaRegClock,
  FaBirthdayCake,
  FaTrashAlt,
  FaEye,
  FaEdit
} from 'react-icons/fa';

/* ---------- Helpers ---------- */
const isValidBirthDate = (dateStr) => {
  if (!dateStr) return false;
  const str = String(dateStr);
  if (str.startsWith('0000')) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() < 1920) return false;
  return true;
};

const daysSince = (dateStr) => {
  if (!dateStr) return '—';
  const then = new Date(dateStr);
  const diffMs = Date.now() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 'Hoy' : `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

const daysToBirthday = (birthDateStr) => {
  if (!isValidBirthDate(birthDateStr)) return null;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  const month = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();

  let nextBirthday = new Date(today.getFullYear(), month, day);
  if (
    today.getMonth() > month ||
    (today.getMonth() === month && today.getDate() > day)
  ) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffMs = nextBirthday - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays === 0
    ? '¡Hoy es su cumple! 🎉'
    : `Faltan ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

const getAge = (birthDateStr) => {
  if (!isValidBirthDate(birthDateStr)) return null;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/* ---------- Componente ---------- */
export default function ContactCard({
    id,
    name,
    phone,
    lastContact,
    birthDate,
    onDelete,
  }) {
  
  const navigate = useNavigate();
  const handleView = () => {
    navigate(`/profile/${id}`);
  };
  const handleModify = () => {
    navigate(`/modify/${id}`);   // 🚀 Ruta de modificación
  };

  return (
    <Card>
      <Name>{name}</Name>

      <InfoSection>
        <InfoRow>
          <FaPhoneAlt />
          <span>{phone}</span>
        </InfoRow>
        
        <InfoRow>
          <FaRegClock />
          <span>{daysSince(lastContact)}</span>
        </InfoRow>

        {isValidBirthDate(birthDate) && (
          <InfoRow>
            <FaBirthdayCake />
            <span>
              {getAge(birthDate)} años ({daysToBirthday(birthDate)})
            </span>
          </InfoRow>
        )}
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
