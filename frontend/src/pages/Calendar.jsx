// src/pages/Calendar.jsx
import Header from '../components/Header.jsx';
import CalendarModal from '../components/CalendarModal.jsx';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { url } from '../helpers/url.js';
import { Page, HeaderRow, Title, NewButtonLink,CalendarContainer } from './Calendar.styles.js';
import { scheduleBuilder } from '../helpers/adminSqueduleBuilder.js';
import { Calendar as BigCalendar, momentLocalizer, Navigate } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Fijar español explícitamente para nombres y formatos
moment.locale('es');

const localizer = momentLocalizer(moment);

const COLOR_SWATCH = {
  blue: '#1976D2',
  green: '#2E7D32',
  red: '#D32F2F',
  orange: '#F57C00',
  purple: '#6A1B9A',
};

const resolveEventColor = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const norm = trimmed.toLowerCase();
  return COLOR_SWATCH[norm] || trimmed;
};

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
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week'); // controla la vista activa
  const [date, setDate] = useState(() => new Date()); // controla la fecha visible
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalForEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const toIsoString = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return typeof value === 'string' ? value : null;
    }
    return parsed.toISOString();
  };

  const handleDeleteEvent = (deletedId) => {
    if (deletedId != null) {
      setEvents((prev) => prev.filter((event) => {
        const currentId = event.id ?? event.raw?.id_cita ?? null;
        return String(currentId ?? '') !== String(deletedId ?? '');
      }));
    }
    closeModal();
  };

  const handleModifyEvent = () => {
    if (!selectedEvent) {
      closeModal();
      return;
    }

    const payload = {
      id: selectedEvent.id ?? selectedEvent.raw?.id_cita ?? null,
      nombre: selectedEvent.nombre ?? selectedEvent.title ?? selectedEvent.raw?.nombre ?? '',
      telefono: selectedEvent.telefono ?? selectedEvent.phone ?? selectedEvent.raw?.telefono ?? '',
      color: selectedEvent.color ?? selectedEvent.raw?.color ?? '',
      inicio_utc: toIsoString(selectedEvent.start ?? selectedEvent.inicio_utc ?? selectedEvent.raw?.inicio_utc),
      fin_utc: toIsoString(selectedEvent.end ?? selectedEvent.fin_utc ?? selectedEvent.raw?.fin_utc),
    };

    navigate('/calendar/modify', { state: { appointment: payload } });
    closeModal();
  };

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

  // Toolbar personalizada para asegurar etiqueta en español
  const CustomToolbar = ({ date: currentDate, view: currentView, views, label, localizer, onNavigate, onView }) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const formatoDia = (d) => `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
    const formatoMes = (d) => `${meses[d.getMonth()]} de ${d.getFullYear()}`;
    const formatoRango = (start, end) => {
      const mismoMes = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      const mismoAnio = start.getFullYear() === end.getFullYear();
      if (mismoMes) {
        return `${start.getDate()}–${end.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()}`;
      }
      if (mismoAnio) {
        return `${start.getDate()} de ${meses[start.getMonth()]} – ${end.getDate()} de ${meses[end.getMonth()]} de ${start.getFullYear()}`;
      }
      return `${start.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()} – ${end.getDate()} de ${meses[end.getMonth()]} de ${end.getFullYear()}`;
    };

    const computeLabel = () => {
      if (currentView === 'day') {
        return formatoDia(currentDate);
      }
      if (currentView === 'week') {
        const start = localizer.startOf(currentDate, 'week');
        const end = localizer.endOf(currentDate, 'week');
        return formatoRango(start, end);
      }
      if (currentView === 'agenda' || currentView === 'month') {
        return formatoMes(currentDate);
      }
      return label;
    };

    const msgs = localizer.messages;
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => onNavigate(Navigate.TODAY)}>{msgs.today}</button>
          <button type="button" onClick={() => onNavigate(Navigate.PREVIOUS)}>{msgs.previous}</button>
          <button type="button" onClick={() => onNavigate(Navigate.NEXT)}>{msgs.next}</button>
        </span>
        <span className="rbc-toolbar-label">{computeLabel()}</span>
        <span className="rbc-btn-group">
          {views && views.length > 1 && views.map((name) => (
            <button
              type="button"
              key={name}
              className={currentView === name ? 'rbc-active' : ''}
              onClick={() => onView(name)}
            >
              {msgs[name] ?? name}
            </button>
          ))}
        </span>
      </div>
    );
  };

  // Formatos en español para encabezados (toolbar) y rangos
  const baseFormats = useMemo(() => ({
    // Encabezado de cada columna en vista semanal: "21 Dom"
    dayFormat: (date) => {
      const diasAbrev = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return `${date.getDate()} ${diasAbrev[date.getDay()]}`;
    },
    // Encabezados de días abreviados (vista mensual y otros): "Dom"
    weekdayFormat: (date) => {
      const diasAbrev = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return diasAbrev[date.getDay()];
    },
    // Encabezado de rango para vista semanal: "7–13 de septiembre de 2025"
    dayRangeHeaderFormat: ({ start, end }) => {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mismoMes = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      const mismoAnio = start.getFullYear() === end.getFullYear();
      if (mismoMes) {
        return `${start.getDate()}–${end.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()}`;
      }
      if (mismoAnio) {
        return `${start.getDate()} de ${meses[start.getMonth()]} – ${end.getDate()} de ${meses[end.getMonth()]} de ${start.getFullYear()}`;
      }
      return `${start.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()} – ${end.getDate()} de ${meses[end.getMonth()]} de ${end.getFullYear()}`;
    },
    // Encabezado para vista diaria: "miércoles 8 de septiembre de 2025"
    dayHeaderFormat: (date) => {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
    },
    // Encabezado para vista mensual: "septiembre de 2025"
    monthHeaderFormat: (date) => {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${meses[date.getMonth()]} de ${date.getFullYear()}`;
    },
    // Fecha por fila en vista de agenda: 'viernes 19 de septiembre'
    agendaDateFormat: (date) => {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Mi�rcoles', 'Jueves', 'Viernes', 'S�bado'];
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
    },

    // Encabezado de agenda: usar el mismo estilo de rango en espa�ol
    agendaHeaderFormat: ({ start, end }) => {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const mismoMes = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      const mismoAnio = start.getFullYear() === end.getFullYear();
      if (mismoMes) {
        return `${start.getDate()}–${end.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()}`;
      }
      if (mismoAnio) {
        return `${start.getDate()} de ${meses[start.getMonth()]} – ${end.getDate()} de ${meses[end.getMonth()]} de ${start.getFullYear()}`;
      }
      return `${start.getDate()} de ${meses[start.getMonth()]} de ${start.getFullYear()} – ${end.getDate()} de ${meses[end.getMonth()]} de ${end.getFullYear()}`;
    },
  }), []);

  // En vista semanal, ocultar la hora dentro del bloque del evento, manteniendo encabezados en español
  const formats = useMemo(() => {
    if (view === 'week') {
      return {
        ...baseFormats,
        eventTimeRangeFormat: () => '',
        eventTimeRangeStart: () => '',
        eventTimeRangeEnd: () => '',
      };
    }
    return baseFormats;
  }, [view, baseFormats]);

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
            culture="es"
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
              const resolved = event ? resolveEventColor(event.color) : null;
              if (resolved) {
                style.backgroundColor = resolved;
                style.borderColor = resolved;
                style.color = '#fff';
              }
              return { style };
            }}
            onSelectEvent={openModalForEvent}
            components={{ event: EventContent, toolbar: CustomToolbar }}
            formats={formats}
          />
        </CalendarContainer>
        <CalendarModal
          visible={isModalOpen}
          appointment={selectedEvent}
          onClose={closeModal}
          onDelete={handleDeleteEvent}
          onModify={handleModifyEvent}
        />
      </Page>
    </>
  );
}

