import { useState, useEffect } from 'react';
import { PendingTitle, ContactListContainer, PaginationContainer } from './App.styles.jsx';
import { url } from '../helpers/url.js';
import { apiFetch } from '../helpers/apiFetch';
import ContactCard from '../components/ContactCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Header from '../components/Header.jsx';
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaDatabase,
} from 'react-icons/fa';

export default function Nav() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;
  const maxPageButtons = 7;

  /* ---------- Modal de confirmación ---------- */
  const [deleteStage, setDeleteStage] = useState({ step: 0, id: null, nombre: '' });

  const resetDelete = () => setDeleteStage({ step: 0, id: null, nombre: '' });
  const askDelete = (id, nombre) => setDeleteStage({ step: 1, id, nombre });
  const cancelDelete = () => resetDelete();

  const handleFirstConfirm = () => setDeleteStage(prev => ({ ...prev, step: 2 }));

  const confirmDelete = async () => {
    const { id, nombre } = deleteStage;
    try {
      const res = await apiFetch(`${url}/api/profile/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudo eliminar');

      setProfiles(prev => prev.filter(p => p.id_perfil !== id));
      setTotal(prev => Math.max(0, prev - 1));
      alert(`✅ ${nombre} eliminado`);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('❌ Ocurrió un problema');
    } finally {
      resetDelete();
    }
  };

  /* ---------- Carga de perfiles ---------- */
  useEffect(() => {
    apiFetch(`${url}/api/summary?page=${page}&limit=${limit}` , {
      credentials: 'include', // 👈 Así incluyes cookies/sesión
    })
      .then(res => res.json())
      .then(data => {
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
      })
      .catch(err => {
        console.error('Error al cargar perfiles:', err);
        setProfiles([]);
        setTotal(0);
      });
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;
  useEffect(() => {
    setPage(prev => Math.min(Math.max(1, prev), totalPages));
  }, [totalPages]);

  const nextPage = () => page < totalPages && setPage(prev => prev + 1);
  const prevPage = () => page > 1 && setPage(prev => prev - 1);
  const goToPage = (target) => {
    const next = Math.min(Math.max(1, Number(target)), totalPages);
    setPage(next);
  };

  const getPageItems = () => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const siblings = 1;
    const left = Math.max(page - siblings, 2);
    const right = Math.min(page + siblings, totalPages - 1);

    const items = [1];
    if (left > 2) items.push('…');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push('…');
    items.push(totalPages);
    return items;
  };


  /* ---------- Render ---------- */
  return (
    <>
      <Header />
      <PendingTitle>
        <span className="titleGlass">
          Perfiles en base de datos
          <FaDatabase className="titleIcon" aria-hidden="true" focusable="false" />
        </span>
      </PendingTitle>

      <ContactListContainer>
        {profiles.map(p => (
          <ContactCard
            key={p.id_perfil}
            id={p.id_perfil}
            name={p.nombre}
            phone={p.telefono_movil}
            age={p.edad}
            created={p.creado}
            updated={p.actualizado}
            onDelete={() => askDelete(p.id_perfil, p.nombre)}
          />
        ))}
      </ContactListContainer>

      <PaginationContainer>
        <button onClick={() => goToPage(1)} disabled={page === 1} aria-label="Primera página">
          <FaAngleDoubleLeft aria-hidden="true" focusable="false" />
        </button>
        <button onClick={prevPage} disabled={page === 1} aria-label="Página anterior">
          <FaAngleLeft aria-hidden="true" focusable="false" />
        </button>

        <div className="pages" role="navigation" aria-label="Paginación">
          {getPageItems().map((item, idx) => {
            if (item === '…') {
              return (
                <span key={`ellipsis-${idx}`} className="ellipsis" aria-hidden="true">
                  …
                </span>
              );
            }

            const n = item;
            const isActive = n === page;
            return (
              <button
                key={n}
                onClick={() => goToPage(n)}
                disabled={isActive}
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'page' : undefined}
              >
                {n}
              </button>
            );
          })}
        </div>

        <button onClick={nextPage} disabled={page >= totalPages} aria-label="Página siguiente">
          <FaAngleRight aria-hidden="true" focusable="false" />
        </button>
        <button onClick={() => goToPage(totalPages)} disabled={page >= totalPages} aria-label="Última página">
          <FaAngleDoubleRight aria-hidden="true" focusable="false" />
        </button>

        <span className="meta">
          Página {page} de {totalPages}
        </span>
      </PaginationContainer>

      <ConfirmModal
        open={deleteStage.step === 1}
        text={`¿Eliminar el perfil de "${deleteStage.nombre}"? ¡Esta acción no se puede deshacer!`}
        onCancel={cancelDelete}
        onConfirm={handleFirstConfirm}
      />
      <ConfirmModal
        open={deleteStage.step === 2}
        text={`Es la última oportunidad... ¿Eliminar definitivamente a "${deleteStage.nombre}"?`}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="⚠️ Confirmación final"
        confirmLabel="Eliminar definitivamente"
      />
    </>
  );
}
