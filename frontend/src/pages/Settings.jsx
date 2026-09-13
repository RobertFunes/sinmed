import { useEffect, useMemo, useState } from 'react';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/600.css';
import {
  FaBrain,
  FaBell,
  FaCalendarPlus,
  FaCalendarTimes,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaFileAlt,
  FaInfoCircle,
  FaLink,
  FaLock,
  FaLockOpen,
  FaMagic,
  FaPaperPlane,
  FaSignInAlt,
  FaShieldAlt,
  FaTelegramPlane,
  FaUnlink,
  FaUser,
  FaUserEdit,
  FaUserPlus,
  FaUserTimes,
} from 'react-icons/fa';
import Header from '../components/Header.jsx';
import { apiFetch } from '../helpers/apiFetch';
import { url } from '../helpers/url.js';
import {
  AiCard,
  AiHeader,
  AiHero,
  AiHeroContent,
  AiHeroIcon,
  AiIntro,
  AiUsageCopy,
  AiUsageIcon,
  AiUsageLabel,
  AiUsagePanel,
  AiUsageStat,
  AiUsageValue,
  Card,
  Help,
  Label,
  ModeContent,
  ModeBadge,
  ModeDescription,
  ModeIndicator,
  ModeLabel,
  ModeOption,
  ModeRadio,
  ModeSwitch,
  ModeUsage,
  ModeVisual,
  InfoButton,
  Instructions,
  InfoModal,
  ModalClose,
  ModalHeader,
  ModalOverlay,
  Page,
  SectionHeaderTitle,
  TelegramButton,
  TelegramCard,
  TelegramCheckIcon,
  TelegramCheckLabel,
  TelegramCheckText,
  TelegramFieldset,
  TelegramHero,
  TelegramHeroContent,
  TelegramHeroIcon,
  TelegramHeader,
  TelegramIntro,
  TelegramLegend,
  TelegramLinkBox,
  TelegramLinkTitle,
  TelegramLinkUrl,
  TelegramLockCopy,
  TelegramLockHelp,
  TelegramLockIcon,
  TelegramLockStatus,
  TelegramLockToggle,
  TelegramLockToggleThumb,
  TelegramSectionHeading,
  TelegramSection,
  TelegramStatusCopy,
  TelegramStatusIcon,
  TelegramStatusItem,
  TelegramStatusLabel,
  TelegramStatusPanel,
  TelegramStatusValue,
  TelegramTokenPanel,
  TelegramActions,
  TelegramInput,
  Toast,
  ToastClose,
  ToastIcon,
  ToastText,
  Title,
} from './Settings.styles.jsx';

const PREFERENCE_LABELS = [
  ['login', 'Inicio de sesión exitoso', FaSignInAlt],
  ['profile_create', 'Agregar perfiles', FaUserPlus],
  ['profile_update', 'Modificar perfiles', FaUserEdit],
  ['profile_delete', 'Eliminar perfiles', FaUserTimes],
  ['appointment_create', 'Agregar citas', FaCalendarPlus],
  ['appointment_delete', 'Eliminar citas', FaCalendarTimes],
];

const AI_MODE_OPTIONS = [
  {
    value: 'normal',
    label: 'Modo Normal',
    usage: 'Uso 1X',
    description: 'Ideal para tareas cotidianas y respuestas rápidas.',
    icon: FaFileAlt,
  },
  {
    value: 'augmented',
    label: 'Inteligencia Aumentada',
    usage: 'Uso 1.25X',
    description: 'Respuestas más profundas, análisis más completos y mejores resúmenes.',
    icon: FaBrain,
    recommended: true,
  },
];

const AI_HELP_ITEMS = [
  ['Modo Normal', 'Es el modo estándar de SINMED y tiene un consumo de 1X.'],
  ['Inteligencia Aumentada', 'Es el modo de mayor capacidad disponible y tiene un consumo de 1.25X.'],
  ['Aplicar el cambio', 'Selecciona una opción para guardarla; el indicador muestra el modo activo.'],
];

