import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';
import { apiFetch } from '../helpers/apiFetch';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1200;
`;

const Container = styled.div`
  background: #ffffff;
  color: ${Palette.text};
  width: min(520px, 94vw);
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  padding: 24px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: ${Palette.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${Palette.muted};
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: ${Palette.secondary};
  }
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryBox = styled.div`
  background: ${Palette.background};
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const SummaryTitle = styled.div`
  font-weight: 600;
  margin-bottom: 6px;
  color: ${Palette.secondary};
`;

const SummaryText = styled.div`
  font-size: 0.95rem;
  color: ${Palette.dark};
`;

const EventsList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  max-height: 120px;
  overflow-y: auto;
`;

const EventItem = styled.li`
  font-size: 0.9rem;
  margin-bottom: 2px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${Palette.secondary};
`;

const DateInput = styled.input`
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  border: 1px solid ${Palette.darkGray};
  font-size: 0.95rem;
  color: ${Palette.text};
  background: #ffffff;
  &:focus {
    outline: 3px solid ${Palette.primary};
    border-color: transparent;
  }
`;

const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 4px;
`;

const Button = styled.button`
  appearance: none;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 8px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: ${Palette.accent};
    color: #0b2a1d;
    border-color: rgba(11, 42, 29, 0.12);
    box-shadow: 0 6px 16px rgba(51, 160, 105, 0.25);
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(51, 160, 105, 0.33);
    }
  `
      : `
    background: transparent;
    color: ${Palette.secondary};
    border-color: rgba(38, 102, 127, 0.4);
    &:hover {
      transform: translateY(-1px);
      background: rgba(38, 102, 127, 0.08);
    }
  `}
`;

const formatShort = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toYMD = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toNaive = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

export default function CloneDayModal({ visible, onClose, events, sourceDate }) {
  if (!visible) return null;

  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const count = Array.isArray(events) ? events.length : 0;
  const safeEvents = Array.isArray(events) ? events : [];

  const handleClone = async () => {
    if (!targetDate) {
      alert('Selecciona una fecha destino para clonar.');
      return;
    }
    const sourceYmd = toYMD(sourceDate);
    if (!sourceYmd) {
      alert('No se pudo determinar el día de origen.');
      return;
    }

    const payload = {
      source_date: sourceYmd,
      target_date: targetDate,
      events: safeEvents.map((ev, idx) => {
        const raw = ev.raw || {};
        const id_cita = raw.id_cita ?? ev.id ?? idx;
        const nombre = ev.nombre ?? ev.title ?? raw.nombre ?? 'Sin título';
        const telefono = ev.telefono ?? raw.telefono ?? null;
        const color = ev.color ?? raw.color ?? null;
        const inicio_utc = raw.inicio_utc ?? toNaive(ev.start);
        const fin_utc = raw.fin_utc ?? toNaive(ev.end);
        return {
          id_cita,
          nombre,
          telefono,
          color,
          inicio_utc,
          fin_utc,
        };
      }),
    };

    try {
      setIsSubmitting(true);
      const res = await apiFetch(`${url}/api/cloneday`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = 'No se pudo clonar el día.';
        try {
          const errJson = await res.json();
          if (errJson?.error) message = errJson.error;
        } catch {
          // ignore parse error
        }
        alert(`❌ ${message}`);
        return;
      }
      alert('✅ Día clonado correctamente.');
      onClose?.();
      window.location.reload();
    } catch (err) {
      console.error('[CloneDayModal] Error al clonar día:', err);
      alert('❌ Error de red al intentar clonar el día.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Backdrop $visible={visible} onClick={handleBackdropClick}>
      <Container role="dialog" aria-modal="true">
        <Header>
          <Title>Clonar este día</Title>
          <CloseButton type="button" aria-label="Cerrar" onClick={onClose}>
            ×
          </CloseButton>
        </Header>

        <Content>
          <SummaryBox>
            <SummaryTitle>Resumen de citas a clonar</SummaryTitle>
            <SummaryText>
              Se clonarán <strong>{count}</strong> cita{count === 1 ? '' : 's'} del día seleccionado.
            </SummaryText>
            {count > 0 && (
              <EventsList>
                {safeEvents.slice(0, 5).map((ev, idx) => (
                  <EventItem key={ev.id || idx}>
                    {formatShort(ev.start)} · {ev.title || ev.nombre || 'Sin título'}
                  </EventItem>
                ))}
                {count > 5 && <EventItem>… y {count - 5} cita(s) más</EventItem>}
              </EventsList>
            )}
          </SummaryBox>

          <Field>
            <Label htmlFor="clone-date">Clonar en fecha</Label>
            <DateInput
              id="clone-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </Field>
        </Content>

        <Footer>
          <Button type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" $variant="primary" onClick={handleClone} disabled={isSubmitting}>
            {isSubmitting ? 'Clonando…' : 'Clonar'}
          </Button>
        </Footer>
      </Container>
    </Backdrop>
  );
}

CloneDayModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  events: PropTypes.arrayOf(PropTypes.object),
  sourceDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
};

CloneDayModal.defaultProps = {
  visible: false,
  onClose: undefined,
  events: [],
  sourceDate: undefined,
};
