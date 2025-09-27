// src/components/MessageGenerator.jsx
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaWhatsapp } from 'react-icons/fa'; 
// 🌐 Recupera la URL base desde helper/url.js
import { url } from '../helpers/url.js';
import ConfirmModal from './ConfirmModal.jsx';
// 🖌️  Estilos: los crearás en MessageGenerator.styles.jsx en el siguiente paso
import {
  Container,
  WhatsappBubble,
  FieldRow,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  ResultArea,
  LoadingSpinner,
  WhatsAppButton,
  ModeSwitch,
  ModeCheckbox ,
  ModeSlider ,

} from './MessageGenerator.styles.jsx';
// ⬆️ justo después de los imports
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // "data:image/png;base64,AAAA..."
    reader.onerror   = reject;
    reader.readAsDataURL(blob);
  });

export default function MessageGenerator({ profile = {} }) {
  /* ------ Estado de disponibilidad del servicio ------ */
  const [serviceReady, setServiceReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [checking, setChecking] = useState(true);

  /* ------ Formulario ------ */
  const [phone, setPhone]         = useState(profile.telefono_movil || '');
  const [tone, setTone]           = useState('Amigable');
  const [content, setContent]     = useState('');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [imageSrc, setImageSrc]     = useState('');   // lo que <img> mostrará
  const [imageB64, setImageB64]     = useState('');   // para mandarla por WhatsApp
  const [imgLoading, setImgLoading] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [mode, setMode] = useState('text');   // 'texto' | 'imagen'
  const [confirmSendImg, setConfirmSendImg] = useState(false);
  // Resumen IA
  const [summaryPrompt, setSummaryPrompt] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  /* ------ Comprobación del endpoint /what/status ------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/whats/status`, {
          method: 'GET',
          credentials: 'include' // también puede ser 'same-origin'
        });
        const json = await res.json();
        setServiceReady(json.isAuth === true);
        setStatusMsg(json.message || '');
      } catch (err) {
        console.error('❌ Error al verificar /what/status:', err);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  /* ------ Contexto (perfil + pólizas) y prompt minimalista ------ */
  // Eliminado contexto de pólizas: ahora solo usamos datos del paciente

  const policyContext = [];
  const prompt = useMemo(() => {
    const datosPerfil = JSON.stringify(profile || {}, null, 2);
    const datosPolizas = JSON.stringify(policyContext || [], null, 2);
    const objetivo = String(content || '').trim() || 'N/D';
    const tono = String(tone || 'Amigable');

    return `Toma el perfil del cliente y su contexto de pólizas para redactar un mensaje listo para WhatsApp.

Perfil del cliente:
${datosPerfil}

Contexto de pólizas (si hay):
${datosPolizas}

Objetivo del mensaje:
${objetivo}

Instrucción: Escribe el mensaje final en tono ${tono}, sin formato Markdown ni viñetas. Devuelve solo el texto del mensaje listo para enviar.`.trim();
  }, [profile, policyContext, tone, content]);
  const handleSendWhatsApp = async () => {
    setLoading(true);
    setError(null);
    try {
      /* payload que tu Express entiende */
      const res = await fetch(`${url}/whats/send`, {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          number : phone || profile.telefono_movil,      // número limpio
          message: generated.trim() || content.trim(),   // mensaje final
        }),
      });
      if (!res.ok) throw new Error('🚧 No se pudo enviar el WhatsApp');

      alert('✅ Mensaje enviado por WhatsApp');
    } catch (err) {
      alert(`❌ ${err.message || 'Error inesperado'}`);
    } finally {
      setLoading(false);
    }
  };
  const askConfirmSendImg = () => setConfirmSendImg(true);
  const askConfirmSend = () => setConfirmSend(true);
  const cancelConfirmSend = () => setConfirmSend(false);
  const confirmSendWhatsApp = () => {
    setConfirmSend(false);
    handleSendWhatsApp();
  };  
  const cancelConfirmSendImg = () => setConfirmSendImg(false);
  const confirmSendImageWhatsApp = () => {
    setConfirmSendImg(false);
    handleSendImageWhatsApp();
  };
  // Generar resumen con IA (mismo endpoint que el mensaje)
  const handleGenerateSummary = async () => {
    const userPrompt = String(summaryPrompt || '').trim();
    if (!userPrompt) return;
    const datosPerfil = JSON.stringify(profile || {}, null, 2);
    const fullPrompt = `Toma el siguiente perfil y ${userPrompt}. Devuelve solo el texto, sin Markdown.\n\nPerfil del cliente (JSON):\n${datosPerfil}`;
    setSummaryLoading(true);
    setSummaryResult('');
    try {
      const res = await fetch(`${url}/ia/gemini`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!res.ok) throw new Error('Error al invocar la IA');
      const { respuesta } = await res.json();
      setSummaryResult((respuesta || '').replace(/\*\*/g, '*'));
    } catch (err) {
      alert(`⚠️ ${err.message || 'Error inesperado'}`);
    } finally {
      setSummaryLoading(false);
    }
  };
  const handleGenerateImage = async () => {
    setImgLoading(true);
    setError(null);
    setImageSrc('');
    setImageB64('');

    try {
      const res = await fetch(`${url}/ia/image`, {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt: content })
      });
      if (!res.ok) throw new Error('😓 Error al generar la imagen');

      /* ────────────────────────────────────
         Backend manda  «Content‑Type: image/png»
      ──────────────────────────────────── */
      const blob   = await res.blob();            // PNG crudo
      setImageSrc(URL.createObjectURL(blob));

      /* 👉 Base‑64 (por si la quieres mandar luego) */
      const dataUrl = await blobToBase64(blob);   // 👈 seguro, asíncrono
      setImageB64(dataUrl);  
    } catch (err) {
      alert(`❌ ${err.message || 'Error inesperado'}`);
    } finally {
      setImgLoading(false);
    }
  };

  const handleSendImageWhatsApp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${url}/whats/send-image`, {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          number  : phone || profile.telefono_movil,
          imageB64: imageB64          // 👈 mandamos el base‑64
        })
      });
      if (!res.ok) throw new Error('🚧 No se pudo enviar la imagen');
      alert('✅ Imagen enviada por WhatsApp');
    } catch (err) {
      alert(`❌ ${err.message || 'Error inesperado'}`);
    } finally {
      setLoading(false);
    }
  };
  /* ------ Petición a /ia/gemini ------ */
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerated('');
    try {
      const res  = await fetch(`${url}/ia/gemini`, {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('😓 Error al invocar la IA');
      const { respuesta } = await res.json();
      const clean = (respuesta || '🤖 Sin respuesta de la IA').replace(/\*\*/g, '*');
      setGenerated(clean);
    } catch (err) {
      alert(`❌ ${err.message || 'Error inesperado'}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    return () => {
      if (imageSrc.startsWith('blob:')) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);
  /* ------ Render ------ */
  if (checking) {
    return (
      <Container>
        <LoadingSpinner>⏳ Comprobando servicio…</LoadingSpinner>
      </Container>
    );
  }

  if (!serviceReady) {
    return (
      <Container>
        <WhatsappBubble>{statusMsg || '❌ Escanea el código QR'}</WhatsappBubble>
      </Container>
    );
  }

  return (
    <>
      <Container>
        
        <h1>Interactuar con {profile.nombre}</h1>
        {/* Resumen IA */}
        <FieldRow>
          <Label>Generar resumen, consultar con IA</Label>
          <Input
            type="text"
            value={summaryPrompt}
            placeholder="Ej: Resume el perfil en 5 puntos claros"
            onChange={(e) => setSummaryPrompt(e.target.value)}
          />
          <div className="buttons">
            <Button disabled={summaryLoading || !summaryPrompt.trim()} onClick={handleGenerateSummary}>
              {summaryLoading ? 'Generando…' : 'Generar'}
            </Button>
          </div>
        </FieldRow>
        {summaryResult ? (
          <FieldRow>
            <Label>Resultado</Label>
            <TextArea rows={10} value={summaryResult} onChange={(e) => setSummaryResult(e.target.value)} />
          </FieldRow>
        ) : null}

        <FieldRow>
          <Label>Modo: {mode === 'text' ? 'Texto 💬' : 'Imagen 🖼️'}</Label>
          <ModeSwitch>
            <ModeCheckbox
              type="checkbox"
              checked={mode === 'image'}
              onChange={e => setMode(e.target.checked ? 'image' : 'text')}
            />
            <ModeSlider />
          </ModeSwitch>
        </FieldRow>
        <FieldRow>
          <Label>Número telefónico 📱</Label>
          <Input
            type="tel"
            value={phone}
            placeholder="+52 55 1234 5678"
            onChange={e => setPhone(e.target.value)}
          />
        </FieldRow>

        {/* Tono */}
        {mode === 'text' && (<>
          <FieldRow>
          <Label>Tono 🗣️</Label>
          <Select value={tone} onChange={e => setTone(e.target.value)}>
            <option value="Amigable">Amigable 😊</option>
            <option value="Profesional">Profesional 🧐</option>
            <option value="Serio">Serio 😐</option>
            <option value="Urgente">Urgente ⚠️</option>
            <option value="Empático">Empático 🤗</option>
            <option value="Resolutivo">Resolutivo 🔧</option>
            <option value="Celebratorio">Celebratorio 🎉</option>
            <option value="Recordatorio">Recordatorio ⏰</option>
            <option value="Directo">Directo ➡️ </option>
            <option value="Prudente">Prudente 🦉</option>
          </Select>
        </FieldRow>
        
        
        </>)}
        

        {/* Contenido */}
        <FieldRow>
          <Label>Tema / objetivo / Instrucción ✍️</Label>
          <TextArea
            rows={4}
            value={content}
            placeholder="Describe aquí el mensaje, la instrucción para generar una imagen o su objetivo…"
            onChange={e => setContent(e.target.value)}
          />
        </FieldRow>

        {/* Botón */}
        <section className="buttons">
          {mode === 'text' && (<>
            <Button disabled={loading || !content.trim()} onClick={handleGenerate}>
            {loading ? 'Generando…' : 'Generar mensaje ✨💬'}
            </Button>
          </>)}
          {mode === 'image' && (<>
            <Button
              disabled={imgLoading || !content.trim()}
              onClick={handleGenerateImage}
            >
              {imgLoading ? 'Generando imagen…' : 'Generar imagen ✨🖼️'}
            </Button>
          </>)}
          
        </section>
        {mode === 'text' && (<>
          <FieldRow>
          
            <Label>Mensaje ✉️</Label>
            <TextArea
              rows={15}
              value={generated}
              placeholder="Aquí aparecerá el mensaje que se enviará…"
              onChange={e => setGenerated(e.target.value)}
            />
          </FieldRow>
        </>)}
        
        {/* Errores se notifican con alert; no render persistente */}
        {generated && mode === 'text' && (
          <ResultArea>
            <strong>➡️Mensaje Final:</strong>
            <p>{generated}</p>
          </ResultArea>
        )}
        {mode === 'text' && (
          <WhatsAppButton
            disabled={loading || !generated.trim()}
            onClick={askConfirmSend}
          >
            <FaWhatsapp size={18} /> Enviar por WhatsApp
          </WhatsAppButton>
        )}
        {mode === 'image' && (<>
          <FieldRow>
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Generada"
              />
            )}
          </FieldRow>
        </>)}
        {imageSrc && mode === 'image' && (
          <WhatsAppButton disabled={loading} onClick={askConfirmSendImg}>
            <FaWhatsapp size={18} /> Enviar imagen por WhatsApp
          </WhatsAppButton>
        )}

        {/* Errores se notifican con alert; no render persistente */}
        <ConfirmModal
          open={confirmSend}
          text="¿Enviar el mensaje por WhatsApp?"
          confirmLabel="Enviar"
          onCancel={cancelConfirmSend}
          onConfirm={confirmSendWhatsApp}
        />
        <ConfirmModal
          open={confirmSendImg}
          text="¿Enviar la imagen por WhatsApp?"
          confirmLabel="Enviar"
          onCancel={cancelConfirmSendImg}
          onConfirm={confirmSendImageWhatsApp}
        />
      </Container>
    </>
  );
}

MessageGenerator.propTypes = {
  profile: PropTypes.object,
};




