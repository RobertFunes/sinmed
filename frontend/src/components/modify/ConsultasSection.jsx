import React from 'react';
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
} from 'react-icons/fa';
import { EstadoChecklist, EstadoOptionLabel, EstadoCheckbox } from '../../pages/modify.styles';

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
}) => {
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

        return (
          <div key={uid} style={{ marginBottom: '2.5rem' }}>
            <NestedDetails open={openConsultaUid === uid} onToggle={handleToggleConsulta(uid)}>
              <InnerSummary>{titulo}</InnerSummary>

              <ItemActions style={{ justifyContent: 'flex-end' }}>
                <DangerButton type="button" onClick={() => handleEliminarConsulta(uid)} disabled={isLoading}>
                  <FaTrash />
                  <ButtonLabel>Eliminar consulta</ButtonLabel>
                </DangerButton>
              </ItemActions>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor={fechaId}>
                    <FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta
                  </Label>
                  <Input type="date" id={fechaId} value={consulta.fecha_consulta || ''} onChange={handleConsultaFieldChange(uid, 'fecha_consulta')} />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor={recordatorioId}>
                    <FaBell style={{ marginRight: '0.5rem' }} />Recordatorio
                  </Label>
                  <Input type="date" id={recordatorioId} value={consulta.recordatorio || ''} onChange={handleConsultaFieldChange(uid, 'recordatorio')} />
                </FieldGroup>
              </TwoColumnRow>

              <FieldGroup>
                <Label htmlFor={padecimientoId}>
                  <FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual
                </Label>
                <TextArea id={padecimientoId} value={consulta.padecimiento_actual || ''} onChange={handleConsultaFieldChange(uid, 'padecimiento_actual')} rows={6} placeholder="Describe el padecimiento actual" />
              </FieldGroup>

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
                          <DangerButton type="button" onClick={() => handleEliminarSistema(uid, sistemaIdx)}>
                            <FaTrash />
                            <ButtonLabel>Eliminar sistema</ButtonLabel>
                          </DangerButton>
                        </ItemActions>
                      </ItemCard>
                    );
                  })}
                </ListContainer>
              )}

              {/* Personalizados por consulta */}
              <FieldGroup>
                <Label>&nbsp;</Label>
                <SubmitButton type="button" onClick={() => handleAgregarPersonalizado(uid)}>
                  Crear personalizado
                </SubmitButton>
              </FieldGroup>

              {toArr(consulta.personalizados).length > 0 && (
                <ListContainer>
                  {toArr(consulta.personalizados).map((p, pIdx) => (
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
                      </TwoColumnRow>
                      <ItemActions>
                        <DangerButton type="button" onClick={() => handleEliminarPersonalizado(uid, pIdx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}
            </NestedDetails>
          </div>
        );
      })}
    </details>
  );
};

export default ConsultasSection;
