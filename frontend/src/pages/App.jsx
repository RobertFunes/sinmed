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
  const [toDelete, setToDelete] = useState(null);
  const askDelete      = (id, nombre)        => setToDelete({ id, nombre });
  const cancelDelete   = ()                  => setToDelete(null);
  const confirmDelete  = async () => {
    const { id, nombre } = toDelete;
    try {
      const res = await fetch(`${url}/api/profile/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');

      setProfiles(prev => prev.filter(p => p.id_cliente !== id));
      alert(`✅ ${nombre} eliminado`);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('❌ Ocurrió un problema');
    } finally {
      setToDelete(null);
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
            key={p.id_cliente}
            id={p.id_cliente}
            name={p.nombre}
            phone={p.telefono_movil}
            lastContact={p.ultima_fecha_contacto}
            birthDate={p.fecha_nacimiento}
            onDelete={() => askDelete(p.id_cliente, p.nombre)}
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
        text={`¿Eliminar el perfil de "${toDelete?.nombre}"? ¡Esta acción no se puede deshacer!`}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
