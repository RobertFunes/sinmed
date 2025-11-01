import React from 'react';
import {
  Summary,
  TwoColumnRow,
  FieldGroup,
  Label,
  Input,
  Select,
} from '../../pages/Add.styles';
import {
  FaFemale,
  FaCalendarAlt,
  FaTint,
  FaCalendarCheck,
  FaPills,
  FaBaby,
  FaBabyCarriage,
  FaProcedures,
  FaHeartbeat,
  FaCalendarDay,
  FaCalendarTimes,
} from 'react-icons/fa';

const GinecoObstetricosSection = ({ formData, handleChange, isOpen, onToggle, showGineco }) => {
  if (!showGineco) return null;
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Gineco-Obstetricos</Summary>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_edad_menarca">
            <FaFemale style={{ marginRight: '0.5rem' }} />Edad de la primera menstruacion
          </Label>
          <Input id="gineco_edad_menarca" name="gineco_edad_menarca" value={formData.gineco_edad_menarca} onChange={handleChange} placeholder="Ej. 12" inputMode="numeric" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_ciclo">
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />Ciclo/Dias
          </Label>
          <Input id="gineco_ciclo" name="gineco_ciclo" value={formData.gineco_ciclo} onChange={handleChange} placeholder="Ej. 28 dias" />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_cantidad">
            <FaTint style={{ marginRight: '0.5rem' }} />Cantidad
          </Label>
          <Input id="gineco_cantidad" name="gineco_cantidad" value={formData.gineco_cantidad} onChange={handleChange} placeholder="Ej. Moderado" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_dolor">Dolor</Label>
          <Select id="gineco_dolor" name="gineco_dolor" value={formData.gineco_dolor} onChange={handleChange}>
            <option value="">-- Selecciona --</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </Select>
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_fecha_ultima_menstruacion">
            <FaCalendarCheck style={{ marginRight: '0.5rem' }} />Fecha de la ultima menstruacion
          </Label>
          <Input id="gineco_fecha_ultima_menstruacion" name="gineco_fecha_ultima_menstruacion" type="date" value={formData.gineco_fecha_ultima_menstruacion} onChange={handleChange} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_vida_sexual_activa">Vida sexual activa</Label>
          <Select id="gineco_vida_sexual_activa" name="gineco_vida_sexual_activa" value={formData.gineco_vida_sexual_activa} onChange={handleChange}>
            <option value="">-- Selecciona --</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </Select>
        </FieldGroup>
      </TwoColumnRow>

      {formData.gineco_vida_sexual_activa === 'Si' ? (
        <TwoColumnRow>
          <FieldGroup>
            <Label htmlFor="gineco_anticoncepcion">Anticoncepcion</Label>
            <Select id="gineco_anticoncepcion" name="gineco_anticoncepcion" value={formData.gineco_anticoncepcion} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              <option value="Si">Si</option>
              <option value="No">No</option>
            </Select>
          </FieldGroup>
          {formData.gineco_anticoncepcion === 'Si' ? (
            <FieldGroup>
              <Label htmlFor="gineco_tipo_anticonceptivo">
                <FaPills style={{ marginRight: '0.5rem' }} />Tipo de anticonceptivo
              </Label>
              <Input id="gineco_tipo_anticonceptivo" name="gineco_tipo_anticonceptivo" value={formData.gineco_tipo_anticonceptivo} onChange={handleChange} placeholder="Ej. DIU, Implante, Pastillas" />
            </FieldGroup>
          ) : null}
        </TwoColumnRow>
      ) : null}

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_gestas">
            <FaBaby style={{ marginRight: '0.5rem' }} />Gestas
          </Label>
          <Input id="gineco_gestas" name="gineco_gestas" value={formData.gineco_gestas} onChange={handleChange} inputMode="numeric" placeholder="Ej. 2" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_partos">
            <FaBabyCarriage style={{ marginRight: '0.5rem' }} />Partos
          </Label>
          <Input id="gineco_partos" name="gineco_partos" value={formData.gineco_partos} onChange={handleChange} inputMode="numeric" placeholder="Ej. 1" />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_cesareas">
            <FaProcedures style={{ marginRight: '0.5rem' }} />Cesareas
          </Label>
          <Input id="gineco_cesareas" name="gineco_cesareas" value={formData.gineco_cesareas} onChange={handleChange} inputMode="numeric" placeholder="Ej. 0" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_abortos">
            <FaHeartbeat style={{ marginRight: '0.5rem' }} />Abortos
          </Label>
          <Input id="gineco_abortos" name="gineco_abortos" value={formData.gineco_abortos} onChange={handleChange} inputMode="numeric" placeholder="Ej. 0" />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="gineco_fecha_ultimo_parto">
            <FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha del ultimo parto
          </Label>
          <Input id="gineco_fecha_ultimo_parto" name="gineco_fecha_ultimo_parto" type="date" value={formData.gineco_fecha_ultimo_parto} onChange={handleChange} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="gineco_fecha_menopausia">
            <FaCalendarTimes style={{ marginRight: '0.5rem' }} />Fecha de menopausia
          </Label>
          <Input id="gineco_fecha_menopausia" name="gineco_fecha_menopausia" type="date" value={formData.gineco_fecha_menopausia} onChange={handleChange} />
        </FieldGroup>
      </TwoColumnRow>
    </details>
  );
};

export default GinecoObstetricosSection;

