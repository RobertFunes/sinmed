// src/pages/Pending.jsx
import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { url } from '../helpers/url.js';

// 🆕 Componente reutilizable
import InteractCard from '../components/InteractCard.jsx';

// 👉 Mantén solo los contenedores de estilo generales
import { Container, SectionTitle } from './Pending.styles.jsx';

function Pending() {
  const [pendingData, setPendingData] = useState({ reminders: [], birthdays: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 1️⃣ Fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/pending`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Error al obtener los datos 😢');
        const payload = await res.json();
        setPendingData({
          reminders: Array.isArray(payload?.reminders) ? payload.reminders : [],
          birthdays: Array.isArray(payload?.birthdays) ? payload.birthdays : []
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 2️⃣ Normalización */
  const { reminders, birthdays } = useMemo(() => {
    const remindersList = Array.isArray(pendingData.reminders)
      ? pendingData.reminders.map((item) => ({
          id: item.id_perfil ?? item.id,
          consultaId: item.id_consulta,
          name: item.nombre ?? 'Sin nombre',
          lastContact: item.fecha_consulta ?? null,
          reminderDate: item.recordatorio ?? null
        }))
      : [];

    const birthdaysList = Array.isArray(pendingData.birthdays)
      ? pendingData.birthdays.map((item) => {
          const rawDate = item.proximo_cumple ?? item.fecha_nacimiento;
          const date = rawDate ? new Date(rawDate) : null;
          const today = new Date();
          const isToday =
            date &&
            date.getUTCMonth() === today.getUTCMonth() &&
            date.getUTCDate() === today.getUTCDate();

          return {
            id: item.id,
            name: item.nombre ?? 'Sin nombre',
            birthDate: rawDate ?? null,
            isBirthdayToday: Boolean(isToday)
          };
        })
      : [];

    return { reminders: remindersList, birthdays: birthdaysList };
  }, [pendingData]);

  /* 3️⃣ UI */
  if (loading)
    return (
      <>
        <Header />
        <p style={{ textAlign: 'center' }}>Cargando clientes… ⏳</p>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <p style={{ textAlign: 'center' }}>⚠️ {error}</p>
      </>
    );

  return (
    <>
      <Header />
      <Container>
        <SectionTitle>Recordatorios de consultas (≤ 30 días) ⏰</SectionTitle>
        <div className="overdue">
          {reminders.length
            ? reminders.map((item) => (
                <InteractCard
                  key={item.consultaId ?? item.id}
                  id={item.id}
                  name={item.name}
                  lastContact={item.lastContact}
                  reminderDate={item.reminderDate}
                  showPostpone={true}
                />
              ))
            : <p>🎉 ¡No hay recordatorios próximos!</p>}
        </div>

        <SectionTitle>Próximos cumpleaños (≤ 30 días) 🎂</SectionTitle>
        <div className="overdue">
          {birthdays.length
            ? birthdays.map((item) => (
                <InteractCard
                  id={item.id}
                  key={item.id}
                  name={item.name}
                  lastContact={item.lastContact}
                  birthDate={item.birthDate}
                  isBirthdayToday={item.isBirthdayToday}
                  showPostpone={false} // No mostrar botón de posponer en cumpleaños
                />
              ))
            : <p>🥳 Ningún cumpleaños próximo</p>}
        </div>
      </Container>
    </>
  );
}

export default Pending;
