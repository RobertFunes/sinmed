// src/pages/Calendar.jsx
import Header from '../components/Header.jsx';
import { useEffect, useMemo, useState } from 'react';
import { url } from '../helpers/url.js';
import { Page, HeaderRow, Title, NewButtonLink,CalendarContainer } from './Calendar.styles.jsx';
import { scheduleBuilder } from '../helpers/adminSqueduleBuilder.js';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Fijar español explícitamente para nombres y formatos
moment.locale('es');

const localizer = momentLocalizer(moment);

const messagesEs = {
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Todo el día',
  week: 'Semana',
  work_week: 'Semana laboral',
  day: 'Día',
  month: 'Mes',
  previous: 'Atrás',
  next: 'Siguiente',
  yesterday: 'Ayer',
  tomorrow: 'Mañana',
  today: 'Hoy',
  agenda: 'Agenda',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total) => `+ Ver más (${total})`,
};

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week'); // controla la vista activa
  const [date, setDate] = useState(() => new Date()); // controla la fecha visible

  const minTime = useMemo(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  }, []);
  const maxTime = useMemo(() => {
    const d = new Date();
    d.setHours(20, 0, 0, 0);
    return d;
  }, []);

  // Render personalizado: en vista semanal ocultar texto del evento
  const EventContent = ({ title }) => {
    if (view === 'week') return <></>;
    return <span>{title}</span>;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/calendar`, { credentials: 'include' });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` - ${txt}` : ''}`);
        }
        const data = await res.json().catch(() => null);
        const items = Array.isArray(data?.items) ? data.items : [];
        const built = scheduleBuilder(items);
        setEvents(built);
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
        <CalendarContainer>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["day","week","agenda"]}
            view={view}
            defaultView="week"
            onView={(v) => {
              setView(v);
              // console.log('Vista cambiada a:', v);
            }}
            date={date}
            onNavigate={(newDate) => {
              setDate(newDate);
              // console.log('Fecha cambiada a:', newDate);
            }}
            messages={messagesEs}
            min={minTime}
            max={maxTime}
            style={{ height: 'calc(110vh)', marginTop: 16 }}
            eventPropGetter={(event) => {
              const style = {};
              if (event && event.color) {
                style.backgroundColor = event.color;
                style.borderColor = event.color;
                style.color = '#fff';
              }
            return { style };
          }}
            components={{ event: EventContent }}
          />
        </CalendarContainer>
      </Page>
    </>
  );
}
