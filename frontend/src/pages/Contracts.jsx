// src/pages/Contract.jsx
import { useState, useEffect } from 'react';
import { PendingTitle, ContactListContainer, PaginationContainer } from './App.styles.jsx';
import { url } from '../helpers/url.js';
import PolizaCard from '../components/PolizaCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Header from '../components/Header.jsx';
import { useNavigate } from 'react-router-dom';

export default function Contracts() {
  const [polizas, setPolizas] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Modal de confirmación
  const [toDelete, setToDelete] = useState(null); // { id_poliza, numero_poliza? }
  const navigate = useNavigate();

  // Carga de pólizas paginadas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/polizas?page=${page}&limit=${limit}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        setPolizas(data.polizas || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('Error al cargar pólizas:', err);
        setPolizas([]);
        setTotal(0);
      }
    })();
  }, [page]);

  // Abrir/cerrar modal
  const askDelete = (id_poliza, numero_poliza) => setToDelete({ id_poliza, numero_poliza });
  const cancelDelete = () => setToDelete(null);

  // Confirmar borrado
  const confirmDelete = async () => {
    const { id_poliza } = toDelete || {};
    if (!id_poliza) return;

    try {
      // Si tu backend usa otra ruta, cámbiala AQUÍ:
      // ej. `${url}/polizas/${id_poliza}` o `${url}/api/polizas/${id_poliza}`
      const res = await fetch(`${url}/api/delete/${id_poliza}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`No se pudo eliminar (HTTP ${res.status})`);

      // UI optimista: quita la tarjeta del estado
      setPolizas(prev => prev.filter(p => p.id_poliza !== id_poliza));
      alert('✅ Póliza eliminada');
    } catch (err) {
      console.error('Error al eliminar póliza:', err);
      alert('❌ Ocurrió un problema al eliminar');
    } finally {
      setToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const nextPage = () => page < totalPages && setPage(p => p + 1);
  const prevPage = () => page > 1 && setPage(p => p - 1);

  return (
    <>
      <Header />
      <PendingTitle>
        Pólizas en base de datos 📁
      </PendingTitle>

      <ContactListContainer>
        {polizas.map(p => (
          <PolizaCard
            key={p.id_poliza}
            id_poliza={p.id_poliza}
            numero_poliza={p.numero_poliza}
            aseguradora={p.aseguradora}
            fecha_inicio_poliza={p.fecha_inicio_poliza}
            fecha_termino_poliza={p.fecha_termino_poliza}
            titular_id_cliente={p.titular_id_cliente}   // 👈 NECESARIO
            onView={() => navigate(`/profile/${p.titular_id_cliente}`)}
            onEdit={() => navigate(`/polizas/${p.id_poliza}/edit`)}
            onDelete={() => askDelete(p.id_poliza, p.numero_poliza)}
          />
        ))}
      </ContactListContainer>

      <PaginationContainer>
        <button onClick={prevPage} disabled={page === 1}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={nextPage} disabled={page >= totalPages}>Siguiente</button>
      </PaginationContainer>

      <ConfirmModal
        open={!!toDelete}
        text={
          toDelete
            ? `¿Eliminar la póliza ${toDelete.numero_poliza || `ID ${toDelete.id_poliza}`}? Esta acción no se puede deshacer.`
            : ''
        }
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
