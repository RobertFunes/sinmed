import React, { useState, useEffect, useRef } from 'react';
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
import { PATOLOGICOS_OPCIONES } from '../../helpers/add/catalogos';
import { FaFileMedical, FaPlusCircle, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../ConfirmModal';

const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const AntecedentesPatologicosSection = ({
  formData,
  nuevoPatologico,
  setNuevoPatologico,
  addPatologico,
  removePatologicoAt,
  updatePatologicoDesc,
  isOpen,
  onToggle,
  isLoading,
  autoFocusIndex,
  onAutoFocusHandled,
}) => {
  const [deleteCandidateIdx, setDeleteCandidateIdx] = useState(null);
  const descRefs = useRef([]);

  const selectedPatologico =
    deleteCandidateIdx !== null ? formData.antecedentes_personales_patologicos[deleteCandidateIdx] : null;

  const requestDeletePatologico = (idx) => setDeleteCandidateIdx(idx);
  const cancelDeletePatologico = () => setDeleteCandidateIdx(null);
  const confirmDeletePatologico = () => {
    if (deleteCandidateIdx === null) return;
    removePatologicoAt(deleteCandidateIdx);
    setDeleteCandidateIdx(null);
  };

  useEffect(() => {
    if (typeof autoFocusIndex === 'number') {
      const el = descRefs.current[autoFocusIndex];
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      if (typeof onAutoFocusHandled === 'function') {
        onAutoFocusHandled();
      }
    }
  }, [autoFocusIndex, onAutoFocusHandled]);

  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Antecedentes personales patológicos</Summary>

      {formData.antecedentes_personales_patologicos.length > 0 && (
        <ListContainer>
          {formData.antecedentes_personales_patologicos.map((p, idx) => (
            <ItemCard key={idx}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label>
                    <FaFileMedical style={{ marginRight: '0.5rem' }} />Antecedente
                  </Label>
                  <Input value={p.antecedente} disabled />
                </FieldGroup>
                <FieldGroup>
                  <Label>{`Descripción de antecedente: ${p.antecedente.toLowerCase()}`}</Label>
                  <TextArea
                    value={p.descripcion}
                    onChange={(e) => updatePatologicoDesc(idx, e.target.value)}
                    rows={3}
                    placeholder={`Detalle de ${p.antecedente.toLowerCase()}`}
                    ref={(el) => {
                      descRefs.current[idx] = el;
                    }}
                  />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => requestDeletePatologico(idx)}>
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
          <Label htmlFor="select_patologico">Selecciona un antecedente</Label>
          <Select
            id="select_patologico"
            value={nuevoPatologico}
            onChange={(e) => setNuevoPatologico(e.target.value)}
          >
            <option value="">-- Selecciona --</option>
            {PATOLOGICOS_OPCIONES.filter(
              (opt) => !formData.antecedentes_personales_patologicos.some((p) => normalize(p.antecedente) === normalize(opt)),
            ).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addPatologico} disabled={!nuevoPatologico || isLoading}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      <ConfirmModal
        open={deleteCandidateIdx !== null}
        onCancel={cancelDeletePatologico}
        onConfirm={confirmDeletePatologico}
        title="¿Eliminar antecedente patológico?"
        text={
          selectedPatologico
            ? `Vas a eliminar el antecedente "${selectedPatologico.antecedente}". Esta acción no se puede deshacer.`
            : 'Vas a eliminar este antecedente. Esta acción no se puede deshacer.'
        }
        confirmLabel="Eliminar"
      />
    </details>
  );
};

export default AntecedentesPatologicosSection;
