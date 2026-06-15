import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Palette } from '../../helpers/theme';
import {
  Summary,
  TwoColumnRow,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
  SubmitButton,
  ListContainer,
  ItemCard,
  ItemActions,
  DangerButton,
  ButtonLabel,
} from '../../pages/Add.styles';
import { AlergicoContainer, AlergicoOptions, AlergicoOption } from '../../pages/Add.styles';
import {
  FaPlusCircle,
  FaTrash,
  FaBell,
  FaNotesMedical,
  FaClipboardCheck,
  FaDiagnoses,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaCalendarAlt,
  FaCalendarDay,
  FaPills,
  FaFlask,
  FaHeartbeat,
  FaTachometerAlt,
  FaTint,
  FaVial,
} from 'react-icons/fa';
import { EstadoChecklist, EstadoOptionLabel, EstadoCheckbox } from '../../pages/modify.styles';
import ConfirmModal from '../ConfirmModal';

const NestedDetails = styled.details`
  margin-left: 1rem;
`;
const NestedToolbar = styled.div`
  margin-left: 1rem;
`;
const InnerSummary = styled(Summary)`
  background: ${({ $isLatest }) => ($isLatest ? '#d32f2f' : '#f7fbff')};
  border-left: 4px solid ${({ $isLatest }) => ($isLatest ? '#b71c1c' : Palette.primary)};
  border-radius: 4px;
  color: ${({ $isLatest }) => ($isLatest ? '#fff' : Palette.primary)};
`;

const NotesJumpButton = styled(DangerButton)`
  margin-left: 0;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid rgba(79, 149, 157, 0.45);
  border-radius: 6px;
  background: rgba(79, 149, 157, 0.1);
  color: ${Palette.dark};
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(32, 87, 129, 0.08);
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.08s ease, box-shadow 0.16s ease;

  ${ButtonLabel} {
    margin-left: 0;
  }

  &:hover:not(:disabled) {
    background: rgba(79, 149, 157, 0.18);
    border-color: ${Palette.secondary};
    box-shadow: 0 8px 18px rgba(32, 87, 129, 0.12);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid rgba(84, 18, 18, 0.28);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.62;
    cursor: not-allowed;
  }
`;

const SistemaCard = styled(ItemCard)`
  border: 1px solid rgba(65, 94, 114, 0.22);
  border-left: 6px solid ${Palette.primary};
  border-radius: 8px;
  padding: 1rem;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(32, 87, 129, 0.08);
`;

const SistemaHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(65, 94, 114, 0.16);

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

const SistemaIdentity = styled.div`
  min-width: 0;
`;

const SistemaEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${Palette.secondary};
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const SistemaName = styled.div`
  margin-top: 0.3rem;
  color: ${Palette.title};
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
`;

const SistemaInitialNote = styled.div`
  color: ${Palette.title};
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
`;

const SistemaActions = styled(ItemActions)`
  margin-top: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;

  @media (max-width: 760px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const SistemaActionButton = styled(DangerButton)`
  margin-left: 0;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 0.8rem;
  border-radius: 6px;
  white-space: nowrap;

  ${ButtonLabel} {
    margin-left: 0;
  }
`;

const SistemaNotesButton = styled(SistemaActionButton)`
  background: rgba(79, 149, 157, 0.1);
  border-color: rgba(79, 149, 157, 0.35);
  color: ${Palette.dark};
`;

const SistemaDeleteButton = styled(SistemaActionButton)`
  background: rgba(84, 18, 18, 0.08);
  border-color: rgba(84, 18, 18, 0.28);
  color: ${Palette.primary};
`;

const SistemaBody = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 15%) minmax(0, 85%);
  gap: 1rem;
  align-items: stretch;
  margin-top: 1rem;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const SistemaPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid rgba(65, 94, 114, 0.14);
  border-radius: 8px;
  padding: 0.85rem;
  background: ${({ $soft }) => ($soft ? 'rgba(79, 183, 179, 0.08)' : '#fbfdff')};
`;

const CompactLabel = styled(Label)`
  margin: 0 0 0.55rem;
  color: ${Palette.title};
  font-size: 0.95rem;
  line-height: 1.2;
`;

