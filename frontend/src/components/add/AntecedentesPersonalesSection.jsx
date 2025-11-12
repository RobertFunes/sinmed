import React, { useEffect, useRef, useState } from 'react';
import { FaPlusCircle, FaExchangeAlt, FaExclamationCircle, FaClock, FaTrash } from 'react-icons/fa';
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

const AntecedentesPersonalesSection = ({
  formData,
  nuevoHabito,
  setNuevoHabito,
  addHabito,
  removeHabitoAt,
  updateHabitoCampo,
  handleChange,
  isOpen,
  onToggle,
}) => {
  const [deleteCandidateIdx, setDeleteCandidateIdx] = useState(null);
  const prevHabitosCount = useRef(formData.antecedentes_personales_habitos.length);
  const habitoInputsRef = useRef([]);

  useEffect(() => {
    const prevCount = prevHabitosCount.current;
    const currentCount = formData.antecedentes_personales_habitos.length;

    habitoInputsRef.current.length = currentCount;

    if (currentCount > prevCount) {
      const lastIndex = currentCount - 1;
      const targetField = habitoInputsRef.current[lastIndex];

      if (targetField && typeof targetField.focus === 'function') {
        targetField.focus();
      }

      if (typeof window !== 'undefined') {
        window.scrollBy({
          top: window.innerHeight * 0.15,
          behavior: 'smooth',
        });
      }
    }

    prevHabitosCount.current = currentCount;
  }, [formData.antecedentes_personales_habitos.length]);

  const setHabitoInputRef = (idx) => (el) => {
    habitoInputsRef.current[idx] = el;
  };

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
      <Summary>Antecedentes personales</Summary>

      {/* Select dinámico: Alcoholismo / Tabaquismo / Toxicomanías */}
      {formData.antecedentes_personales_habitos.length > 0 && (
        <ListContainer>
          {formData.antecedentes_personales_habitos.map((h, idx) => (
            <ItemCard key={idx}>
              <strong >{h.tipo}</strong>
              <TwoColumnRow>
                {h.tipo === 'Alcoholismo' && (
                  <>
                    <FieldGroup>
                      <Label htmlFor={`bebidas_${idx}`}>Bebidas</Label>
                      <Input
                        id={`bebidas_${idx}`}
                        ref={setHabitoInputRef(idx)}
                        value={h.campos?.bebidas_por_dia ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'bebidas_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 2 vasos a la semana"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`freq_${idx}`}
                        value={h.campos?.tiempo_activo_alc ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_alc', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`inactivo_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`inactivo_${idx}`}
                        value={h.campos?.tiempo_inactivo_alc ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_inactivo_alc', e.target.value)}
                        placeholder="Ej. 1 año"
                      />
                    </FieldGroup>
                  </>
                )}

                {h.tipo === 'Tabaquismo' && (
                  <>
                    <FieldGroup>
                      <Label htmlFor={`cigs_${idx}`}>Cigarrillos</Label>
                      <Input
                        id={`cigs_${idx}`}
                        ref={setHabitoInputRef(idx)}
                        value={h.campos?.cigarrillos_por_dia ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'cigarrillos_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 10 cigarrillos al día"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tiempo_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tiempo_${idx}`}
                        value={h.campos?.tiempo_activo_tab ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tab', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`inactivo_tab_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`inactivo_tab_${idx}`}
                        value={h.campos?.tiempo_inactivo_tab ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_inactivo_tab', e.target.value)}
                        placeholder="Ej. 1 año"
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
                        ref={setHabitoInputRef(idx)}
                        value={h.campos?.tipo_toxicomania ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tipo_toxicomania', e.target.value)}
                        placeholder="Sustancias y frecuencia"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tox_freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tox_freq_${idx}`}
                        value={h.campos?.tiempo_activo_tox ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tox', e.target.value)}
                        placeholder="Ej. 3 años"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tox_inactivo_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`tox_inactivo_${idx}`}
                        value={h.campos?.tiempo_inactivo_tox ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_inactivo_tox', e.target.value)}
                        placeholder="Ej. 6 meses"
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
          <Select id="select_habito" value={nuevoHabito} onChange={(e) => setNuevoHabito(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {HABITOS_OPCIONES.filter((opt) => !formData.antecedentes_personales_habitos.some((h) => h.tipo === opt))
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
          <SubmitButton type="button" onClick={addHabito} disabled={!nuevoHabito}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar hábito
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="alimentos_que_le_caen_mal">Alimentos que le caen mal</Label>
          <TextArea
            id="alimentos_que_le_caen_mal"
            name="alimentos_que_le_caen_mal"
            value={formData.alimentos_que_le_caen_mal}
            onChange={handleChange}
            rows={2}
            placeholder="Ej. lácteos, picante..."
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="componentes_habituales_dieta">Componentes habituales de la dieta</Label>
          <TextArea
            id="componentes_habituales_dieta"
            name="componentes_habituales_dieta"
            value={formData.componentes_habituales_dieta}
            onChange={handleChange}
            rows={2}
            placeholder="Ej. frutas, verduras, carne..."
          />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="desayuno">Desayuno habitual</Label>
          <TextArea
            id="desayuno"
            name="desayuno"
            value={formData.desayuno}
            onChange={handleChange}
            rows={2}
            placeholder="Describe el desayuno típico"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="comida">Comida habitual</Label>
          <TextArea
            id="comida"
            name="comida"
            value={formData.comida}
            onChange={handleChange}
            rows={2}
            placeholder="Describe la comida típica"
          />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="cena">Cena habitual</Label>
          <TextArea
            id="cena"
            name="cena"
            value={formData.cena}
            onChange={handleChange}
            rows={2}
            placeholder="Describe la cena típica"
          />
        </FieldGroup>
      </TwoColumnRow>

      

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
              <FaExchangeAlt style={{ marginRight: '0.5rem' }} />Tipo de cambio
            </Label>
            <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
          </FieldGroup>
        )}
      </TwoColumnRow>

      {formData.hay_cambios === 'Si' && (
        <TwoColumnRow>
          <FieldGroup>
            <Label htmlFor="cambio_causa">
              <FaExclamationCircle style={{ marginRight: '0.5rem' }} />Causa del cambio
            </Label>
            <Input id="cambio_causa" name="cambio_causa" value={formData.cambio_causa} onChange={handleChange} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cambio_tiempo">
              <FaClock style={{ marginRight: '0.5rem' }} />Tiempo
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
