// src/pages/Calendar.jsx
import Header from '../components/Header.jsx';
import { useEffect } from 'react';
import { url } from '../helpers/url.js';
import { Page, HeaderRow, Title, NewButtonLink } from './Calendar.styles.jsx';

export default function Calendar() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/calendar`, { credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ''}`);
        }
        const data = await res.json().catch(() => null);
        console.log('Citas del backend (/api/calendar):', data);
      } catch (err) {
        console.error('Error obteniendo citas:', err);
      }
    })();
  }, []);
  return (
    <>
      <Header />
      <Page>
        <HeaderRow>
          <Title>Calendario</Title>
          <NewButtonLink to="/calendar/new">Crear nueva cita</NewButtonLink>
        </HeaderRow>
        {/* Próximamente: contenido del calendario */}
      </Page>
    </>
  );
}