const SistemaTextArea = styled(TextArea)`
  flex: 1;
  min-height: 118px;
  height: 100%;
`;

const SistemaEstadoChecklist = styled(EstadoChecklist)`
  border-radius: 8px;
  padding: 0.65rem;
  gap: 0.5rem;
  background: #ffffff;

  ${EstadoOptionLabel} {
    padding: 0.38rem 0.65rem;
  }
`;

const SistemaAddPanel = styled.div`
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px dashed rgba(65, 94, 114, 0.34);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
`;

const SistemaAddRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.85rem;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SistemaSelect = styled(Select)`
  width: 100%;
  min-width: 0;
`;

const SistemaAddButton = styled(SubmitButton)`
  width: auto;
  min-width: 132px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 760px) {
    width: 100%;
  }
`;

const toStr = (value) => (value == null ? '' : String(value));
const toArr = (value) => (Array.isArray(value) ? value : []);
const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const displaySistemaLabel = (name) => {
  const norm = String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (norm === 'cardiopulmonar') return 'Cardiocirculatorio';
  if (name === 'Psiquiátrico' || name === 'Psiquiatrico') return 'Psicoemocional';
  if (name === 'Reumatológico' || name === 'Reumatologico' || name === 'Reumatólogo' || name === 'Reumatologo') return 'Musculoesquelético';
  return name;
};

