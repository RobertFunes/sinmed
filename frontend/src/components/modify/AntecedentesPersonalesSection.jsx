import React, { useState } from 'react';
import { FaPlusCircle, FaUtensils, FaExchangeAlt, FaExclamationCircle, FaClock, FaTrash } from 'react-icons/fa';
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
import { HABITOS_OPCIONES } from '../../helpers/add/catalogos';
import ConfirmModal from '../ConfirmModal';

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const AntecedentesPersonalesSection = ({
  formData,
  nuevoHabito,
  setNuevoHabito,
  addHabito,
  removeHabitoAt,
  updateHabitoCampo,
  isOpen,
  onToggle,
  isLoading,
  handleChange,
}) => {
  const [deleteCandidateIdx, setDeleteCandidateIdx] = useState(null);

  const selectedHabito =
    deleteCandidateIdx !== null ? formData.antecedentes_personales_habitos[deleteCandidateIdx] : null;

  const requestDeleteHabito = (idx) => setDeleteCandidateIdx(idx);
  const cancelDeleteHabito = () => setDeleteCandidateIdx(null);
  const confirmDeleteHabito = () => {
    if (deleteCandidateIdx === null) return;
    removeHabitoAt(deleteCandidateIdx);
    setDeleteCandidateIdx(null);
  };

  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>
        Antecedentes personales
      </Summary>

      {formData.antecedentes_personales_habitos.length > 0 && (
        <ListContainer>
          {formData.antecedentes_personales_habitos.map((h, idx) => (
            <ItemCard key={idx}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{h.tipo}</strong>
              <TwoColumnRow>
                {h.tipo === 'Alcoholismo' && (
                  <>
                    <FieldGroup>
                      <Label htmlFor={`bebidas_${idx}`}>Alcohol: Bebidas por día</Label>
                      <Input
                        id={`bebidas_${idx}`}
                        value={h.campos.bebidas_por_dia}
                        onChange={(e) => updateHabitoCampo(idx, 'bebidas_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 2"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`freq_${idx}`}
                        value={h.campos.tiempo_activo_alc}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_alc', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                  </>
                )}

                {h.tipo === 'Tabaquismo' && (
                  <>
                    <FieldGroup>
                      <Label htmlFor={`cigs_${idx}`}>Cigarrillos por día</Label>
                      <Input
                        id={`cigs_${idx}`}
                        value={h.campos.cigarrillos_por_dia}
                        onChange={(e) => updateHabitoCampo(idx, 'cigarrillos_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 10"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tiempo_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tiempo_${idx}`}
                        value={h.campos.tiempo_activo_tab}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tab', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                  </>
                )}

                {h.tipo === 'Toxicomanías' && (
                  <>
                    <FieldGroup>
                      <Label htmlFor={`tox_${idx}`}>Tipo de toxicomanía</Label>
                      <Input
                        id={`tox_${idx}`}
                        value={h.campos.tipo_toxicomania}
                        onChange={(e) => updateHabitoCampo(idx, 'tipo_toxicomania', e.target.value)}
                        placeholder="Sustancia"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tox_freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tox_freq_${idx}`}
                        value={h.campos.tiempo_activo_tox}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tox', e.target.value)}
                        placeholder="Ej. diario, esporádico"
                      />
                    </FieldGroup>
                  </>
                )}
              </TwoColumnRow>

              <ItemActions>
                <DangerButton type="button" onClick={() => requestDeleteHabito(idx)}>
                  <FaTrash />
                  <ButtonLabel>Eliminar</ButtonLabel>
                </DangerButton>
              </ItemActions>
            </ItemCard>
          ))}
        </ListContainer>
      )}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="select_habito">Selecciona hábito</Label>
          <Select
            id="select_habito"
            value={nuevoHabito}
            onChange={(e) => setNuevoHabito(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {HABITOS_OPCIONES
              .filter((opt) => !formData.antecedentes_personales_habitos.some((h) => normalize(h.tipo) === normalize(opt)))
              .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addHabito} disabled={!nuevoHabito || isLoading}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar hábito
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      

      {/* Eliminado: Select y lista de componentes de la dieta */}

      {/* Campos fijos */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="alimentacion_calidad">Alimentación (calidad)</Label>
          <Select id="calidad" name="calidad" value={formData.calidad} onChange={handleChange}>
            <option value="">-- Selecciona --</option>
            <option value="Buena">Buena</option>
            <option value="Regular">Regular</option>
            <option value="Mala">Mala</option>
          </Select>
        </FieldGroup>
      </TwoColumnRow>

      <FieldGroup>
        <Label htmlFor="alimentacion_descripcion">
          <FaUtensils style={{ marginRight: '0.5rem' }} />
          Descripción de la alimentación
        </Label>
        <TextArea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows={3}
          placeholder="Describe la alimentación del paciente"
        />
      </FieldGroup>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="hay_cambios">Cambios en la alimentación</Label>
          <Select id="hay_cambios" name="hay_cambios" value={formData.hay_cambios} onChange={handleChange}>
            <option value="">-- Selecciona --</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </Select>
        </FieldGroup>
        {formData.hay_cambios === 'Si' && (
          <FieldGroup>
            <Label htmlFor="cambio_tipo">
              <FaExchangeAlt style={{ marginRight: '0.5rem' }} />
              Tipo de cambio
            </Label>
            <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
          </FieldGroup>
        )}
      </TwoColumnRow>

      {formData.hay_cambios === 'Si' && (
        <TwoColumnRow>
          <FieldGroup>
            <Label htmlFor="cambio_causa">
              <FaExclamationCircle style={{ marginRight: '0.5rem' }} />
              Causa del cambio
            </Label>
            <Input id="cambio_causa" name="cambio_causa" value={formData.cambio_causa} onChange={handleChange} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cambio_tiempo">
              <FaClock style={{ marginRight: '0.5rem' }} />
              Tiempo
            </Label>
            <Input id="cambio_tiempo" name="cambio_tiempo" value={formData.cambio_tiempo} onChange={handleChange} placeholder="Ej. 6 meses" />
          </FieldGroup>
        </TwoColumnRow>
      )}
      <ConfirmModal
        open={deleteCandidateIdx !== null}
        onCancel={cancelDeleteHabito}
        onConfirm={confirmDeleteHabito}
        title="¿Eliminar hábito?"
        text={
          selectedHabito
            ? `Vas a eliminar el hábito "${selectedHabito.tipo}". Esta acción no se puede deshacer.`
            : 'Vas a eliminar este hábito. Esta acción no se puede deshacer.'
        }
        confirmLabel="Eliminar"
      />
    </details>
  );
};

export default AntecedentesPersonalesSection;

