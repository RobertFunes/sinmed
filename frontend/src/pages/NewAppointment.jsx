// src/pages/NewAppointment.jsx
import Header from '../components/Header.jsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../helpers/url.js';
import { apiFetch } from '../helpers/apiFetch';
import { Page, Title, Form, Field, Input, Actions, PrimaryButton, GhostButton } from './NewAppointment.styles.jsx';

export default function NewAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [endDayOffset, setEndDayOffset] = useState(0);
  const [endEdited, setEndEdited] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const COLOR_OPTIONS = [
    { name: 'Blue', hex: '#1976D2' },
    { name: 'Green', hex: '#2E7D32' },
    { name: 'Red', hex: '#D32F2F' },
    { name: 'Orange', hex: '#F57C00' },
    { name: 'Purple', hex: '#6A1B9A' },
  ];
  const [color, setColor] = useState(COLOR_OPTIONS[0].name);

  const onTimeChange = (val) => {
    setTime(val);
    if (!val) {
      setEndTime('');
      setEndDayOffset(0);
      return;
    }
    const [hh, mm] = val.split(':').map(Number);
    if (Number.isInteger(hh) && Number.isInteger(mm)) {
      const startTotal = hh * 60 + mm;
      if (!endEdited) {
        const sum = startTotal + 45;
        const carry = sum >= 1440 ? 1 : 0;
        const total = sum % (24 * 60);
        const endH = String(Math.floor(total / 60)).padStart(2, '0');
        const endM = String(total % 60).padStart(2, '0');
        setEndTime(`${endH}:${endM}`);
        setEndDayOffset(carry);
      } else {
        // Mantener hora fin manual, pero ajustar offset si cruza medianoche
        const [eh, em] = String(endTime || '').split(':').map(Number);
        if (Number.isInteger(eh) && Number.isInteger(em)) {
          const endTotal = eh * 60 + em;
          setEndDayOffset(endTotal < startTotal ? 1 : 0);
        } else {
          setEndDayOffset(0);
        }
      }
    } else {
      setEndTime('');
      setEndDayOffset(0);
    }
  };

  const onEndTimeChange = (val) => {
    setEndEdited(true);
    setEndTime(val);
    if (!val || !time) {
      setEndDayOffset(0);
      return;
    }
    const [sh, sm] = String(time).split(':').map(Number);
    const [eh, em] = String(val).split(':').map(Number);
    if ([sh, sm, eh, em].every((n) => Number.isInteger(n))) {
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;
      setEndDayOffset(endTotal < startTotal ? 1 : 0);
    } else {
      setEndDayOffset(0);
    }
  };

  const buildNaiveDateTime = (dStr, tStr, dayOffset = 0) => {
    if (!dStr || !tStr) return null;
    const [yearStr, monthStr, dayStr] = dStr.split('-');
    const [hourStr, minuteStr] = tStr.split(':');
    if (!yearStr || !monthStr || !dayStr || !hourStr || !minuteStr) return null;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    if ([year, month, day, hour, minute].some((n) => Number.isNaN(n))) return null;
    const base = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(base.getTime())) return null;
    if (dayOffset) base.setDate(base.getDate() + dayOffset);
    const pad = (v) => String(v).padStart(2, '0');
    return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())} ${pad(base.getHours())}:${pad(base.getMinutes())}:00`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: name,
        telefono: phone || null,
        inicio_utc: buildNaiveDateTime(date, time, 0),
        fin_utc: buildNaiveDateTime(date, endTime, endDayOffset),
        color: color || null,
      };
      if (!payload.nombre || !payload.inicio_utc || !payload.fin_utc) {
        alert('Faltan campos obligatorios: nombre, fecha u horas');
        return;
      }
      const res = await apiFetch(`${url}/api/calendar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${errText ? ` - ${errText}` : ''}`);
      }
      const data = await res.json().catch(() => null);
      try {
        const key = 'calendarColors';
        const map = JSON.parse(localStorage.getItem(key) || '{}');
        if (data?.id_cita) {
          map[String(data.id_cita)] = color;
          localStorage.setItem(key, JSON.stringify(map));
        }
      } catch (_) { /* noop */ }
      alert(`Cita guardada correctamente${data?.id_cita ? ` (ID ${data.id_cita})` : ''}`);
      navigate('/calendar');
    } catch (err) {
      alert(`Error al guardar cita: ${err?.message || String(err)}`);
    }
  };

  useEffect(() => {
    const payload = {
      nombre: name || '',
      inicio_utc: buildNaiveDateTime(date, time, 0),
      fin_utc: buildNaiveDateTime(date, endTime, endDayOffset),
      telefono: phone || '',
      color: color || ''
    };
    console.log('Nueva cita (payload naive):', payload);
  }, [name, date, time, endTime, endDayOffset, phone, color]);

  return (
    <>
      <Header />
      <Page>
        <Title>Nueva cita</Title>
        <Form onSubmit={onSubmit}>
          

          <Field>
            <span>Fecha</span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Field>
          <Field>
            <span>Hora inicio</span>
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              required
            />
          </Field>

          <Field>
            <span>Hora fin</span>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              required
            />
          </Field>
          <Field style={{ justifyItems: 'center' }}>
            <span>Color</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {COLOR_OPTIONS.map(({ name, hex }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setColor(name)}
                  title={name}
                  aria-label={`Elegir color ${name}`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: color === name ? '3px solid white' : '2px solid transparent',
                    boxShadow: color === name ? '0 0 0 2px rgba(0,0,0,0.15)' : '0 0 0 1px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                />
              ))}
              <input type="hidden" name="color" value={color} />
            </div>
          </Field>
          <Field>
            <span>Nombre</span>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del paciente"
              required
            />
          </Field>

          <Field>
            <span>Número</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 5512345678"
              pattern="[- 0-9()+]{7,}"
            />
          </Field>

          <Actions>
            <PrimaryButton type="submit">Guardar cita</PrimaryButton>
            <GhostButton type="button" onClick={() => navigate(-1)}>Cancelar</GhostButton>
          </Actions>
        </Form>
      </Page>
    </>
  );
}