const TELEGRAM_SETUP_STEPS = [
  'Crea un bot en Telegram con @BotFather usando el comando /newbot.',
  'Copia el token que te entregue BotFather.',
  'Pega el token en “Token del bot” y presiona “Guardar configuración”.',
  'Presiona “Vincular Telegram” en SINMED.',
  'Abre el enlace generado, entra al bot y pulsa “Start”.',
  'Regresa a SINMED y presiona “Verificar vinculación”.',
  'Activa las notificaciones deseadas y vuelve a guardar la configuración.',
  'Usa “Enviar prueba” para confirmar que todo funciona.',
];

const emptyState = {
  bot: { configured: false, valid: false, username: null, name: null },
  recipient: { linked: false, username: null, displayName: null, chatIdMasked: null },
  preferences: Object.fromEntries(PREFERENCE_LABELS.map(([key]) => [key, false])),
};

const emptyAiState = {
  mode: 'normal',
  usageMultiplier: 1,
};

const errorMessages = {
  TELEGRAM_BOT_TOKEN_INVALID: 'El token del bot no es válido.',
  TELEGRAM_BOT_REQUIRED: 'Primero guarda un token válido del bot.',
  TELEGRAM_RECIPIENT_REQUIRED: 'Vincula una cuenta de Telegram antes de activar avisos.',
  TELEGRAM_LINK_NOT_FOUND: 'No se encontró un Start nuevo. Abre el enlace del bot y pulsa Start.',
  TELEGRAM_LINK_EXPIRED: 'El enlace expiró. Genera uno nuevo.',
  TELEGRAM_PRIVATE_CHAT_REQUIRED: 'La vinculación solo acepta chats privados.',
  TELEGRAM_NOTIFICATION_FAILED: 'Telegram no pudo enviar el mensaje.',
  INVALID_TELEGRAM_PREFERENCES: 'Las preferencias no son válidas.',
  TELEGRAM_SETTINGS_ERROR: 'No se pudo actualizar la configuración.',
  INVALID_AI_MODE: 'El modo de IA no es válido.',
  AI_SETTINGS_ERROR: 'No se pudo actualizar la configuración de IA.',
  AI_LIMITS_ERROR: 'No se pudo consultar la cuota de IA.',
};

function readableError(code) {
  return errorMessages[code] || 'Ocurrió un error. Intenta de nuevo.';
}

async function readResponse(response, fallbackError = 'TELEGRAM_SETTINGS_ERROR') {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || fallbackError);
  return data;
}

