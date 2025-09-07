// src/pages/NewAppointment.jsx
import Header from '../components/Header.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div style={{ padding: '24px' }}>
        <h2>Nueva cita</h2>
        <form onSubmit={onSubmit} style={{ maxWidth: 420, display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Hora</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Nombre</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cliente"
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Número</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 5512345678"
              required
              pattern="[0-9\s+()-]{7,}"
              style={inputStyle}
            />
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={primaryBtn}>Guardar cita</button>
            <button type="button" onClick={() => navigate(-1)} style={ghostBtn}>Cancelar</button>
          </div>
        </form>
      </div>
    </>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d0d7de',
  fontSize: '1rem'
};

const primaryBtn = {
  background: '#0ea5b7',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer'
};

const ghostBtn = {
  background: 'transparent',
  color: '#0ea5b7',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #0ea5b7',
  fontWeight: 600,
  cursor: 'pointer'
};

