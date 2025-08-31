// src/pages/Pending.jsx
import { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { url } from '../helpers/url.js';

// 🆕 Componente reutilizable
import InteractCard from '../components/InteractCard.jsx';

// 👉 Mantén solo los contenedores de estilo generales
import { Container, SectionTitle } from './Pending.styles.jsx';

function Pending() {
  const [clients, setClients] = useState([]);
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
        setClients(await res.json());
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* 2️⃣ Clasificación */
  const { overdue, birthdays } = useMemo(() => {
    const today = new Date();
    const overdueArr = [];
    const birthdayArr = [];

    clients.forEach(c => {
      const last = c.ultima_fecha_contacto
        ? new Date(c.ultima_fecha_contacto.slice(0, 10) + 'T00:00:00')
        : null;
      const next = c.proximo_cumple
        ? new Date(c.proximo_cumple.slice(0, 10) + 'T00:00:00')
        : null;

      const daysSince = last ? Math.floor((today - last) / 86_400_000) : Infinity;
      const daysToBd = next ? Math.ceil((next - today) / 86_400_000) : Infinity;

      if (daysSince > 40) overdueArr.push({ ...c, daysSince });
      if (daysToBd <= 30) birthdayArr.push({ ...c, daysToBd });
    });

    overdueArr.sort((a, b) => b.daysSince - a.daysSince);
    birthdayArr.sort((a, b) => a.daysToBd - b.daysToBd);

    return { overdue: overdueArr, birthdays: birthdayArr };
  }, [clients]);

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
        {/* +40 d sin contacto */}
        <SectionTitle>Perfiles con más de 40 días sin contacto 📞</SectionTitle>
        <div className="overdue">

          {overdue.length
            ? overdue.map(c => (
              <InteractCard
                key={c.id}
                id={c.id}
                name={c.nombre}
                lastContact={c.ultima_fecha_contacto}
                onPostpone={(idPospuesto) => {
                  setClients(prev => prev.filter(c => c.id !== idPospuesto));
                }}
              />
            ))
             : <p>🎉 ¡No tienes pendientes por contacto!</p>}

          {/* Cumples próximos */}
        </div>
        <SectionTitle>Próximos cumpleaños (≤ 30 días) 🎂</SectionTitle>
        <div className="overdue">

          {birthdays.length
            ? birthdays.map(c => (
              <InteractCard
                id={c.id}
                key={c.id}  
                name={c.nombre}
                lastContact={c.ultima_fecha_contacto}
                birthDate={c.proximo_cumple}
                isBirthdayToday={c.daysToBd === 0}
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