export default function Settings() {
  const [aiState, setAiState] = useState(emptyAiState);
  const [aiLimits, setAiLimits] = useState(null);
  const [state, setState] = useState(emptyState);
  const [token, setToken] = useState('');
  const [tokenUnlocked, setTokenUnlocked] = useState(false);
  const [link, setLink] = useState(null);
  const [toast, setToast] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiLimitsLoading, setAiLimitsLoading] = useState(true);
  const [aiSaving, setAiSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [telegramHelpOpen, setTelegramHelpOpen] = useState(false);
  const [aiHelpOpen, setAiHelpOpen] = useState(false);

  const readyForPreferences = state.bot.valid && state.recipient.linked;
  const hasEnabledPreference = useMemo(
    () => Object.values(state.preferences).some(Boolean),
    [state.preferences],
  );

  const showToast = (content, error = false) => {
    setToast(error ? { error: content } : { text: content });
  };

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    apiFetch(`${url}/api/settings/telegram`)
      .then(readResponse)
      .then((data) => {
        if (mounted) {
          const nextState = { ...emptyState, ...data, preferences: { ...emptyState.preferences, ...(data.preferences || {}) } };
          setState(nextState);
          setTokenUnlocked(!nextState.bot.configured);
        }
      })
      .catch((error) => {
        if (mounted) showToast(readableError(error.message), true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiFetch(`${url}/api/settings/ai`)
      .then((response) => readResponse(response, 'AI_SETTINGS_ERROR'))
      .then((data) => {
        if (mounted) {
          setAiState({
            mode: data.mode === 'augmented' ? 'augmented' : 'normal',
            usageMultiplier: Number(data.usageMultiplier) === 1.25 ? 1.25 : 1,
          });
        }
      })
      .catch((error) => {
        if (mounted) showToast(readableError(error.message), true);
      })
      .finally(() => {
        if (mounted) setAiLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiFetch(`${url}/api/limits`)
      .then((response) => readResponse(response, 'AI_LIMITS_ERROR'))
      .then((data) => {
        if (mounted && data.gemini) setAiLimits(data.gemini);
      })
      .catch((error) => {
        if (mounted) showToast(readableError(error.message), true);
      })
      .finally(() => {
        if (mounted) setAiLimitsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!telegramHelpOpen && !aiHelpOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setTelegramHelpOpen(false);
        setAiHelpOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [telegramHelpOpen, aiHelpOpen]);

  const run = async (callback, successMessage) => {
    setBusy(true);
    setToast(null);
    try {
      const data = await callback();
      if (data?.bot || data?.recipient || data?.preferences) {
        setState((previous) => ({ ...previous, ...data, preferences: { ...previous.preferences, ...(data.preferences || {}) } }));
      }
      if (successMessage) showToast(successMessage);
      return data;
    } catch (error) {
      showToast(readableError(error.message), true);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const changeAiMode = async (mode) => {
    if (aiSaving || mode === aiState.mode) return;
    const previous = aiState;
    const option = AI_MODE_OPTIONS.find((item) => item.value === mode);
    setAiSaving(true);
    setToast(null);
    setAiState({
      mode,
      usageMultiplier: option?.value === 'augmented' ? 1.25 : 1,
    });
    try {
      const response = await apiFetch(`${url}/api/settings/ai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await readResponse(response, 'AI_SETTINGS_ERROR');
      setAiState({
        mode: data.mode === 'augmented' ? 'augmented' : 'normal',
        usageMultiplier: Number(data.usageMultiplier) === 1.25 ? 1.25 : 1,
      });
      showToast('Modo de IA actualizado correctamente.');
    } catch (error) {
      setAiState(previous);
      showToast(readableError(error.message), true);
    } finally {
      setAiSaving(false);
    }
  };

  const save = (event) => {
    event.preventDefault();
    run(async () => {
      const response = await apiFetch(`${url}/api/settings/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, preferences: state.preferences }),
      });
      const data = await readResponse(response);
      setToken('');
      setTokenUnlocked(false);
      return data;
    }, 'Cambios guardados correctamente en el servidor.');
  };

  const createLink = () => run(async () => {
    const response = await apiFetch(`${url}/api/settings/telegram/link`, { method: 'POST' });
    const data = await readResponse(response);
    setLink(data);
    return null;
  }, 'Enlace generado correctamente. Ábrelo en Telegram y pulsa Start.');

  const verifyLink = () => run(async () => {
    const response = await apiFetch(`${url}/api/settings/telegram/link/verify`, { method: 'POST' });
    const data = await readResponse(response);
    setLink(null);
    return data;
  }, 'Cuenta de Telegram vinculada correctamente.');

  const sendTest = () => run(async () => {
    const response = await apiFetch(`${url}/api/settings/telegram/test`, { method: 'POST' });
    return readResponse(response);
  }, 'Mensaje de prueba enviado correctamente.');

  const unlink = () => run(async () => {
    const response = await apiFetch(`${url}/api/settings/telegram/recipient`, { method: 'DELETE' });
    setLink(null);
    return readResponse(response);
  }, 'Cuenta desvinculada y avisos desactivados correctamente.');

  const tokenLocked = state.bot.configured && !tokenUnlocked;

  const toggleTokenEditing = () => {
    if (tokenLocked) {
      setTokenUnlocked(true);
      return;
    }

    setToken('');
    setTokenUnlocked(false);
  };

  if (loading) {
    return <><Header /><Page><Title><span className="titleGlass">Configuración<FaCog className="titleIcon" aria-hidden="true" focusable="false" /></span></Title><Card>Cargando…</Card></Page></>;
  }

  return (
    <>
      <Header />
      <Page>
        <Title>
          <span className="titleGlass">
            Configuración
            <FaCog className="titleIcon" aria-hidden="true" focusable="false" />
          </span>
        </Title>

        <AiCard>
          <AiHero>
            <AiHeroIcon aria-hidden="true"><FaBrain /></AiHeroIcon>
            <AiHeroContent>
              <AiHeader>
                <SectionHeaderTitle>Inteligencia Artificial</SectionHeaderTitle>
                <InfoButton
                  type="button"
                  title="Información de Inteligencia Artificial"
                  aria-label="Ver información de Inteligencia Artificial"
                  onClick={() => setAiHelpOpen(true)}
                >
                  <FaInfoCircle aria-hidden="true" />
                </InfoButton>
              </AiHeader>
              <AiIntro>Elige el nivel de inteligencia que utilizará SINMED para generar mensajes y resúmenes.</AiIntro>
            </AiHeroContent>
          </AiHero>
          {aiLimitsLoading ? (
            <Help>Consultando cuota de IA…</Help>
          ) : aiLimits ? (
            <AiUsagePanel aria-live="polite">
              <AiUsageStat>
                <AiUsageIcon aria-hidden="true"><FaFileAlt /></AiUsageIcon>
                <AiUsageCopy>
                  <AiUsageLabel>Mensajes restantes</AiUsageLabel>
                  <AiUsageValue>{aiLimits.remaining}</AiUsageValue>
                </AiUsageCopy>
              </AiUsageStat>
              <AiUsageStat>
                <AiUsageIcon aria-hidden="true"><FaChartLine /></AiUsageIcon>
                <AiUsageCopy>
                  <AiUsageLabel>Uso acumulado</AiUsageLabel>
                  <AiUsageValue>{aiLimits.used}/{aiLimits.limit}</AiUsageValue>
                </AiUsageCopy>
              </AiUsageStat>
            </AiUsagePanel>
          ) : null}
          {aiLoading ? (
            <Help>Cargando modo de IA…</Help>
          ) : (
            <ModeSwitch role="radiogroup" aria-label="Modo de Inteligencia Artificial" aria-busy={aiSaving}>
              {AI_MODE_OPTIONS.map((option) => {
                const selected = aiState.mode === option.value;
                const ModeIcon = option.icon;
                return (
                  <ModeOption key={option.value} $selected={selected}>
                    <ModeRadio
                      type="radio"
                      name="ai-mode"
                      value={option.value}
                      checked={selected}
                      onChange={() => changeAiMode(option.value)}
                      disabled={aiSaving}
                    />
                    <ModeIndicator $selected={selected} aria-hidden="true" />
                    <ModeVisual $selected={selected} aria-hidden="true"><ModeIcon /></ModeVisual>
                    <ModeContent>
                      <ModeLabel>{option.label}</ModeLabel>
                      <ModeUsage>— {option.usage}</ModeUsage>
                      <ModeDescription>{option.description}</ModeDescription>
                    </ModeContent>
                    {option.recommended && (
                      <ModeBadge><FaMagic aria-hidden="true" /> Recomendado</ModeBadge>
                    )}
                  </ModeOption>
                );
              })}
            </ModeSwitch>
          )}
          {aiHelpOpen && (
            <ModalOverlay onClick={() => setAiHelpOpen(false)}>
              <InfoModal
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-help-title"
                onClick={(event) => event.stopPropagation()}
              >
                <ModalHeader>
                  <h2 id="ai-help-title">Información de Inteligencia Artificial</h2>
                  <ModalClose
                    type="button"
                    title="Cerrar información"
                    aria-label="Cerrar información"
                    onClick={() => setAiHelpOpen(false)}
                  >
                    ×
                  </ModalClose>
                </ModalHeader>
                <Instructions as="ul">
                  {AI_HELP_ITEMS.map(([title, description]) => (
                    <li key={title}><strong>{title}:</strong> {description}</li>
                  ))}
                </Instructions>
              </InfoModal>
            </ModalOverlay>
          )}
        </AiCard>

        <TelegramCard>
          <TelegramSection>
            <TelegramHero>
              <TelegramHeroIcon aria-hidden="true"><FaTelegramPlane /></TelegramHeroIcon>
              <TelegramHeroContent>
                <TelegramHeader>
                  <SectionHeaderTitle>Configuración de Telegram</SectionHeaderTitle>
                  <InfoButton
                    type="button"
                    title="Instrucciones de Telegram"
                    aria-label="Ver instrucciones de configuración de Telegram"
                    onClick={() => setTelegramHelpOpen(true)}
                  >
                    <FaInfoCircle aria-hidden="true" />
                  </InfoButton>
                </TelegramHeader>
                <TelegramIntro>Configura para recibir notificaciones de SINMED por Telegram.</TelegramIntro>
              </TelegramHeroContent>
            </TelegramHero>

            <form onSubmit={save}>
              <TelegramTokenPanel>
                <TelegramSectionHeading><FaLink aria-hidden="true" /> Conecta tu bot</TelegramSectionHeading>
                <Label htmlFor="telegram-token">
                  <TelegramInput
                    id="telegram-token"
                    type="password"
                    aria-label="Token del bot"
                    aria-describedby="telegram-token-help"
                    autoComplete="new-password"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    disabled={tokenLocked}
                    placeholder={state.bot.configured ? 'Token guardado (vacío conserva el actual)' : 'Pega aquí el token de BotFather'}
                  />
                  <Help id="telegram-token-help">El token nunca se muestra ni se devuelve. Deja el campo vacío para conservarlo.</Help>
                </Label>
                <TelegramLockCopy>
                  <TelegramLockIcon $unlocked={!tokenLocked} aria-hidden="true">
                    {tokenLocked ? <FaLock /> : <FaLockOpen />}
                  </TelegramLockIcon>
                  <TelegramLockToggle
                    type="button"
                    role="switch"
                    aria-checked={!tokenLocked}
                    aria-label={tokenLocked ? 'Desbloquear edición del token' : 'Bloquear edición del token'}
                    title={tokenLocked ? 'Desbloquear edición del token' : 'Bloquear edición del token'}
                    $unlocked={!tokenLocked}
                    onClick={toggleTokenEditing}
                  >
                    <TelegramLockToggleThumb $unlocked={!tokenLocked} />
                  </TelegramLockToggle>
                  <TelegramLockHelp>
                    <TelegramLockStatus>{tokenLocked ? 'Token protegido' : 'Token editable'}</TelegramLockStatus>
                    {tokenLocked ? 'Activa el switch para reemplazar el token guardado.' : 'El campo está habilitado para introducir o reemplazar el token.'}
                  </TelegramLockHelp>
                </TelegramLockCopy>
              </TelegramTokenPanel>

              <TelegramStatusPanel aria-live="polite">
                <TelegramStatusItem $active={state.bot.valid}>
                  <TelegramStatusIcon $active={state.bot.valid} aria-hidden="true"><FaShieldAlt /></TelegramStatusIcon>
                  <TelegramStatusCopy>
                    <TelegramStatusLabel>Estado del bot</TelegramStatusLabel>
                    <TelegramStatusValue $active={state.bot.valid}>
                      {state.bot.valid ? `Válido${state.bot.username ? ` (@${state.bot.username})` : ''}` : (state.bot.configured ? 'Configurado, pero no válido' : 'Sin configurar')}
                    </TelegramStatusValue>
                  </TelegramStatusCopy>
                </TelegramStatusItem>
                <TelegramStatusItem $active={state.recipient.linked}>
                  <TelegramStatusIcon $active={state.recipient.linked} aria-hidden="true"><FaUser /></TelegramStatusIcon>
                  <TelegramStatusCopy>
                    <TelegramStatusLabel>Cuenta vinculada</TelegramStatusLabel>
                    <TelegramStatusValue $active={state.recipient.linked}>
                      {state.recipient.linked ? `Vinculada${state.recipient.displayName ? ` como ${state.recipient.displayName}` : ''}${state.recipient.chatIdMasked ? ` (${state.recipient.chatIdMasked})` : ''}` : 'Sin vincular'}
                    </TelegramStatusValue>
                  </TelegramStatusCopy>
                </TelegramStatusItem>
              </TelegramStatusPanel>

              <TelegramActions>
                <TelegramButton type="submit" disabled={busy}><FaCheckCircle aria-hidden="true" /> Guardar configuración</TelegramButton>
                <TelegramButton type="button" $secondary onClick={createLink} disabled={busy || !state.bot.valid}><FaLink aria-hidden="true" /> Vincular Telegram</TelegramButton>
                <TelegramButton type="button" $secondary onClick={verifyLink} disabled={busy || !state.bot.valid}><FaCheckCircle aria-hidden="true" /> Verificar vinculación</TelegramButton>
                <TelegramButton type="button" $secondary onClick={sendTest} disabled={busy || !readyForPreferences}><FaPaperPlane aria-hidden="true" /> Enviar prueba</TelegramButton>
                <TelegramButton type="button" $secondary $danger onClick={unlink} disabled={busy || !state.recipient.linked}><FaUnlink aria-hidden="true" /> Desvincular</TelegramButton>
              </TelegramActions>

              {link && (
                <TelegramLinkBox>
                  <TelegramLinkTitle><FaLink aria-hidden="true" /> Enlace de vinculación</TelegramLinkTitle>
                  <div>Válido hasta: {new Date(link.expiresAt).toLocaleString('es-MX')}</div>
                  <a href={link.linkUrl} target="_blank" rel="noreferrer">Abrir enlace de vinculación en Telegram</a>
                  <TelegramLinkUrl>{link.linkUrl}</TelegramLinkUrl>
                  <div><Help>Después de pulsar Start, vuelve aquí y selecciona “Verificar vinculación”.</Help></div>
                </TelegramLinkBox>
              )}

              <TelegramFieldset disabled={!readyForPreferences}>
                <TelegramLegend><FaBell aria-hidden="true" /> Eventos que enviarán avisos</TelegramLegend>
                {!readyForPreferences && <Help>Guarda un bot válido y vincula una cuenta para activar estas opciones.</Help>}
                {PREFERENCE_LABELS.map(([key, label, Icon]) => {
                  const PreferenceIcon = Icon;
                  return (
                    <TelegramCheckLabel key={key} $disabled={!readyForPreferences}>
                      <input
                        type="checkbox"
                        checked={Boolean(state.preferences[key])}
                        onChange={(event) => setState((previous) => ({
                          ...previous,
                          preferences: { ...previous.preferences, [key]: event.target.checked },
                        }))}
                        disabled={!readyForPreferences}
                      />
                      <TelegramCheckIcon $disabled={!readyForPreferences} aria-hidden="true"><PreferenceIcon /></TelegramCheckIcon>
                      <TelegramCheckText>{label}</TelegramCheckText>
                    </TelegramCheckLabel>
                  );
                })}
              </TelegramFieldset>
              {hasEnabledPreference && !readyForPreferences && <Help>Vincula Telegram para poder guardar los avisos.</Help>}
            </form>

            {telegramHelpOpen && (
              <ModalOverlay onClick={() => setTelegramHelpOpen(false)}>
                <InfoModal
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="telegram-help-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <ModalHeader>
                    <h2 id="telegram-help-title">Cómo configurar Telegram</h2>
                    <ModalClose
                      type="button"
                      title="Cerrar instrucciones"
                      aria-label="Cerrar instrucciones"
                      onClick={() => setTelegramHelpOpen(false)}
                    >
                      ×
                    </ModalClose>
                  </ModalHeader>
                  <Instructions>
                    {TELEGRAM_SETUP_STEPS.map((step) => <li key={step}>{step}</li>)}
                  </Instructions>
                </InfoModal>
              </ModalOverlay>
            )}
          </TelegramSection>
        </TelegramCard>
      </Page>
      {toast && (
        <Toast
          $error={Boolean(toast.error)}
          role={toast.error ? 'alert' : 'status'}
          aria-live={toast.error ? 'assertive' : 'polite'}
        >
          <ToastIcon $error={Boolean(toast.error)} aria-hidden="true">{toast.error ? '!' : '✓'}</ToastIcon>
          <ToastText>{toast.error || toast.text}</ToastText>
          <ToastClose
            type="button"
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
            onClick={() => setToast(null)}
          >
            ×
          </ToastClose>
        </Toast>
      )}
    </>
  );
}
