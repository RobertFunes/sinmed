// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { url } from '../helpers/url.js';
import MessageGenerator from '../components/MessageGenerator.jsx';
import { Container, Title } from './Profile.styles.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import ProfileInformation from '../components/ProfileInformation.jsx';
import Policies from '../components/Policies.jsx';

export default function Profile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polizas, setPolizas] = useState([]);
  const navigate = useNavigate();
  const [toDelete, setToDelete] = useState(null);

  /* --- Fetch perfil --- */
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

  useEffect(() => {
    const fetchPolizas = async () => {
      try {
        const res = await fetch(`${url}/api/profile/${id}/polizas`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const json = await res.json();
        const items = json.items || [];
        const detailed = await Promise.all(
          items.map(async p => {
            try {
              const r = await fetch(`${url}/api/getOne/${p.id_poliza}`, {
                credentials: 'include',
              });
              if (r.ok) {
                const d = await r.json();
                return { ...p, ...d.poliza, participantes: d.participantes };
              }
            } catch (e) {
              console.error('Error al cargar detalle de póliza:', e);
            }
            return p;
          })
        );
        setPolizas(detailed);
      } catch (err) {
        console.error('Error al cargar pólizas:', err);
      }
    };
    fetchPolizas();
  }, [id]);

  /* --- Render --- */
  if (loading) return (<><Header /><p style={{textAlign:'center'}}>Cargando perfil… ⏳</p></>);
  if (error) return (<><Header /><p style={{textAlign:'center'}}>⚠️ {error}</p></>);

  const handleEditProfile = () => navigate(`/modify/${id}`);
  const handleEditPoliza = pid => navigate(`/polizas/${pid}/edit`);
  const askDeleteProfile = () => setToDelete({ type: 'profile', id, label: data.nombre });
  const askDeletePoliza = p => setToDelete({ type: 'poliza', id: p.id_poliza, label: p.numero_poliza });
  const cancelDelete = () => setToDelete(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      if (toDelete.type === 'profile') {
        const res = await fetch(`${url}/api/profile/${toDelete.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) navigate('/');
      } else if (toDelete.type === 'poliza') {
        const res = await fetch(`${url}/api/delete/${toDelete.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) setPolizas(prev => prev.filter(p => p.id_poliza !== toDelete.id));
      }
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
        <Title>Perfil de {data.nombre} ID{id}</Title>
        <ProfileInformation
          data={data}
          onEditProfile={handleEditProfile}
          onDeleteProfile={askDeleteProfile}
        />
      </Container>
      <Policies
        polizas={polizas}
        onEditPoliza={handleEditPoliza}
        onDeletePoliza={askDeletePoliza}
      />
      <MessageGenerator profile={data} polizas={polizas} />
      <ConfirmModal
        open={!!toDelete}
        text={
          toDelete
            ? toDelete.type === 'profile'
              ? `¿Eliminar el perfil de "${data.nombre}"? ¡Esta acción no se puede deshacer!`
              : `¿Eliminar la póliza ${toDelete.label}? Esta acción no se puede deshacer.`
            : ''
        }
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
}
