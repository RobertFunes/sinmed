import React, { useState } from 'react';
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
import ConfirmModal from '../ConfirmModal';

const AntecedentesFamiliaresSection = ({
  formData,
  nuevoAntecedente,
  setNuevoAntecedente,
  addAntecedente,
  removeAntecedenteAt,
  updateAntecedenteField,
  isOpen,
  onToggle,
}) => {
  const [deleteCandidateIndex, setDeleteCandidateIndex] = useState(null);

  const selectedAntecedente =
    deleteCandidateIndex !== null ? formData.antecedentes_familiares[deleteCandidateIndex] : null;

  const requestDeleteAntecedente = (idx) => {
    setDeleteCandidateIndex(idx);
  };

  const cancelDeleteAntecedente = () => {
    setDeleteCandidateIndex(null);
  };

  const confirmDeleteAntecedente = () => {
    if (deleteCandidateIndex === null) return;
    removeAntecedenteAt(deleteCandidateIndex);
    setDeleteCandidateIndex(null);
  };

  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Antecedentes familiares</Summary>

      {/* Selector para agregar antecedente */}
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
                <DangerButton type="button" onClick={() => requestDeleteAntecedente(idx)}>
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
          <Label htmlFor="select_antecedente">Selecciona un antecedente</Label>
          <Select
            id="select_antecedente"
            value={nuevoAntecedente}
            onChange={(e) => setNuevoAntecedente(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {ANTECEDENTES_OPCIONES.filter(() => true)
              .filter((opt) => {
                const selectedNames = formData.antecedentes_familiares.map((a) => (a.esOtro ? 'Otras' : a.nombre));
                return !selectedNames.includes(opt);
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
          <SubmitButton type="button" onClick={addAntecedente} disabled={!nuevoAntecedente}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar antecedente
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>
    
      <ConfirmModal
        open={deleteCandidateIndex !== null}
        onCancel={cancelDeleteAntecedente}
        onConfirm={confirmDeleteAntecedente}
        title="¿Eliminar antecedente?"
        text={
          selectedAntecedente
            ? `Vas a eliminar el antecedente "${selectedAntecedente.nombre}". Esta acción no se puede deshacer.`
            : 'Vas a eliminar este antecedente. Esta acción no se puede deshacer.'
        }
        confirmLabel="Eliminar"
      />
    </details>
  );
};

export default AntecedentesFamiliaresSection;
