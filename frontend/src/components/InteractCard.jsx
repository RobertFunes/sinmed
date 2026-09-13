// src/components/InteractCard.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import {
  Card,
  Name,
  InfoSection,
  InfoRow,
  ButtonRow,
  ActionButton
} from './InteractCard.styles.jsx';
import { BsChatSquareText } from "react-icons/bs";
import {
  FaRegClock,
  FaBirthdayCake,
  FaRegCalendarAlt,
  FaTrashAlt,

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
  if (!dateStr) return '-';
  const then = new Date(dateStr);
  const diffMs = Date.now() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 'Hoy' : `Última modificación hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
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

const formatReminder = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reminderDate = new Date(date);
  reminderDate.setHours(0, 0, 0, 0);

  const diffMs = reminderDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formatted = reminderDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (diffDays === 0) return `Recordatorio para hoy · ${formatted}`;
  if (diffDays === 1) return `Recordatorio mañana · ${formatted}`;
  if (diffDays > 1) return `Recordatorio en ${diffDays} días · ${formatted}`;
  return `Recordatorio vencido · ${formatted}`;
};

/* ---------- Componente simplificado ---------- */
export default function IneractCard({
  id,
  consultaId,
  name,
  lastContact,
  reminderDate,
  birthDate,
  showPostpone = true,
  isBirthdayToday = false,
  onPostpone
}) {
  const [confirmPostpone, setConfirmPostpone] = useState(false);
  const navigate = useNavigate();
  const handleView = () => {
    navigate(`/profile/${id}`);
  };
  const effectiveConsultaId = consultaId ?? id;
  const askPostpone = () => setConfirmPostpone(true);
  const cancelPostpone = () => setConfirmPostpone(false);
  const confirmPostponeAction = () => {
    setConfirmPostpone(false);
    // Para Pending (eliminar recordatorio) delegamos al padre
    onPostpone?.(effectiveConsultaId);
  };
  const reminderLabel = formatReminder(reminderDate);
  const effectiveLastContact = lastContact;
  return (
    <>
      <Card $birthday={isBirthdayToday}>
        <Name>{name}</Name>
        <InfoSection>
          <InfoRow>
            <FaRegClock />
            <span>{daysSince(effectiveLastContact)}</span>
          </InfoRow>

          {reminderLabel && (
            <InfoRow>
              <FaRegCalendarAlt />
              <span>{reminderLabel}</span>
            </InfoRow>
          )}

          {isValidBirthDate(birthDate) && (
            <InfoRow $birthday={isBirthdayToday}>
              <FaBirthdayCake />
              <span>{daysToBirthday(birthDate)}</span>
            </InfoRow>
          )}
        </InfoSection>
        <ButtonRow>
          {showPostpone && (
            <ActionButton className="delete" onClick={askPostpone}>
              <FaTrashAlt /> Eliminar recordatorio
            </ActionButton>
          )}
          <ActionButton onClick={handleView}>
            <BsChatSquareText /> Ver perfil
          </ActionButton>
        </ButtonRow>
      </Card>
      <ConfirmModal
        open={confirmPostpone}
        text="¿Eliminar este recordatorio?"
        confirmLabel="Eliminar"
        onCancel={cancelPostpone}
        onConfirm={confirmPostponeAction}
      />
    </> 
  );
}
