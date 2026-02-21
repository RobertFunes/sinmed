// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Header from '../components/Header';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url.js';
import { apiFetch } from '../helpers/apiFetch';
import MessageGenerator from '../components/MessageGenerator.jsx';
import { Container, Title } from './Profile.styles.jsx';
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
        const res = await apiFetch(`${url}/api/profile/${id}`, {
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

  const handleEditProfile = (target) => {
    if (
      target &&
      typeof target === 'object' &&
      Object.prototype.hasOwnProperty.call(target, 'section') &&
      Object.prototype.hasOwnProperty.call(target, 'field')
    ) {
      navigate(`/modify/${id}`, { state: { editTarget: target } });
    } else {
      navigate(`/modify/${id}`);
    }
  };
  const askDeleteProfile = () => setToDelete({ id, label: data.nombre });
  const cancelDelete = () => setToDelete(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await apiFetch(`${url}/api/profile/${toDelete.id}`, {
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

  const handleHistoriaClinicaSaved = ({ id_consulta, historia_clinica }) => {
    setData((prev) => {
      if (!prev) return prev;
      const consultas = Array.isArray(prev.consultas) ? [...prev.consultas] : [];
      if (!consultas.length) return prev;

      const targetConsultaId = Number(id_consulta);
      let idx = -1;
      if (Number.isInteger(targetConsultaId) && targetConsultaId > 0) {
        idx = consultas.findIndex((it) => Number(it?.id_consulta) === targetConsultaId);
      }
      if (idx < 0) idx = 0;

      consultas[idx] = {
        ...consultas[idx],
        historia_clinica,
      };
      return {
        ...prev,
        consultas,
      };
    });
  };

  return (
    <>
      <Header />
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={view}
            onChange={(_, next) => {
              if (next) setView(next);
            }}
            aria-label="Vista de perfil"
            sx={{
              bgcolor: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 3,
              overflow: 'hidden',
              '& .MuiToggleButton-root': {
                px: 2.5,
                py: 1,
                fontWeight: 800,
                textTransform: 'none',
                color: 'rgba(255,255,255,0.82)',
                borderColor: 'rgba(255,255,255,0.12)',
              },
            }}
          >
            <ToggleButton
              value="perfil"
              aria-label="Modo lectura de perfil"
              sx={{
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: Palette.dark,
                },
              }}
            >
              Modo lectura de perfil
            </ToggleButton>
            <ToggleButton
              value="ia"
              aria-label="Modo inteligencia artificial"
              sx={{
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: Palette.primary,
                },
              }}
            >
              Modo inteligencia artificial
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
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
      {view === 'ia' ? (
        <MessageGenerator
          profile={data}
          profileId={id}
          onHistoriaClinicaSaved={handleHistoriaClinicaSaved}
        />
      ) : null}

      <ConfirmModal
        open={!!toDelete}
        text={toDelete ? `Eliminar el perfil de "${data.nombre}"? ¡Esta acción no se puede deshacer!` : ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
} 

