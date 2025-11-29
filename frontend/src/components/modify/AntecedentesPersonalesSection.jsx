import React, { useEffect, useState } from 'react';
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
  habitoAlcoholRef,
  habitoTabaquismoRef,
  habitoToxicoRef,
  calidadRef,
  alimentosCaenMalRef,
  componentesDietaRef,
  desayunoRef,
  comidaRef,
  cenaRef,
  hayCambiosRef,
  cambioTipoRef,
  cambioCausaRef,
  cambioTiempoRef,
  vacunasRef,
  habitoAlcoholBebidasRef,
  habitoAlcoholTiempoActivoRef,
  habitoAlcoholTiempoInactivoRef,
  habitoTabaCigsRef,
  habitoTabaTiempoActivoRef,
  habitoTabaTiempoInactivoRef,
  habitoToxTipoRef,
  habitoToxTiempoActivoRef,
  habitoToxTiempoInactivoRef,
}) => {
  const [deleteCandidateIdx, setDeleteCandidateIdx] = useState(null);
  const [vacunasRespuesta, setVacunasRespuesta] = useState(() =>
    (formData.vacunas && formData.vacunas.trim().length) ? 'Si' : ''
  );

  useEffect(() => {
    if ((formData.vacunas || '').trim().length && vacunasRespuesta !== 'Si') {
      setVacunasRespuesta('Si');
    }
  }, [formData.vacunas, vacunasRespuesta]);

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
                        ref={habitoAlcoholBebidasRef}
                        value={h.campos?.bebidas_por_dia ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'bebidas_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 2"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`freq_${idx}`}
                        ref={habitoAlcoholTiempoActivoRef}
                        value={h.campos?.tiempo_activo_alc ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_alc', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`inactivo_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`inactivo_${idx}`}
                        ref={habitoAlcoholTiempoInactivoRef}
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
                      <Label htmlFor={`cigs_${idx}`}>Cigarrillos por día</Label>
                      <Input
                        id={`cigs_${idx}`}
                        ref={habitoTabaCigsRef}
                        value={h.campos?.cigarrillos_por_dia ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'cigarrillos_por_dia', e.target.value)}
                        inputMode="numeric"
                        placeholder="Ej. 10"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tiempo_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tiempo_${idx}`}
                        ref={habitoTabaTiempoActivoRef}
                        value={h.campos?.tiempo_activo_tab ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tab', e.target.value)}
                        placeholder="Ej. 5 años"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`inactivo_tab_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`inactivo_tab_${idx}`}
                        ref={habitoTabaTiempoInactivoRef}
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
                        ref={habitoToxTipoRef}
                        value={h.campos?.tipo_toxicomania ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tipo_toxicomania', e.target.value)}
                        placeholder="Sustancia"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tox_freq_${idx}`}>Tiempo activo</Label>
                      <Input
                        id={`tox_freq_${idx}`}
                        ref={habitoToxTiempoActivoRef}
                        value={h.campos?.tiempo_activo_tox ?? ''}
                        onChange={(e) => updateHabitoCampo(idx, 'tiempo_activo_tox', e.target.value)}
                        placeholder="Ej. diario, esporádico"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor={`tox_inactivo_${idx}`}>Tiempo inactivo</Label>
                      <Input
                        id={`tox_inactivo_${idx}`}
                        ref={habitoToxTiempoInactivoRef}
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
          <Select
            id="calidad"
            name="calidad"
            ref={calidadRef}
            value={formData.calidad}
            onChange={handleChange}
          >
            <option value="">-- Selecciona --</option>
            <option value="Buena">Buena</option>
            <option value="Regular">Regular</option>
            <option value="Mala">Mala</option>
          </Select>
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="alimentos_que_le_caen_mal">Alimentos que le caen mal</Label>
          <TextArea
            id="alimentos_que_le_caen_mal"
            name="alimentos_que_le_caen_mal"
            ref={alimentosCaenMalRef}
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
            ref={componentesDietaRef}
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
            ref={desayunoRef}
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
            ref={comidaRef}
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
            ref={cenaRef}
            value={formData.cena}
            onChange={handleChange}
            rows={2}
            placeholder="Describe la cena típica"
          />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="vacunas_select">Vacunas</Label>
          <Select
            id="vacunas_select"
            value={vacunasRespuesta}
            onChange={(e) => {
              const value = e.target.value;
              setVacunasRespuesta(value);
              if (value !== 'Si') {
                handleChange({ target: { name: 'vacunas', value: '' } });
              } else if (!formData.vacunas) {
                handleChange({ target: { name: 'vacunas', value: '' } });
              }
            }}
          >
            <option value="">-- Selecciona --</option>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </Select>
        </FieldGroup>
        {vacunasRespuesta === 'Si' && (
          <FieldGroup>
            <Label htmlFor="vacunas">¿Cuál?</Label>
            <Input
              id="vacunas"
              name="vacunas"
              ref={vacunasRef}
              value={formData.vacunas}
              onChange={handleChange}
              placeholder="Especifica las vacunas"
            />
          </FieldGroup>
        )}
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="hay_cambios">Cambios en la alimentación</Label>
          <Select
            id="hay_cambios"
            name="hay_cambios"
            ref={hayCambiosRef}
            value={formData.hay_cambios}
            onChange={handleChange}
          >
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
            <Input
              id="cambio_tipo"
              name="cambio_tipo"
              ref={cambioTipoRef}
              value={formData.cambio_tipo}
              onChange={handleChange}
            />
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
            <Input
              id="cambio_causa"
              name="cambio_causa"
              ref={cambioCausaRef}
              value={formData.cambio_causa}
              onChange={handleChange}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cambio_tiempo">
              <FaClock style={{ marginRight: '0.5rem' }} />
              Tiempo
            </Label>
            <Input
              id="cambio_tiempo"
              name="cambio_tiempo"
              ref={cambioTiempoRef}
              value={formData.cambio_tiempo}
              onChange={handleChange}
              placeholder="Ej. 6 meses"
            />
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

