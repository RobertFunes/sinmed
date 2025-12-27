// src/components/MessageGenerator.jsx
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FaArrowRight,
  FaCommentDots,
  FaEnvelope,
  FaMagic,
  FaMobileAlt,
  FaPenNib,
  FaWhatsapp,
} from 'react-icons/fa';
// Recupera la URL base desde helper/url.js
import { url } from '../helpers/url.js';
// Estilos
import {
  Container,
  InfoBar,
  SummaryButtonsRow,
  FieldRow,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  ResultArea,
  WhatsAppButton,
} from './MessageGenerator.styles.jsx';

export default function MessageGenerator({ profile = {} }) {
  // Límites IA
  const [limits, setLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(true);

  /* ------ Formulario ------ */
  const [phone, setPhone]         = useState(profile.telefono_movil || '');
  const [tone, setTone]           = useState('Amigable');
  const [content, setContent]     = useState('');
  const [generated, setGenerated] = useState('');
  const [loading, setLoading]     = useState(false);
  // Resumen IA
  const [summaryPrompt, setSummaryPrompt] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Cargar límites IA (silencioso)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/limits`, { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        setLimits(json);
      } catch {
        /* ignore */
      } finally {
        setLimitsLoading(false);
      }
    })();
  }, []);

  /* ------ Contexto (perfil + pólizas) y prompt minimalista ------ */
  // Eliminado contexto de pólizas: ahora solo usamos datos del paciente

  const policyContext = useMemo(() => [], []);
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
  const handleOpenWhatsAppWeb = () => {
    const numberRaw = phone || profile.telefono_movil || '';
    const messageRaw = (generated || content || '').trim();
    const digits = numberRaw.replace(/\D/g, '');
    if (!digits) {
      alert('Por favor captura un número de teléfono válido.');
      return;
    }
    if (!messageRaw) {
      alert('No hay mensaje para enviar.');
      return;
    }
    const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(messageRaw)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };
  // Generar resumen con IA (mismo endpoint que el mensaje)
  const handleGenerateSummary = async (promptOverride) => {
    const rawPrompt = typeof promptOverride === 'string' ? promptOverride : summaryPrompt;
    const userPrompt = String(rawPrompt || '').trim();
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
      setSummaryResult(respuesta || '');
      setLimits((prev) => {
        if (!prev || !prev.gemini) return prev;
        const used = (prev.gemini.used || 0) + 1;
        const limit = prev.gemini.limit || 0;
        return {
          ...prev,
          gemini: {
            ...prev.gemini,
            used,
            remaining: Math.max(0, limit - used),
          },
        };
      });
    } catch (err) {
      alert(err.message || 'Error inesperado');
    } finally {
      setSummaryLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    if (!text) return null;

    const formatInlineBold = (segment) => {
      const parts = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let last = 0;
      let m;
      let k = 0;
      while ((m = boldRegex.exec(segment)) !== null) {
        if (m.index > last) {
          parts.push(
            <span key={`t-${k++}`}>{segment.slice(last, m.index)}</span>
          );
        }
        parts.push(
          <strong key={`b-${k++}`} style={{ fontSize: '1.05em' }}>
            {m[1]}
          </strong>
        );
        last = boldRegex.lastIndex;
      }
      if (last < segment.length) {
        parts.push(<span key={`t-${k++}`}>{segment.slice(last)}</span>);
      }
      return parts;
    };

    const lines = text.split(/\r?\n/);
    const elements = [];
    let bullets = [];
    let key = 0;

    const flushBullets = () => {
      if (!bullets.length) return;
      elements.push(
        <ul
          key={`ul-${key++}`}
          style={{ paddingLeft: '1.2rem', margin: '0.35rem 0' }}
        >
          {bullets}
        </ul>
      );
      bullets = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      const bulletMatch = trimmed.match(/^\*\s+(.*)$/);
      if (bulletMatch) {
        bullets.push(
          <li key={`li-${key++}`} style={{ marginBottom: '0.15rem' }}>
            {formatInlineBold(bulletMatch[1])}
          </li>
        );
        return;
      }
      flushBullets();
      if (trimmed.length === 0) {
        elements.push(<br key={`br-${key++}`} />);
        return;
      }
      elements.push(
        <div key={`line-${key++}`}>{formatInlineBold(line)}</div>
      );
    });
    flushBullets();

    return elements;
  };

  /* ------ Petición a /ia/gemini ------ */
  const handleGenerate = async () => {
    setLoading(true);
    setGenerated('');
    try {
      const res  = await fetch(`${url}/ia/gemini`, {
        method : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error('Error al invocar la IA');
      const { respuesta } = await res.json();
      setGenerated(respuesta || 'Sin respuesta de la IA');
      setLimits((prev) => {
        if (!prev || !prev.gemini) return prev;
        const used = (prev.gemini.used || 0) + 1;
        const limit = prev.gemini.limit || 0;
        return {
          ...prev,
          gemini: {
            ...prev.gemini,
            used,
            remaining: Math.max(0, limit - used),
          },
        };
      });
    } catch (err) {
      alert(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };
  /* ------ Render ------ */
  return (
    <>
      <Container>
        {/* Info de uso IA (discreta) */}
        {!limitsLoading && limits && limits.ok && (
          <InfoBar>
            <span>• IA texto: {limits.gemini.used}/{limits.gemini.limit}</span>
            <span>• Reseteo: {String(limits.gemini.resetAt || '').slice(0,10)}</span>
          </InfoBar>
        )}

        

        {/* Resumen IA */}
        <FieldRow>
          <Label>Generar resumen, consultar con IA</Label>
          <SummaryButtonsRow>
            <Button
              type="button"
              disabled={summaryLoading}
              onClick={() =>
                handleGenerateSummary(
                  'Haz un resumen clínico general de este paciente en un máximo de 3 párrafos. Enfatiza diagnósticos principales, comorbilidades, tratamiento actual, antecedentes relevantes y factores de riesgo más importantes. Usa lenguaje para profesionales de salud.'
                )
              }
            >
              Resumen general
            </Button>
            <Button
              type="button"
              disabled={summaryLoading}
              onClick={() =>
                handleGenerateSummary(
                  'Resume la última consulta de este paciente en 5 puntos claros: 1) motivo de consulta, 2) hallazgos relevantes, 3) diagnóstico o impresión clínica principal, 4) tratamiento o indicaciones que se dieron y 5) recomendaciones o plan de seguimiento. Usa lenguaje pensado para otro profesional de salud.'
                )
              }
            >
              Resumen de la última consulta
            </Button>
            <Button
              type="button"
              disabled={summaryLoading}
              onClick={() =>
                handleGenerateSummary(
                  'Con base en este perfil, identifica los principales riesgos de salud y banderas rojas. Explica en forma de lista: 1) riesgos clave, 2) qué habría que vigilar de cerca y 3) qué signos o situaciones deberían considerarse alerta para atención inmediata. Usa un lenguaje claro y directo para profesionales de salud.'
                )
              }
            >
              Riesgos y alertas
            </Button>
            <Button
              type="button"
              disabled={summaryLoading}
              onClick={() =>
                handleGenerateSummary(
                  'Considerando el historial completo de este paciente, resume en una sola vista todas las consultas registradas: principales motivos de consulta, diagnósticos, tratamientos indicados, cambios relevantes en la evolución y eventos importantes. Presenta el resumen pensado para un médico que necesita ponerse al día rápido con el caso.'
                )
              }
            >
              Resumen de todas las consultas
            </Button>
          </SummaryButtonsRow>
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
            <ResultArea>
              <p>{renderFormattedText(summaryResult)}</p>
            </ResultArea>
          </FieldRow>
        ) : null}
        <FieldRow>
          <Label>
            <FaMobileAlt aria-hidden="true" focusable="false" />
            Número telefónico
          </Label>
          <Input
            type="tel"
            value={phone}
            placeholder="+52 55 1234 5678"
            onChange={e => setPhone(e.target.value)}
          />
        </FieldRow>

        {/* Tono */}
        <FieldRow>
          <Label>
            <FaCommentDots aria-hidden="true" focusable="false" />
            Tono
          </Label>
          <Select value={tone} onChange={e => setTone(e.target.value)}>
            <option value="Amigable">Amigable</option>
            <option value="Profesional">Profesional</option>
            <option value="Serio">Serio</option>
            <option value="Urgente">Urgente</option>
            <option value="Empático">Empático</option>
            <option value="Resolutivo">Resolutivo</option>
            <option value="Celebratorio">Celebratorio</option>
            <option value="Recordatorio">Recordatorio</option>
            <option value="Directo">Directo</option>
            <option value="Prudente">Prudente</option>
          </Select>
        </FieldRow>

        {/* Contenido */}
        <FieldRow>
          <Label>
            <FaPenNib aria-hidden="true" focusable="false" />
            Tema / objetivo / Instrucción
          </Label>
          <TextArea
            rows={4}
            value={content}
            placeholder="Describe aquí el mensaje, la instrucción para generar una imagen o su objetivo…"
            onChange={e => setContent(e.target.value)}
          />
        </FieldRow>

        {/* Botón */}
        <section className="buttons">
          <Button disabled={loading} onClick={handleGenerate}>
            {loading ? 'Generando…' : (
              <>
                <FaMagic aria-hidden="true" focusable="false" />
                Generar mensaje
              </>
            )}
          </Button>
        </section>
        <FieldRow>
          <Label>
            <FaEnvelope aria-hidden="true" focusable="false" />
            Mensaje
          </Label>
          <TextArea
            rows={15}
            value={generated}
            placeholder="Aquí aparecerá el mensaje que se enviará…"
            onChange={e => setGenerated(e.target.value)}
          />
        </FieldRow>
        
        {/* Errores se notifican con alert; no render persistente */}
        {generated && (
          <ResultArea>
            <strong>
              <FaArrowRight aria-hidden="true" focusable="false" /> Mensaje final:
            </strong>
            <p>{renderFormattedText(generated)}</p>
          </ResultArea>
        )}
        <section className="buttons">
          <WhatsAppButton type="button" onClick={handleOpenWhatsAppWeb}>
            <FaWhatsapp size={18} /> Enviar por whats web
          </WhatsAppButton>
        </section>
      </Container>
    </>
  );
}

MessageGenerator.propTypes = {
  profile: PropTypes.object,
};




