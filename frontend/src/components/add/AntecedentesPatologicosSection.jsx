import React from 'react';
import { FaFileMedical, FaPlusCircle, FaTrash } from 'react-icons/fa';
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

const AntecedentesPatologicosSection = ({
  formData,
  nuevoPatologico,
  setNuevoPatologico,
  addPatologico,
  removePatologicoAt,
  updatePatologicoDesc,
  isOpen,
  onToggle,
}) => {
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Antecedentes personales patológicos</Summary>

      {/* Selector para agregar patológico */}
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
              (opt) => !formData.antecedentes_personales_patologicos.some((p) => p.antecedente === opt),
            ).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addPatologico} disabled={!nuevoPatologico}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      {/* Lista de patológicos agregados */}
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
                  />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => removePatologicoAt(idx)}>
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

export default AntecedentesPatologicosSection;

