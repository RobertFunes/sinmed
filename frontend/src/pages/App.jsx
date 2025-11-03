import { useState, useEffect } from 'react';
import { PendingTitle, ContactListContainer, PaginationContainer } from './App.styles.jsx';
import { url } from '../helpers/url.js';
import ContactCard from '../components/ContactCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Header from '../components/Header.jsx';

export default function Nav() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  /* ---------- Modal de confirmación ---------- */
  const [deleteStage, setDeleteStage] = useState({ step: 0, id: null, nombre: '' });

  const resetDelete = () => setDeleteStage({ step: 0, id: null, nombre: '' });
  const askDelete = (id, nombre) => setDeleteStage({ step: 1, id, nombre });
  const cancelDelete = () => resetDelete();

  const handleFirstConfirm = () => setDeleteStage(prev => ({ ...prev, step: 2 }));

  const confirmDelete = async () => {
    const { id, nombre } = deleteStage;
    try {
      const res = await fetch(`${url}/api/profile/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudo eliminar');

      setProfiles(prev => prev.filter(p => p.id_perfil !== id));
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
    fetch(`${url}/api/summary?page=${page}&limit=${limit}` , {
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
  const nextPage = () => page < totalPages && setPage(prev => prev + 1);
  const prevPage = () => page > 1 && setPage(prev => prev - 1);


  /* ---------- Render ---------- */
  return (
    <>
      <Header />
      <PendingTitle>Perfiles en base de datos 📁</PendingTitle>

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
        <button onClick={prevPage} disabled={page === 1}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={nextPage} disabled={page >= totalPages}>Siguiente</button>
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
