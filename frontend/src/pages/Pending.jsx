// src/pages/Pending.jsx
import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { url } from '../helpers/url.js';

// 🆕 Componente reutilizable
import InteractCard from '../components/InteractCard.jsx';
import ProfileReminderCard from '../components/ProfileReminderCard.jsx';

// 👉 Mantén solo los contenedores de estilo generales
import { Container, SectionTitle } from './Pending.styles.jsx';

function Pending() {
  const [pendingData, setPendingData] = useState({ reminders: [], birthdays: [], profileReminders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 1️⃣ Fetch */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/pending`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Error al obtener los datos 😢');
        const payload = await res.json();

        let profileReminders = [];
        try {
          const resProfiles = await fetch(`${url}/api/profilepending`, {
            credentials: 'include',
          });
          if (resProfiles.ok) {
            const profilesPayload = await resProfiles.json();
            profileReminders = Array.isArray(profilesPayload?.items)
              ? profilesPayload.items
              : [];
          }
        } catch (e) {
          console.error('Error al obtener profilepending:', e);
        }
        setPendingData({
          reminders: Array.isArray(payload?.reminders) ? payload.reminders : [],
          birthdays: Array.isArray(payload?.birthdays) ? payload.birthdays : [],
          profileReminders,
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
  const { reminders, birthdays, profileReminders } = useMemo(() => {
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
            lastContact: item.ultima_fecha_contacto ?? null,
            birthDate: rawDate ?? null,
            isBirthdayToday: Boolean(isToday)
          };
        })
      : [];

    const profileRemindersList = Array.isArray(pendingData.profileReminders)
      ? pendingData.profileReminders.map((item) => ({
          id: item.id_perfil ?? item.id,
          name: item.nombre ?? 'Sin nombre',
          phone: item.telefono_movil ?? '',
          reminderDate: item.recordatorio ?? null,
          reminderDesc: item.recordatorio_desc ?? '',
        }))
      : [];

    return { reminders: remindersList, birthdays: birthdaysList, profileReminders: profileRemindersList };
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
        <SectionTitle>Recordatorios de perfil ⏰</SectionTitle>
        <div className="overdue">
          {profileReminders.length
            ? profileReminders.map((item) => (
                <ProfileReminderCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  reminderDate={item.reminderDate}
                  reminderDesc={item.reminderDesc}
                  onClear={(pid) => {
                    setPendingData((prev) => ({
                      ...prev,
                      profileReminders: Array.isArray(prev.profileReminders)
                        ? prev.profileReminders.filter(
                            (r) => (r.id_perfil ?? r.id) !== pid,
                          )
                        : [],
                    }));
                  }}
                />
              ))
            : <p>🎉 No hay recordatorios de perfil</p>}
        </div>
        <SectionTitle>Recordatorios de consultas (≤ 30 días) ⏰</SectionTitle>
        <div className="overdue">
          {reminders.length
            ? reminders.map((item) => (
                <InteractCard
                  key={item.consultaId ?? item.id}
                  id={item.id}
                  consultaId={item.consultaId}
                  name={item.name}
                  lastContact={item.lastContact}
                  reminderDate={item.reminderDate}
                  showPostpone={true}
                  onPostpone={(rid) => {
                    setPendingData((prev) => ({
                      ...prev,
                      reminders: prev.reminders.filter((r) => (r.consultaId ?? r.id) !== rid)
                    }));
                  }}
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
