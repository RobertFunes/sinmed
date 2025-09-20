// src/pages/ModifyAppointment.jsx
import Header from '../components/Header.jsx';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { url } from '../helpers/url.js';
import { Page, Title, Form, Field, Input, Actions, PrimaryButton, GhostButton } from './NewAppointment.styles.jsx';

export default function ModifyAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const COLOR_OPTIONS = [
    { name: 'Blue', hex: '#1976D2' },
    { name: 'Green', hex: '#2E7D32' },
    { name: 'Red', hex: '#D32F2F' },
    { name: 'Orange', hex: '#F57C00' },
    { name: 'Purple', hex: '#6A1B9A' },
  ];

  const initialAppointment = location.state?.appointment ?? null;

  const parseDateValue = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const base = value.replace(' ', 'T');
      const attempts = [value, base, `${base}Z`];
      for (const attempt of attempts) {
        const parsedAttempt = new Date(attempt);
        if (!Number.isNaN(parsedAttempt.getTime())) return parsedAttempt;
      }
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const pad = (value) => String(value).padStart(2, '0');

  const toDateInput = (date) => (date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '');
  const toTimeInput = (date) => (date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : '');

  const computeOffset = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diff = Math.round((endMidnight - startMidnight) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const normalizeColor = (raw) => {
    if (typeof raw !== 'string') return COLOR_OPTIONS[0].name;
    const trimmed = raw.trim();
    if (!trimmed) return COLOR_OPTIONS[0].name;
    const nameMatch = COLOR_OPTIONS.find((option) => option.name.toLowerCase() === trimmed.toLowerCase());
    if (nameMatch) return nameMatch.name;
    const hexMatch = COLOR_OPTIONS.find((option) => option.hex.toLowerCase() === trimmed.toLowerCase());
    if (hexMatch) return hexMatch.name;
    return trimmed;
  };

  const deriveFormValues = (appointment) => {
    const startValue = appointment?.inicio_utc ?? appointment?.start ?? null;
    const endValue = appointment?.fin_utc ?? appointment?.end ?? null;
    const startDate = parseDateValue(startValue);
    const endDate = parseDateValue(endValue);

    return {
      date: toDateInput(startDate),
      time: toTimeInput(startDate),
      endTime: toTimeInput(endDate),
      endOffset: computeOffset(startDate, endDate),
      name: appointment?.nombre ?? appointment?.title ?? '',
      phone: appointment?.telefono ?? appointment?.phone ?? '',
      color: normalizeColor(appointment?.color),
      id: appointment?.id ?? null,
    };
  };

  const initialForm = deriveFormValues(initialAppointment ?? {});

  const [date, setDate] = useState(initialForm.date);
  const [time, setTime] = useState(initialForm.time);
  const [endTime, setEndTime] = useState(initialForm.endTime);
  const [endDayOffset, setEndDayOffset] = useState(initialForm.endOffset);
  const [name, setName] = useState(initialForm.name);
  const [phone, setPhone] = useState(initialForm.phone);
  const [color, setColor] = useState(initialForm.color);
  const [appointmentId, setAppointmentId] = useState(initialForm.id);

  useEffect(() => {
    if (!initialAppointment) return;
    const next = deriveFormValues(initialAppointment);
    setDate(next.date);
    setTime(next.time);
    setEndTime(next.endTime);
    setEndDayOffset(next.endOffset);
    setName(next.name);
    setPhone(next.phone);
    setColor(next.color);
    setAppointmentId(next.id);
  }, [initialAppointment]);

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
      const sum = startTotal + 45;
      const carry = sum >= 1440 ? 1 : 0;
      const total = sum % (24 * 60);
      const endH = String(Math.floor(total / 60)).padStart(2, '0');
      const endM = String(total % 60).padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
      setEndDayOffset(carry);
    } else {
      setEndTime('');
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
      const targetId = Number(appointmentId);
      if (!Number.isInteger(targetId) || targetId <= 0) {
        alert('No se encontró un ID válido de cita para modificar.');
        return;
      }
      const payload = {
        id_cita: targetId,
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
      const res = await fetch(`${url}/api/calendar`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${errText ? ` - ${errText}` : ''}`);
      }
      const data = await res.json().catch(() => null);
      if (data?.ok === false) {
        throw new Error(data.error || 'No fue posible actualizar la cita');
      }
      try {
        const key = 'calendarColors';
        const map = JSON.parse(localStorage.getItem(key) || '{}');
        map[String(targetId)] = color;
        localStorage.setItem(key, JSON.stringify(map));
      } catch (_) { /* noop */ }
      alert('Cita modificada correctamente');
      navigate('/calendar');
    } catch (err) {
      alert(`Error al modificar cita: ${err?.message || String(err)}`);
    }
  };

  useEffect(() => {
    const payload = {
      id_cita: appointmentId ?? null,
      nombre: name || '',
      inicio_utc: buildNaiveDateTime(date, time, 0),
      fin_utc: buildNaiveDateTime(date, endTime, endDayOffset),
      telefono: phone || '',
      color: color || ''
    };
    console.log('Cita a enviar (payload naive):', payload);
  }, [appointmentId, name, date, time, endTime, endDayOffset, phone, color]);

  return (
    <>
      <Header />
      <Page>
        <Title>Modificar cita</Title>
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
              readOnly
              disabled
            />
          </Field>
          <Field>
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
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: hex,
                    border: color === name ? '2px solid #111' : '2px solid transparent',
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

          <Actions style={{ gridColumn: 'span 2', justifyContent: 'center' }}>
            <PrimaryButton type="submit">Guardar cita</PrimaryButton>
            <GhostButton type="button" onClick={() => navigate(-1)}>Cancelar</GhostButton>
          </Actions>
        </Form>
      </Page>
    </>
  );
}

