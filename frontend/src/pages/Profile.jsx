// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { url } from '../helpers/url.js';
import MessageGenerator from '../components/MessageGenerator.jsx';
import { Container, Title, SwitchRow } from './Profile.styles.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ProfileInformation from '../components/ProfileInformation.jsx';

export default function Profile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState(null);
  const [view, setView] = useState('perfil');

  // Carga del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${url}/api/profile/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('No se pudo cargar el perfil');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (<><Header /><p style={{ textAlign: 'center' }}>Cargando perfil… ⏳</p></>);
  if (error) return (<><Header /><p style={{ textAlign: 'center' }}>❌ {error}</p></>);

  const handleEditProfile = () => navigate(`/modify/${id}`);
  const askDeleteProfile = () => setToDelete({ id, label: data.nombre });
  const cancelDelete = () => setToDelete(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`${url}/api/profile/${toDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) navigate('/');
    } catch (e) {
      console.error('Error al eliminar:', e);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <SwitchRow>
          <label>
            <input type="radio" name="profile-view" value="perfil" checked={view === 'perfil'} onChange={() => setView('perfil')} />
            Perfil
          </label>
          <label>
            <input type="radio" name="profile-view" value="ia" checked={view === 'ia'} onChange={() => setView('ia')} />
            IA
          </label>
        </SwitchRow>
        <Title>Perfil de {data.nombre} ID{id}</Title>
        
        {view === 'perfil' ? (
          <ProfileInformation
            data={data}
            onEditProfile={handleEditProfile}
            onDeleteProfile={askDeleteProfile}
          />
        ) : null}
      </Container>

      {/* Generador de mensajes sin sección de pólizas */}
      {view === 'ia' ? <MessageGenerator profile={data} /> : null}

      <ConfirmModal
        open={!!toDelete}
        text={toDelete ? `Eliminar el perfil de "${data.nombre}"? ¡Esta acción no se puede deshacer!` : ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
} 


