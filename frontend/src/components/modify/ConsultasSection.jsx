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
  FaCalendarDay,
  FaPills,
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
  background: #f7fbff;
  border-left: 4px solid ${Palette.primary};
  border-radius: 4px;
`;

const toStr = (value) => (value == null ? '' : String(value));
const toArr = (value) => (Array.isArray(value) ? value : []);
const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const ConsultasSection = ({
  isOpen,
  onToggle,
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
  const fieldRefs = useRef({});

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
      const nombre = selectedSistema?.nombre || 'este sistema';
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
    const { uid, field } = autoFocusTarget;
    const refMap = fieldRefs.current || {};
    const el = refMap[uid] && refMap[uid][field];
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
        const uid = consulta.uid || `consulta-${idx}`;
        const fechaId = `fecha_consulta_${uid}`;
        const recordatorioId = `recordatorio_${uid}`;
        const padecimientoId = `padecimiento_${uid}`;
        const diagnosticoId = `diagnostico_${uid}`;
        const tratamientoId = `tratamiento_${uid}`;
        const notasId = `notas_${uid}`;
        const selectId = `select_sistema_${uid}`;
        const sistemasSeleccionados = toArr(consulta.interrogatorio_aparatos);
        const opcionesDisponibles = SISTEMAS_OPCIONES.filter((opt) => !sistemasSeleccionados.some((s) => normalize(s.nombre) === normalize(opt)));
        const selectValue = nuevoSistemaPorConsulta[uid] || '';
        const orejaValue = toStr(consulta.oreja);

        return (
          <div key={uid} style={{ marginBottom: '2.5rem' }}>
            <NestedDetails open={openConsultaUid === uid} onToggle={handleToggleConsulta(uid)}>
              <InnerSummary>{titulo}</InnerSummary>

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

              {displayNumber >= 2 && (
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
                </FieldGroup>
              )}
              <FieldGroup>
                <Label htmlFor={padecimientoId}>
                  <FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual
                </Label>
                <TextArea
                  id={padecimientoId}
                  value={consulta.padecimiento_actual || ''}
                  onChange={handleConsultaFieldChange(uid, 'padecimiento_actual')}
                  rows={2}
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
                </FieldGroup>
              )}
              {displayNumber >= 2 && (
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
                      <ItemCard key={`${uid}-sistema-${sistemaIdx}`}>
                        <TwoColumnRow>
                          <FieldGroup>
                            <Label>
                              <FaClipboardCheck style={{ marginRight: '0.5rem' }} />Sistema
                            </Label>
                            <Input value={s.nombre} disabled />
                            {showEstadoChecklist && (
                              <FieldGroup>
                                <Label>Seguimiento</Label>
                                <EstadoChecklist>
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
                                </EstadoChecklist>
                              </FieldGroup>
                            )}
                          </FieldGroup>
                          <FieldGroup>
                            <Label>{`Descripción de aparato ${s.nombre?.toLowerCase?.() || ''}`}</Label>
                            <TextArea value={s.descripcion} onChange={(e) => handleActualizarSistemaDesc(uid, sistemaIdx, e.target.value)} rows={3} placeholder={`Detalle de ${s.nombre?.toLowerCase?.() || ''}`} />
                          </FieldGroup>
                        </TwoColumnRow>

                        <ItemActions>
                          <DangerButton type="button" onClick={() => requestDeleteSistema(uid, sistemaIdx)} disabled={isLoading}>
                            <FaTrash />
                            <ButtonLabel>Eliminar sistema</ButtonLabel>
                          </DangerButton>
                        </ItemActions>
                      </ItemCard>
                    );
                  })}
                </ListContainer>
              )}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={selectId}>Selecciona un sistema</Label>
                  <Select id={selectId} value={selectValue} onChange={handleSistemaSelectChange(uid)}>
                    <option value="">-- Selecciona --</option>
                    {opcionesDisponibles.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={() => handleAgregarSistema(uid)} disabled={!selectValue || isLoading}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>
              {toArr(consulta.personalizados).length > 0 && (
                <ListContainer>
                  {toArr(consulta.personalizados).map((p, pIdx) => {
                    const isOldestConsulta = String(uid) === String(oldestConsultaUid ?? '');
                    const estadoValue = toStr(p.estado);
                    const showEstadoChecklist = !isOldestConsulta;
                    return (
                      <ItemCard key={`${uid}-pers-${pIdx}`}>
                        <TwoColumnRow>
                          <FieldGroup>
                            <Label>Título</Label>
                            <Input value={p.nombre} onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'nombre', e.target.value)} placeholder="Escribe el título" maxLength={100} />
                          </FieldGroup>
                          <FieldGroup>
                            <Label>Descripción</Label>
                            <TextArea value={p.descripcion} onChange={(e) => handleActualizarPersonalizado(uid, pIdx, 'descripcion', e.target.value)} rows={3} placeholder="Describe el contenido" />
                          </FieldGroup>
                          {showEstadoChecklist && (
                            <FieldGroup>
                              <Label>Seguimiento</Label>
                              <EstadoChecklist>
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
                              </EstadoChecklist>
                            </FieldGroup>
                          )}
                        </TwoColumnRow>
                        <ItemActions>
                          <DangerButton type="button" onClick={() => requestDeletePersonalizado(uid, pIdx)} disabled={isLoading}>
                            <FaTrash />
                            <ButtonLabel>Eliminar</ButtonLabel>
                          </DangerButton>
                        </ItemActions>
                      </ItemCard>
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
