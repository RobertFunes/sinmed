// src/pages/NewAppointment.jsx
import Header from '../components/Header.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Title, Form, Field, Input, Actions, PrimaryButton, GhostButton } from './NewAppointment.styles.jsx';

export default function NewAppointment() {
  const navigate = useNavigate();
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
            <span>Hora</span>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </Field>

          <Field>
            <span>Nombre</span>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cliente"
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
