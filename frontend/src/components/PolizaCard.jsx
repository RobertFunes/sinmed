// src/components/PolizaCard.jsx
import { useEffect, useState } from 'react';
import { url } from '../helpers/url.js';
import {
  Card,
  Name,
  InfoSection,
  InfoRow,
  ButtonRow,
  ActionButton,
} from './ContactCard.styles.jsx';

import { MdOutlineNumbers } from 'react-icons/md';
import {
  FaShieldAlt,
  FaFileContract,
  FaCalendarAlt,
  FaTrashAlt,
  FaEye,
  FaEdit,
  FaUserCircle,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

function formatYMD(v) {
  if (!v) return '—';
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

// Caché tonto para no repetir fetch por el mismo ID
const nameCache = new Map(); // id -> nombre | "__NF__" si no encontrado

export default function PolizaCard({
  id_poliza,
  numero_poliza,
  aseguradora,
  fecha_inicio_poliza,
  fecha_termino_poliza,
  titular_id_cliente,      // 👈 NUEVO: lo recibimos por props
  onDelete,
  onEdit,
  onView,
}) {
  const [titularNombre, setTitularNombre] = useState('Resolviendo…');
  const [status, setStatus] = useState('idle'); // idle | loading | ok | nf | error

  useEffect(() => {
    let aborted = false;
    async function resolveNombre() {
      const id = Number(titular_id_cliente);
      if (!Number.isInteger(id) || id <= 0) {
        setStatus('nf');
        setTitularNombre('Nombre no encontrado');
        return;
      }

      // cache hit
      if (nameCache.has(id)) {
        const val = nameCache.get(id);
        setStatus(val === '__NF__' ? 'nf' : 'ok');
        setTitularNombre(val === '__NF__' ? 'Nombre no encontrado' : val);
        return;
      }

      setStatus('loading');
      try {
        const res = await fetch(`${url}/api/profile/${id}/min`, {
          credentials: 'include',
        });
        if (!res.ok) {
          // 404: no encontrado
          if (res.status === 404) {
            nameCache.set(id, '__NF__');
            if (!aborted) {
              setStatus('nf');
              setTitularNombre('Nombre no encontrado');
            }
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json(); // { id, nombre }
        const nombre = data?.nombre?.trim();
        if (nombre) {
          nameCache.set(id, nombre);
          if (!aborted) {
            setStatus('ok');
            setTitularNombre(nombre);
          }
        } else {
          nameCache.set(id, '__NF__');
          if (!aborted) {
            setStatus('nf');
            setTitularNombre('Nombre no encontrado');
          }
        }
      } catch (e) {
        console.error('Error resolviendo titular:', e);
        nameCache.set(id, '__NF__');
        if (!aborted) {
          setStatus('error');
          setTitularNombre('Nombre no encontrado');
        }
      }
    }

    resolveNombre();
    return () => {
      aborted = true;
    };
  }, [titular_id_cliente]);

  return (
    <Card>
      {/* 1) Número de póliza (título) */}
      <Name>
        <FaFileContract style={{ marginRight: 8 }} />
        {numero_poliza || 'Sin número'}
      </Name>

      <InfoSection>
        {/* 2) ID de póliza */}
        <InfoRow>
          <MdOutlineNumbers />
          <span>ID póliza: {id_poliza ?? '—'}</span>
        </InfoRow>

        {/* 3) Contratante (resuelto por API) */}
        <InfoRow>
          <FaUserCircle />
          <span>
            Contratante:{' '}
            {titular_id_cliente ? (
              <Link to={`/profile/${titular_id_cliente}`}>
                {status === 'loading' ? 'Resolviendo…' : titularNombre}
              </Link>
            ) : (
              status === 'loading' ? 'Resolviendo…' : titularNombre
            )}
          </span>
        </InfoRow>

        {/* 4) Aseguradora */}
        <InfoRow>
          <FaShieldAlt />
          <span>{aseguradora || 'Sin aseguradora'}</span>
        </InfoRow>

        {/* 5) Fecha inicio */}
        <InfoRow>
          <FaCalendarAlt />
          <span>Inicio: {formatYMD(fecha_inicio_poliza)}</span>
        </InfoRow>

        {/* 6) Fecha término */}
        <InfoRow>
          <FaCalendarAlt />
          <span>Término: {formatYMD(fecha_termino_poliza)}</span>
        </InfoRow>
      </InfoSection>

      <ButtonRow>
        {onDelete && (
          <ActionButton className="delete" onClick={onDelete} title="Eliminar">
            <FaTrashAlt />
          </ActionButton>
        )}
        {onEdit && (
          <ActionButton onClick={onEdit} title="Editar">
            <FaEdit />
          </ActionButton>
        )}
        {onView && (
          <ActionButton onClick={onView} title="Ver">
            <FaEye />
          </ActionButton>
        )}
      </ButtonRow>
    </Card>
  );
}
