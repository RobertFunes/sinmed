// src/components/ProfileReminderCard.jsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal.jsx';
import {
  Card,
  Name,
  InfoSection,
  InfoRow,
  ButtonRow,
  ActionButton,
} from './InteractCard.styles.jsx';
import { BsChatSquareText } from 'react-icons/bs';
import { FaRegCalendarAlt, FaStickyNote, FaTrashAlt } from 'react-icons/fa';
import { url } from '../helpers/url.js';
import { apiFetch } from '../helpers/apiFetch';

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
    day: 'numeric',
  });

  if (diffDays === 0) return `Recordatorio para hoy · ${formatted}`;
  if (diffDays === 1) return `Recordatorio mañana · ${formatted}`;
  if (diffDays > 1) return `Recordatorio en ${diffDays} días · ${formatted}`;
  return `Recordatorio vencido · ${formatted}`;
};

export default function ProfileReminderCard({
  id,
  name,
  reminderDate,
  reminderDesc,
  onClear,
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/profile/${id}`);
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${url}/api/profile/postpone`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_perfil: id }),
      });
      if (!res.ok) {
        throw new Error('No se pudo eliminar el recordatorio');
      }
      onClear?.(id);
      alert('✅ Recordatorio de perfil eliminado');
    } catch (err) {
      console.error('Error al eliminar recordatorio de perfil:', err);
      alert('❌ No se pudo eliminar el recordatorio');
    } finally {
      setLoading(false);
      setConfirmClear(false);
    }
  };

  const reminderLabel = formatReminder(reminderDate);

  return (
    <>
      <Card>
        <Name>{name}</Name>
        <InfoSection>
          {reminderLabel && (
            <InfoRow>
              <FaRegCalendarAlt />
              <span>{reminderLabel}</span>
            </InfoRow>
          )}
          {reminderDesc && (
            <InfoRow>
              <FaStickyNote />
              <span>{reminderDesc}</span>
            </InfoRow>
          )}
        </InfoSection>
        <ButtonRow>
          <ActionButton
            className="delete"
            onClick={() => setConfirmClear(true)}
            disabled={loading}
          >
            <FaTrashAlt /> Eliminar recordatorio
          </ActionButton>
          <ActionButton onClick={handleView}>
            <BsChatSquareText /> Ver perfil
          </ActionButton>
        </ButtonRow>
      </Card>
      <ConfirmModal
        open={confirmClear}
        text="¿Eliminar este recordatorio de perfil?"
        confirmLabel="Eliminar"
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClear}
      />
    </>
  );
}

