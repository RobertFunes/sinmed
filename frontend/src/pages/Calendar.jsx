// src/pages/Calendar.jsx
import Header from '../components/Header.jsx';
import { Link } from 'react-router-dom';

export default function Calendar() {
  return (
    <>
      <Header />
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0 }}>Calendario</h2>
          <Link
            to="/calendar/new"
            style={{
              textDecoration: 'none',
              background: '#0ea5b7',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Crear nueva cita
          </Link>
        </div>
        {/* Próximamente: contenido del calendario */}
      </div>
    </>
  );
}
