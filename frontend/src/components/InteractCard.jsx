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
  FaTrashAlt,
  
} from 'react-icons/fa';
import { url } from '../helpers/url.js';
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
  return diffDays === 0 ? 'Hoy' : `Último contacto hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
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

/* ---------- Componente simplificado ---------- */
export default function IneractCard({
  id,
  name,
  lastContact,
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
  const handlePostpone = async () => {
    try {
      const res = await fetch(`${url}/api/postpone`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      onPostpone?.(id);
      if (!res.ok) throw new Error('Error al posponer');
      alert('✅ Contacto pospuesto 45 días');
    } catch (err) {
      console.error('Error al posponer:', err);
      alert('❌ No se pudo posponer');
    }
  };
  const askPostpone = () => setConfirmPostpone(true);
  const cancelPostpone = () => setConfirmPostpone(false);
  const confirmPostponeAction = () => {
    setConfirmPostpone(false);
    handlePostpone();
  };
  return (
    <>
      <Card $birthday={isBirthdayToday}>
        <Name>{name}</Name>
        <InfoSection>
          <InfoRow>
            <FaRegClock />
            <span>{daysSince(lastContact)}</span>
          </InfoRow>

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
              <FaTrashAlt /> Posponer
            </ActionButton>
          )}
          <ActionButton onClick={handleView}>
            <BsChatSquareText /> Interactuar
          </ActionButton>
        </ButtonRow>
      </Card>
      <ConfirmModal
        open={confirmPostpone}
        text="¿Posponer este contacto 45 días?"
        confirmLabel="Posponer"
        onCancel={cancelPostpone}
        onConfirm={confirmPostponeAction}
      />
    </> 
  );
}