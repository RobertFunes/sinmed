// src/pages/NewAppointment.jsx
import Header from '../components/Header.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Title, Form, Field, Input, Actions, PrimaryButton, GhostButton } from './NewAppointment.styles.jsx';

export default function NewAppointment() {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const onTimeChange = (val) => {
    setTime(val);
    if (!val) {
      setEndTime('');
      return;
    }
    const [hh, mm] = val.split(':').map(Number);
    if (Number.isInteger(hh) && Number.isInteger(mm)) {
      const total = (hh * 60 + mm + 45) % (24 * 60);
      const endH = String(Math.floor(total / 60)).padStart(2, '0');
      const endM = String(total % 60).padStart(2, '0');
      setEndTime(`${endH}:${endM}`);
    } else {
      setEndTime('');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Por ahora solo mostramos los datos. Aquí podrías llamar a tu backend.
    alert(`Cita creada\nHora: ${time}\nNombre: ${name}\nNúmero: ${phone}`);
    navigate('/calendar');
  };

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
              readOnly
              disabled
            />
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
              required
              pattern="[0-9\s+()-]{7,}"
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