const ConsultasSection = ({
  isOpen,
  onToggle,
  genero,
  alergico,
  toggleAlergico,
  isLoading,
  consultasOrdenadas,
  oldestConsultaUid,
  SISTEMAS_OPCIONES,
  SISTEMA_ESTADO_OPTIONS,
  findSistemaConfig,
  nuevoSistemaPorConsulta,
  openConsultaUid,
  handleToggleConsulta,
  handleNuevaConsulta,
  handleEliminarConsulta,
  handleConsultaFieldChange,
  handleSistemaSelectChange,
  handleAgregarSistema,
  handleEliminarSistema,
  handleActualizarSistemaDesc,
  handleToggleSistemaEstado,
  handleAgregarPersonalizado,
  handleEliminarPersonalizado,
  handleActualizarPersonalizado,
  handleTogglePersonalizadoEstado,
  autoFocusTarget,
  onAutoFocusHandled,
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeNotesJump, setActiveNotesJump] = useState(null);
  const fieldRefs = useRef({});
  const isMujer = (genero || '').trim() === 'Mujer';

  const registerFieldRef = (uid, field) => (el) => {
    if (!uid || !field) return;
    if (!fieldRefs.current[uid]) fieldRefs.current[uid] = {};
    if (el) {
      fieldRefs.current[uid][field] = el;
    } else {
      delete fieldRefs.current[uid][field];
    }
  };

  const resolveConsulta = (uid) => {
    if (!uid) return null;
    return consultasOrdenadas.find((consulta, index) => (consulta.uid || `consulta-${index}`) === uid) || null;
  };

  const selectedConsulta = deleteTarget ? resolveConsulta(deleteTarget.uid) : null;
  const selectedSistema =
    deleteTarget?.type === 'sistema' && selectedConsulta
      ? toArr(selectedConsulta.interrogatorio_aparatos)[deleteTarget.index] || null
      : null;
  const selectedPersonalizado =
    deleteTarget?.type === 'personalizado' && selectedConsulta
      ? toArr(selectedConsulta.personalizados)[deleteTarget.index] || null
      : null;

  const requestDeleteSistema = (uid, index) => {
    if (isLoading) return;
    setDeleteTarget({ type: 'sistema', uid, index });
  };
  const requestDeletePersonalizado = (uid, index) => {
    if (isLoading) return;
    setDeleteTarget({ type: 'personalizado', uid, index });
  };
  const requestDeleteConsulta = (uid) => {
    if (isLoading) return;
    setDeleteTarget({ type: 'consulta', uid });
  };

  const scrollToConsultaNotes = (uid, displayNumber, source) => {
    const field = displayNumber < 2 ? 'notas' : 'notas_evolucion';
    const target = fieldRefs.current[uid]?.[field];
    if (!target) return;
    setActiveNotesJump({ uid, source, field });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => target.focus?.({ preventScroll: true }), 350);
  };

  const scrollBackToSistema = () => {
    if (!activeNotesJump) return;
    const source = activeNotesJump.source || {};
    const field =
      source.type === 'personalizado'
        ? `personalizado_${source.index}`
        : `interrogatorio_desc_${source.index}`;
    const target = fieldRefs.current[activeNotesJump.uid]?.[field];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => target.focus?.({ preventScroll: true }), 350);
  };
  const backToSourceLabel = activeNotesJump?.source?.type === 'personalizado' ? 'Regresar a personalizado' : 'Regresar a sistema';
  const cancelDelete = () => setDeleteTarget(null);
  const confirmDelete = () => {
    if (!deleteTarget || isLoading) return;
    if (deleteTarget.type === 'sistema') {
      handleEliminarSistema(deleteTarget.uid, deleteTarget.index);
    } else if (deleteTarget.type === 'personalizado') {
      handleEliminarPersonalizado(deleteTarget.uid, deleteTarget.index);
    } else if (deleteTarget.type === 'consulta') {
      handleEliminarConsulta(deleteTarget.uid);
    }
    setDeleteTarget(null);
  };

  const modalTitle =
    deleteTarget?.type === 'sistema'
      ? '¿Eliminar sistema?'
      : deleteTarget?.type === 'personalizado'
        ? '¿Eliminar personalizado?'
        : deleteTarget?.type === 'consulta'
          ? '¿Eliminar consulta?'
          : '';

  const modalText = (() => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'sistema') {
      const nombre = displaySistemaLabel(selectedSistema?.nombre) || 'este sistema';
      return `Vas a eliminar el sistema "${nombre}". Esta acción no se puede deshacer.`;
    }
    if (deleteTarget.type === 'personalizado') {
      const nombre = selectedPersonalizado?.nombre?.trim() || 'Personalizado sin título';
      return `Vas a eliminar el personalizado "${nombre}". Esta acción no se puede deshacer.`;
    }
    if (deleteTarget.type === 'consulta') {
      const fechaStr = selectedConsulta?.fecha_consulta
        ? (() => {
            const date = new Date(selectedConsulta.fecha_consulta);
            if (!Number.isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = String(date.getFullYear());
              return ` del ${day}-${month}-${year}`;
            }
            return ` del ${selectedConsulta.fecha_consulta}`;
          })()
        : '';
      const fecha = fechaStr;
      return `Vas a eliminar la consulta${fecha}. Esta acción no se puede deshacer.`;
    }
    return '';
  })();

  useEffect(() => {
    if (!autoFocusTarget || !autoFocusTarget.uid || !autoFocusTarget.field) return;
    const { uid, field, interrogatorioIndex, personalizadoIndex } = autoFocusTarget;
    const refMap = fieldRefs.current || {};

    let key = field;
    if (field === 'interrogatorio_desc' && Number.isInteger(interrogatorioIndex)) {
      key = `interrogatorio_desc_${interrogatorioIndex}`;
    } else if (field === 'interrogatorio_estado' && Number.isInteger(interrogatorioIndex)) {
      key = `interrogatorio_estado_${interrogatorioIndex}`;
    } else if (field === 'personalizado' && Number.isInteger(personalizadoIndex)) {
      key = `personalizado_${personalizadoIndex}`;
    }

    const el = refMap[uid] && refMap[uid][key];
    if (el && typeof el.focus === 'function') {
      el.focus();
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    if (typeof onAutoFocusHandled === 'function') {
      onAutoFocusHandled();
    }
  }, [autoFocusTarget, onAutoFocusHandled]);
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Consultas</Summary>

      {/* Alérgico (Sí/No) exclusivo, permite ninguno o uno - visual primero en Consultas */}
      <AlergicoContainer style={{ marginBottom: '1.5rem', marginLeft: '1rem' }}>
        <Label>Alérgico</Label>
        <AlergicoOptions>
          <AlergicoOption $selected={alergico === 'Si'}>
            <input type="checkbox" name="alergico_si" checked={alergico === 'Si'} onChange={toggleAlergico('Si')} />
            <span>Sí</span>
          </AlergicoOption>
          <AlergicoOption $selected={alergico === 'No'}>
            <input type="checkbox" name="alergico_no" checked={alergico === 'No'} onChange={toggleAlergico('No')} />
            <span>No</span>
          </AlergicoOption>
        </AlergicoOptions>
      </AlergicoContainer>

      <NestedToolbar style={{ marginBottom: '1.5rem' }}>
        <SubmitButton type="button" onClick={handleNuevaConsulta} disabled={isLoading} style={{ width: 'auto' }}>
          <FaPlusCircle style={{ marginRight: '0.5rem' }} />
          Crear nueva consulta
        </SubmitButton>
      </NestedToolbar>

      {consultasOrdenadas.map((consulta, idx) => {
        const totalConsultas = consultasOrdenadas.length;
        const displayNumber = Math.max(1, totalConsultas - idx);
        const titulo = `Consulta ${displayNumber}`;
        const isLatestConsulta = idx === 0;
        const uid = consulta.uid || `consulta-${idx}`;
        const fechaId = `fecha_consulta_${uid}`;
        const recordatorioId = `recordatorio_${uid}`;
        const fumId = `fum_${uid}`;
        const historiaId = `historia_${uid}`;
        const padecimientoId = `padecimiento_${uid}`;
        const diagnosticoId = `diagnostico_${uid}`;
        const tratamientoId = `tratamiento_${uid}`;
        const notasId = `notas_${uid}`;
        const aguaId = `agua_${uid}`;
        const laboratoriosId = `laboratorios_${uid}`;
        const presionId = `presion_${uid}`;
        const glucosaId = `glucosa_${uid}`;
        const pamId = `pam_${uid}`;
        const pesoId = `peso_${uid}`;
        const ejercicioId = `ejercicio_${uid}`;
        const desparacitacionId = `desparacitacion_${uid}`;
        const selectId = `select_sistema_${uid}`;
        const sistemasSeleccionados = toArr(consulta.interrogatorio_aparatos);
        const opcionesDisponibles = SISTEMAS_OPCIONES.filter((opt) => !sistemasSeleccionados.some((s) => normalize(s.nombre) === normalize(opt)));
        const selectValue = nuevoSistemaPorConsulta[uid] || '';
        const orejaValue = toStr(consulta.oreja);

        return (
          <div key={uid} style={{ marginBottom: '2.5rem' }}>
            <NestedDetails open={openConsultaUid === uid} onToggle={handleToggleConsulta(uid)}>
              <InnerSummary $isLatest={isLatestConsulta}>{titulo}</InnerSummary>

              <ItemActions style={{ justifyContent: 'flex-end' }}>
                <DangerButton type="button" onClick={() => requestDeleteConsulta(uid)} disabled={isLoading}>
                  <FaTrash />
                  <ButtonLabel>Eliminar consulta</ButtonLabel>
                </DangerButton>
              </ItemActions>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={fechaId}>
                    <FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta
                  </Label>
                  <Input
                    type="date"
                    id={fechaId}
                    value={consulta.fecha_consulta || ''}
                    onChange={handleConsultaFieldChange(uid, 'fecha_consulta')}
                    ref={registerFieldRef(uid, 'fecha_consulta')}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={recordatorioId}>
                    <FaBell style={{ marginRight: '0.5rem' }} />Recordatorio
                  </Label>
                  <Input
                    type="date"
                    id={recordatorioId}
                    value={consulta.recordatorio || ''}
                    onChange={handleConsultaFieldChange(uid, 'recordatorio')}
                    ref={registerFieldRef(uid, 'recordatorio')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <FieldGroup>
                <Label>Oreja</Label>
                <AlergicoOptions>
                  <AlergicoOption $selected={orejaValue === 'izquierda'}>
                    <input
                      type="checkbox"
                      name={`oreja_izquierda_${uid}`}
                      checked={orejaValue === 'izquierda'}
                      ref={registerFieldRef(uid, 'oreja')}
                      onChange={(e) => {
                        const next = e.target.checked ? 'izquierda' : (orejaValue === 'izquierda' ? '' : orejaValue);
                        handleConsultaFieldChange(uid, 'oreja')({ target: { value: next } });
                      }}
                    />
                    <span>Izquierda</span>
                  </AlergicoOption>
                  <AlergicoOption $selected={orejaValue === 'derecha'}>
                    <input
                      type="checkbox"
                      name={`oreja_derecha_${uid}`}
                      checked={orejaValue === 'derecha'}
                      onChange={(e) => {
                        const next = e.target.checked ? 'derecha' : (orejaValue === 'derecha' ? '' : orejaValue);
                        handleConsultaFieldChange(uid, 'oreja')({ target: { value: next } });
                      }}
                    />
                    <span>Derecha</span>
                  </AlergicoOption>
                </AlergicoOptions>
              </FieldGroup>

              <TwoColumnRow>
                <FieldGroup style={{ gridColumn: '1 / -1' }}>
                  <Label htmlFor={historiaId}>
                    <FaNotesMedical style={{ marginRight: '0.5rem' }} />Historia clínica
                  </Label>
                  <TextArea
                    id={historiaId}
                    value={consulta.historia_clinica || ''}
                    onChange={handleConsultaFieldChange(uid, 'historia_clinica')}
                    rows={2}
                    placeholder="Describe la historia clínica"
                    ref={registerFieldRef(uid, 'historia_clinica')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <FieldGroup>
                <Label htmlFor={padecimientoId}>
                  <FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual
                </Label>
                <TextArea
                  id={padecimientoId}
                  value={consulta.padecimiento_actual || ''}
                  onChange={handleConsultaFieldChange(uid, 'padecimiento_actual')}
                  rows={4}
                  placeholder="Describe el padecimiento actual"
                  ref={registerFieldRef(uid, 'padecimiento_actual')}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor={diagnosticoId}>
                  <FaDiagnoses style={{ marginRight: '0.5rem' }} />Diagnóstico
                </Label>
                <TextArea
                  id={diagnosticoId}
                  value={consulta.diagnostico || ''}
                  onChange={handleConsultaFieldChange(uid, 'diagnostico')}
                  rows={2}
                  placeholder="Especifica el diagnóstico"
                  ref={registerFieldRef(uid, 'diagnostico')}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor={tratamientoId}>
                  <FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Tratamiento
                </Label>
                <TextArea
                  id={tratamientoId}
                  value={consulta.tratamiento || ''}
                  onChange={handleConsultaFieldChange(uid, 'tratamiento')}
                  rows={2}
                  placeholder="Describe el plan de tratamiento"
                  ref={registerFieldRef(uid, 'tratamiento')}
                />
              </FieldGroup>
              {displayNumber < 2 && (
                <FieldGroup>
                  <Label htmlFor={notasId}>
                    <FaStickyNote style={{ marginRight: '0.5rem' }} />Notas
                  </Label>
                  <TextArea
                    id={notasId}
                    value={consulta.notas || ''}
                    onChange={handleConsultaFieldChange(uid, 'notas')}
                    rows={2}
                    placeholder="Notas adicionales"
                    ref={registerFieldRef(uid, 'notas')}
                  />
                  {activeNotesJump?.uid === uid && activeNotesJump.field === 'notas' && (
                    <ItemActions>
                      <NotesJumpButton type="button" onClick={scrollBackToSistema} disabled={isLoading}>
                        <FaClipboardCheck />
                        <ButtonLabel>{backToSourceLabel}</ButtonLabel>
                      </NotesJumpButton>
                    </ItemActions>
                  )}
                </FieldGroup>
              )}
              {displayNumber >= 2 && (
                <React.Fragment>
                  <FieldGroup>
                    <Label htmlFor={`${diagnosticoId}_notas_evolucion`}>
                      <FaStickyNote style={{ marginRight: '0.5rem' }} />Notas de evolución
                    </Label>
                    <TextArea
                      id={`${diagnosticoId}_notas_evolucion`}
                      value={consulta.notas_evolucion || ''}
                      onChange={handleConsultaFieldChange(uid, 'notas_evolucion')}
                      rows={2}
                      placeholder="Notas de evolución a partir de esta consulta"
                      ref={registerFieldRef(uid, 'notas_evolucion')}
                    />
                    {activeNotesJump?.uid === uid && activeNotesJump.field === 'notas_evolucion' && (
                      <ItemActions>
                        <NotesJumpButton type="button" onClick={scrollBackToSistema} disabled={isLoading}>
                          <FaClipboardCheck />
                          <ButtonLabel>{backToSourceLabel}</ButtonLabel>
                        </NotesJumpButton>
                      </ItemActions>
                    )}
                  </FieldGroup>
                  <FieldGroup>
                    <Label htmlFor={notasId}>
                      <FaStickyNote style={{ marginRight: '0.5rem' }} />Nota anterior
                    </Label>
                    <TextArea
                      id={notasId}
                      value={consulta.notas || ''}
                      onChange={handleConsultaFieldChange(uid, 'notas')}
                      rows={2}
                      placeholder="Notas adicionales"
                      ref={registerFieldRef(uid, 'notas')}
                    />
                  </FieldGroup>
                </React.Fragment>
              )}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={`${diagnosticoId}_meds`}>
                    <FaPills style={{ marginRight: '0.5rem' }} />Medicamentos y suplementos
                  </Label>
                  <TextArea
                    id={`${diagnosticoId}_meds`}
                    value={consulta.medicamentos || ''}
                    onChange={handleConsultaFieldChange(uid, 'medicamentos')}
                    rows={2}
                    placeholder="Medicamentos actuales o prescritos"
                    ref={registerFieldRef(uid, 'medicamentos')}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={laboratoriosId}>
                    <FaFlask style={{ marginRight: '0.5rem' }} />
                    Laboratorios y gabinetes
                  </Label>
                  <TextArea
                    id={laboratoriosId}
                    value={consulta.laboratorios || ''}
                    onChange={handleConsultaFieldChange(uid, 'laboratorios')}
                    rows={2}
                    placeholder="Resultados o indicaciones de laboratorio"
                    ref={registerFieldRef(uid, 'laboratorios')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={aguaId}>
                    <FaTint style={{ marginRight: '0.5rem' }} />
                    Agua
                  </Label>
                  <Input
                    id={aguaId}
                    value={consulta.agua || ''}
                    onChange={handleConsultaFieldChange(uid, 'agua')}
                    placeholder="Indica consumo o indicaciones de agua"
                    ref={registerFieldRef(uid, 'agua')}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={glucosaId}>
                    <FaVial style={{ marginRight: '0.5rem' }} />
                    Glucosa
                  </Label>
                  <TextArea
                    id={glucosaId}
                    value={consulta.glucosa || ''}
                    onChange={handleConsultaFieldChange(uid, 'glucosa')}
                    rows={3}
                    placeholder="Ej. 90 mg/dL"
                    ref={registerFieldRef(uid, 'glucosa')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={presionId}>
                    <FaTachometerAlt style={{ marginRight: '0.5rem' }} />
                    Presión
                  </Label>
                  <TextArea
                    id={presionId}
                    value={consulta.presion || ''}
                    onChange={handleConsultaFieldChange(uid, 'presion')}
                    rows={3}
                    placeholder="Ej. 120/80 mmHg"
                    ref={registerFieldRef(uid, 'presion')}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={pamId}>
                    <FaHeartbeat style={{ marginRight: '0.5rem' }} />
                    PAM
                  </Label>
                  <Input
                    id={pamId}
                    value={consulta.pam || ''}
                    onChange={handleConsultaFieldChange(uid, 'pam')}
                    placeholder="Calculada o manual"
                    ref={registerFieldRef(uid, 'pam')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={pesoId}>Peso</Label>
                  <Input
                    id={pesoId}
                    value={consulta.peso || ''}
                    onChange={handleConsultaFieldChange(uid, 'peso')}
                    placeholder="Peso reportado en consulta"
                    ref={registerFieldRef(uid, 'peso')}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={ejercicioId}>Ejercicio</Label>
                  <Input
                    id={ejercicioId}
                    value={consulta.ejercicio || ''}
                    onChange={handleConsultaFieldChange(uid, 'ejercicio')}
                    placeholder="Actividad física o indicación"
                    ref={registerFieldRef(uid, 'ejercicio')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={desparacitacionId}>Desparacitación</Label>
                  <Input
                    id={desparacitacionId}
                    value={consulta.desparacitacion || ''}
                    onChange={handleConsultaFieldChange(uid, 'desparacitacion')}
                    placeholder="Esquema o seguimiento"
                    ref={registerFieldRef(uid, 'desparacitacion')}
                  />
                </FieldGroup>
              </TwoColumnRow>
              {isMujer && (
                <FieldGroup>
                  <Label htmlFor={fumId}>
                    <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                    FUM (Luna)
                  </Label>
                  <Input
                    type="text"
                    id={fumId}
                    value={consulta.fum || ''}
                    onChange={handleConsultaFieldChange(uid, 'fum')}
                    placeholder="Escribe la FUM"
                    ref={registerFieldRef(uid, 'fum')}
                  />
                </FieldGroup>
              )}
              {sistemasSeleccionados.length > 0 && (
                <ListContainer>
                  {sistemasSeleccionados.map((s, sistemaIdx) => {
                    const config = findSistemaConfig(s.nombre);
                    const estadoValue = toStr(s.estado);
                    const isOldestConsulta = String(uid) === String(oldestConsultaUid ?? '');
                    const showEstadoChecklist = !isOldestConsulta && Boolean(config?.estadoKey);
                    return (
                      <SistemaCard key={`${uid}-sistema-${sistemaIdx}`}>
                        <SistemaHeader>
                          <SistemaIdentity>
                            <SistemaEyebrow>
                              <FaClipboardCheck />
                              Sistema
                            </SistemaEyebrow>
                            <SistemaName>{displaySistemaLabel(s.nombre)}</SistemaName>
                          </SistemaIdentity>
                          <SistemaActions>
                            <SistemaNotesButton type="button" onClick={() => scrollToConsultaNotes(uid, displayNumber, { type: 'sistema', index: sistemaIdx })} disabled={isLoading}>
                              <FaStickyNote />
                              <ButtonLabel>{displayNumber < 2 ? 'Ir a notas' : 'Ir a notas de ev.'}</ButtonLabel>
                            </SistemaNotesButton>
                            <SistemaDeleteButton type="button" onClick={() => requestDeleteSistema(uid, sistemaIdx)} disabled={isLoading}>
                              <FaTrash />
                              <ButtonLabel>Eliminar</ButtonLabel>
                            </SistemaDeleteButton>
                          </SistemaActions>
                        </SistemaHeader>

                        <SistemaBody>
                          <SistemaPanel $soft>
                            <CompactLabel>Seguimiento</CompactLabel>
                            {showEstadoChecklist ? (
                              <SistemaEstadoChecklist>
                                {SISTEMA_ESTADO_OPTIONS.map((option) => {
                                  const optionId = `${uid}-sistema-${sistemaIdx}-${option.value}`;
                                  const checked = estadoValue === option.value;
                                  return (
                                    <EstadoOptionLabel key={option.value} htmlFor={optionId}>
                                      <EstadoCheckbox id={optionId} type="checkbox" checked={checked} onChange={() => handleToggleSistemaEstado(uid, sistemaIdx, option.value)} />
                                      <span>{option.label}</span>
                                    </EstadoOptionLabel>
                                  );
                                })}
                              </SistemaEstadoChecklist>
                            ) : (
                              <SistemaInitialNote>Consulta inicial</SistemaInitialNote>
                            )}
                          </SistemaPanel>
                          <SistemaPanel>
                            <CompactLabel>{`Descripción de ${displaySistemaLabel(s.nombre)?.toLowerCase?.() || 'sistema'}`}</CompactLabel>
                            <SistemaTextArea
                              value={s.descripcion}
                              onChange={(e) => handleActualizarSistemaDesc(uid, sistemaIdx, e.target.value)}
                              rows={4}
                              placeholder={`Detalle de ${displaySistemaLabel(s.nombre)?.toLowerCase?.() || ''}`}
                              ref={registerFieldRef(uid, `interrogatorio_desc_${sistemaIdx}`)}
                            />
                          </SistemaPanel>
                        </SistemaBody>
                      </SistemaCard>
                    );
                  })}
                </ListContainer>
              )}
              <SistemaAddPanel>
                <SistemaAddRow>
                  <FieldGroup>
                    <CompactLabel htmlFor={selectId}>Agregar sistema</CompactLabel>
                    <SistemaSelect id={selectId} value={selectValue} onChange={handleSistemaSelectChange(uid)}>
                      <option value="">-- Selecciona --</option>
                      {opcionesDisponibles.map((opt) => (
                        <option key={opt} value={opt}>
                          {displaySistemaLabel(opt)}
                        </option>
                      ))}
                    </SistemaSelect>
                  </FieldGroup>
                  <SistemaAddButton type="button" onClick={() => handleAgregarSistema(uid)} disabled={!selectValue || isLoading}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar
                  </SistemaAddButton>
                </SistemaAddRow>
              </SistemaAddPanel>
              {toArr(consulta.personalizados).length > 0 && (
                <ListContainer>
                  {toArr(consulta.personalizados).map((p, pIdx) => {
                    const isOldestConsulta = String(uid) === String(oldestConsultaUid ?? '');
                    const estadoValue = toStr(p.estado);
                    const showEstadoChecklist = !isOldestConsulta;
                    const personalizadoTitle = p.nombre?.trim() || 'Personalizado sin título';
                    return (
                      <SistemaCard key={`${uid}-pers-${pIdx}`}>
                        <SistemaHeader>
                          <SistemaIdentity>
                            <SistemaEyebrow>
                              <FaClipboardCheck />
                              Personalizado
                            </SistemaEyebrow>
                            <SistemaName>{personalizadoTitle}</SistemaName>
                          </SistemaIdentity>
                          <SistemaActions>
                            <SistemaNotesButton type="button" onClick={() => scrollToConsultaNotes(uid, displayNumber, { type: 'personalizado', index: pIdx })} disabled={isLoading}>
                              <FaStickyNote />
                              <ButtonLabel>{displayNumber < 2 ? 'Ir a notas' : 'Ir a notas de ev.'}</ButtonLabel>
                            </SistemaNotesButton>
                            <SistemaDeleteButton type="button" onClick={() => requestDeletePersonalizado(uid, pIdx)} disabled={isLoading}>
                              <FaTrash />
                              <ButtonLabel>Eliminar</ButtonLabel>
                            </SistemaDeleteButton>
                          </SistemaActions>
                        </SistemaHeader>

                        <SistemaBody>
                          <SistemaPanel $soft>
                            <CompactLabel>Título</CompactLabel>
                            <Input
                              value={p.nombre}
                              onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'nombre', e.target.value)}
                              placeholder="Escribe el título"
                              maxLength={100}
                            />
                            <CompactLabel style={{ marginTop: '0.85rem' }}>Seguimiento</CompactLabel>
                            {showEstadoChecklist ? (
                              <SistemaEstadoChecklist>
                                {SISTEMA_ESTADO_OPTIONS.map((option) => {
                                  const optionId = `${uid}-pers-${pIdx}-${option.value}`;
                                  const checked = estadoValue === option.value;
                                  return (
                                    <EstadoOptionLabel key={option.value} htmlFor={optionId}>
                                      <EstadoCheckbox
                                        id={optionId}
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => handleTogglePersonalizadoEstado(uid, pIdx, option.value)}
                                      />
                                      <span>{option.label}</span>
                                    </EstadoOptionLabel>
                                  );
                                })}
                              </SistemaEstadoChecklist>
                            ) : (
                              <SistemaInitialNote>Consulta inicial</SistemaInitialNote>
                            )}
                          </SistemaPanel>
                          <SistemaPanel>
                            <CompactLabel>Descripción</CompactLabel>
                            <SistemaTextArea
                              value={p.descripcion}
                              onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'descripcion', e.target.value)}
                              rows={4}
                              placeholder="Describe el contenido"
                              ref={registerFieldRef(uid, `personalizado_${pIdx}`)}
                            />
                          </SistemaPanel>
                        </SistemaBody>
                      </SistemaCard>
                    );
                  })}
                </ListContainer>
              )}
              <FieldGroup>
                <Label>&nbsp;</Label>
                <SubmitButton type="button" onClick={() => handleAgregarPersonalizado(uid)}>
                  Crear personalizado
                </SubmitButton>
              </FieldGroup>

              
            </NestedDetails>
          </div>
        );
      })}
      <ConfirmModal
        open={deleteTarget !== null}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title={modalTitle || '¿Eliminar?'}
        text={modalText}
        confirmLabel="Eliminar"
      />
    </details>
  );
};

export default ConsultasSection;
