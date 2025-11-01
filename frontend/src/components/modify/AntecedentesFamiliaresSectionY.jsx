import React from 'react';
import { FaUsers, FaPlusCircle, FaTrash } from 'react-icons/fa';
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
import { ANTECEDENTES_OPCIONES } from '../../helpers/add/catalogos';

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const AntecedentesFamiliaresSectionY = ({
  formData,
  nuevoAntecedente,
  setNuevoAntecedente,
  addAntecedente,
  removeAntecedenteAt,
  updateAntecedenteField,
  isOpen,
  onToggle,
  isLoading,
}) => {
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Antecedentes familiares</Summary>

      {/* Selector para agregar antecedente */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="select_antecedente">Selecciona un antecedente</Label>
          <Select
            id="select_antecedente"
            value={nuevoAntecedente}
            onChange={(e) => setNuevoAntecedente(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {ANTECEDENTES_OPCIONES
              .filter((opt) => {
                const selectedNames = formData.antecedentes_familiares.map((a) => (a.esOtro ? 'Otras' : a.nombre));
                return !selectedNames.some((name) => normalize(name) === normalize(opt));
              })
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addAntecedente} disabled={!nuevoAntecedente || isLoading}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar antecedente
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      {/* Lista de antecedentes seleccionados */}
      {formData.antecedentes_familiares.length > 0 && (
        <ListContainer>
          {formData.antecedentes_familiares.map((a, idx) => (
            <ItemCard key={idx}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label>
                    <FaUsers style={{ marginRight: '0.5rem' }} />
                    {a.esOtro ? 'Otra (especifique)' : 'Antecedente'}
                  </Label>
                  {a.esOtro ? (
                    <Input
                      value={a.nombre}
                      onChange={(e) => updateAntecedenteField(idx, 'nombre', e.target.value)}
                      placeholder="Especifique el antecedente"
                      maxLength={100}
                    />
                  ) : (
                    <Input value={a.nombre} disabled />
                  )}
                </FieldGroup>
                <FieldGroup>
                  <Label>Descripción</Label>
                  <TextArea
                    value={a.descripcion}
                    onChange={(e) => updateAntecedenteField(idx, 'descripcion', e.target.value)}
                    rows={3}
                    placeholder="Detalles relevantes, familiar afectado, edad de inicio, etc."
                  />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => removeAntecedenteAt(idx)}>
                  <FaTrash />
                  <ButtonLabel>Eliminar</ButtonLabel>
                </DangerButton>
              </ItemActions>
            </ItemCard>
          ))}
        </ListContainer>
      )}
    </details>
  );
};

export default AntecedentesFamiliaresSectionY;

