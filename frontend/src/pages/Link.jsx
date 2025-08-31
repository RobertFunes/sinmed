// Link.jsx — sin polling; estado manual; QR solo por SSE
import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { Container, StatusBox, Message, RetryBtn } from './Link.styles';
import { FaSyncAlt, FaQrcode } from 'react-icons/fa';
import { url } from '../helpers/url';
import QRCode from 'react-qr-code';

const traducirValor = (valor) => {
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (valor === null || typeof valor === 'undefined') return 'No disponible';
  return valor;
};

function formateaFecha(val) {
  try {
    if (!val) return 'No iniciada';
    const n = Number(val);
    const d = Number.isFinite(n) ? new Date(n) : new Date(val);
    const ok = !isNaN(d.getTime());
    return ok ? d.toLocaleString() : String(val);
  } catch {
    return String(val);
  }
}

const Link = () => {
  // Estadísticas
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // SSE y QR
  const esRef = useRef(null);       // EventSource activo (si existe)
  const [sseOpen, setSseOpen] = useState(false); // lock de SSE
  const [qrValue, setQrValue] = useState(null);  // valor del QR proveniente SOLO de SSE
  const [qrMsg, setQrMsg] = useState('');        // mensajes del flujo QR

  // Carga inicial de estadísticas (una vez)
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/whats/status`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(); // cargar al entrar, sin intervalos
    return () => {
      // Limpieza al desmontar: cerrar SSE y limpiar QR
      if (esRef.current) {
        try { esRef.current.close(); } catch {}
        esRef.current = null;
      }
      setQrValue(null);
      setSseOpen(false);
    };
  }, []);

  // Paso 1: Kick JSON
  const kickQrJson = async () => {
    // Si ya hay un SSE abierto, no vuelvas a abrir
    if (sseOpen || esRef.current) return;

    setQrMsg('Verificando estado del QR… 🔎');
    setQrValue(null); // Nunca mostrar un QR que no provenga del SSE

    try {
      const res = await fetch(`${url}/whats/qr`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include'
      });

      // Si el servidor usa 409 aquí (raro, pero por si las dudas)
      if (!res.ok) {
        if (res.status === 409) {
          setQrMsg('Aún no listo ⏳');
          return;
        }
        setQrMsg('No disponible ❌');
        return;
      }

      const data = await res.json();
      const state = data?.state;
      const hasQr = !!data?.qr;

      if (state === 'QR_READY' && hasQr) {
        // Solo entonces pasamos al SSE (Paso 2)
        openQrSse();
      } else if (state === 'QR_READY' && !hasQr) {
        setQrMsg('Aún no listo ⏳');
      } else if (state === 'STOPPED' || state === 'FAILED') {
        setQrMsg('No disponible ❌');
      } else {
        setQrMsg('Aún no listo ⏳');
      }
    } catch (err) {
      console.error('Kick JSON error:', err);
      setQrMsg('No disponible ❌');
    }
  };

  // Paso 2: Abrir SSE
  // reemplaza tu openQrSse por esta versión
const openQrSse = () => {
  if (sseOpen || esRef.current) return;

  const sseUrl = `${url}/whats/qr`; // idealmente /whats/qr/stream
  const es = new EventSource(sseUrl, { withCredentials: true });
  esRef.current = es;
  setSseOpen(true);
  setQrMsg('Mostrando QR en vivo 🟢');

  let everGotData = false;
  const startedAt = Date.now();

  const handlePayload = (payload) => {
    try {
      if (!payload) return;
      let text = String(payload);
      // algunos servidores envían JSON en data:
      if (text.trim().startsWith('{')) {
        const obj = JSON.parse(text);
        if (obj && typeof obj.qr !== 'undefined') {
          if (obj.qr) {
            setQrValue(String(obj.qr));
            everGotData = true;
          } else {
            setQrValue(null);
          }
          return;
        }
      }
      // texto plano con el QR
      setQrValue(text);
      everGotData = true;
    } catch (e) {
      console.warn('No pude parsear el payload del SSE:', e, payload);
    }
  };

  // 1) eventos sin nombre (default)
  es.onmessage = (ev) => {
    console.info('[SSE message]', ev.data);
    handlePayload(ev.data);
  };

  // 2) si el backend usa event: qr
  es.addEventListener('qr', (ev) => {
    console.info('[SSE qr]', ev.data);
    handlePayload(ev.data);
  });

  // 3) limpia QR si mandan un evento "clear"
  es.addEventListener('clear', () => {
    console.info('[SSE clear]');
    setQrValue(null);
  });

  es.onopen = () => {
    console.info('[SSE open]', es.readyState);
  };

  es.onerror = () => {
    console.warn('[SSE error]');
    setQrValue(null);
    try { es.close(); } catch {}
    esRef.current = null;
    setSseOpen(false);

    const elapsed = Date.now() - startedAt;
    if (!everGotData && elapsed < 1200) setQrMsg('Aún no listo ⏳');
    else setQrMsg('Canal cerrado 🔒');
  };

  // 4) si en 12s no llegó nada, corta y muestra "no listo"
  setTimeout(() => {
    if (!everGotData && esRef.current === es) {
      console.warn('[SSE timeout sin datos]');
      try { es.close(); } catch {}
      esRef.current = null;
      setSseOpen(false);
      setQrMsg('Aún no listo ⏳');
    }
  }, 12000);
};


  return (
    <>
      <Header />
      <Container>

        {/* Estadísticas */}
        {loading && <Message>Cargando estadísticas… ⏳</Message>}

        {!loading && stats && (
          <StatusBox>
            <p><strong>OK:</strong> {traducirValor(stats.ok)}</p>
            <p><strong>Estado:</strong> {stats.state}</p>
            <p><strong>Tiene cliente:</strong> {traducirValor(stats.hasClient)}</p>
            <p><strong>Autenticado:</strong> {traducirValor(stats.isAuth)}</p>
            <p><strong>QR:</strong> {stats.qr ? 'Disponible' : 'Aún no disponible'}</p>
            <p><strong>Hora de inicio:</strong> {formateaFecha(stats.startedAt)}</p>
            {!loading && !stats && (
              <Message>No se pudieron cargar las estadísticas ❌</Message>
            )}
            <RetryBtn onClick={fetchStats} disabled={loading}>
              <FaSyncAlt /> Refrescar estado
            </RetryBtn>
          </StatusBox>
        )}
        <StatusBox>
         {qrMsg && <Message>{qrMsg}</Message>}
          {qrValue && (
            <div style={{ background: '#fff', padding: 12, display: 'inline-block', borderRadius: 8 }}>
              <QRCode value={qrValue} size={220} />
            </div>
          )}
          <RetryBtn onClick={kickQrJson} disabled={sseOpen}>
            <FaQrcode /> Pedir código QR
          </RetryBtn>
        </StatusBox>
      

        {/* Acciones: visibles siempre */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
          

          
        </div>

        {/* Estado del flujo QR y render del QR (solo desde SSE) */}
        <div style={{ marginTop: '16px' }}>
          
        </div>

      </Container>
    </>
  );
};

export default Link;
