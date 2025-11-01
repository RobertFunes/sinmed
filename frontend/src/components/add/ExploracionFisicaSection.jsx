import React from 'react';
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
import {
  FaWeight,
  FaHistory,
  FaRulerVertical,
  FaBullseye,
  FaBalanceScale,
  FaChartBar,
  FaHeartbeat,
  FaHeart,
  FaThermometerHalf,
  FaRulerCombined,
  FaRulerHorizontal,
  FaStethoscope,
  FaPlusCircle,
  FaTrash,
} from 'react-icons/fa';
import { GiLungs } from 'react-icons/gi';

const ExploracionFisicaSection = ({
  formData,
  handleChange,
  isOpen,
  onToggle,
  INSPECCION_OPCIONES,
  nuevoInspeccion,
  setNuevoInspeccion,
  addInspeccion,
  removeInspeccionAt,
  updateInspeccionDesc,
}) => {
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Exploración física</Summary>

      {/* Datos antropométricos y vitales */}
      <TwoColumnRow $cols={3}>
        <FieldGroup>
          <Label htmlFor="peso_actual"><FaWeight style={{ marginRight: '0.5rem' }} />Peso actual (kg)</Label>
          <Input id="peso_actual" name="peso_actual" value={formData.peso_actual} onChange={handleChange} inputMode="decimal" placeholder="Ej. 72" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="peso_anterior"><FaHistory style={{ marginRight: '0.5rem' }} />Peso anterior (kg)</Label>
          <Input id="peso_anterior" name="peso_anterior" value={formData.peso_anterior} onChange={handleChange} inputMode="decimal" placeholder="Ej. 75" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="talla_cm"><FaRulerVertical style={{ marginRight: '0.5rem' }} />Talla (cm)</Label>
          <Input id="talla_cm" name="talla_cm" value={formData.talla_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 170" />
        </FieldGroup>
      </TwoColumnRow>
      <TwoColumnRow $cols={3}>
        <FieldGroup>
          <Label htmlFor="peso_deseado"><FaBullseye style={{ marginRight: '0.5rem' }} />Peso deseado (kg)</Label>
          <Input id="peso_deseado" name="peso_deseado" value={formData.peso_deseado} onChange={handleChange} inputMode="decimal" placeholder="Ej. 68" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="peso_ideal"><FaBalanceScale style={{ marginRight: '0.5rem' }} />Peso ideal (kg)</Label>
          <Input id="peso_ideal" name="peso_ideal" value={formData.peso_ideal} onChange={handleChange} inputMode="decimal" placeholder="Ej. 70" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="imc"><FaChartBar style={{ marginRight: '0.5rem' }} />IMC</Label>
          <Input id="imc" name="imc" value={formData.imc} readOnly placeholder="Ej. 24.90" />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow $cols={3}>
        <FieldGroup>
          <Label htmlFor="rtg"><FaHeartbeat style={{ marginRight: '0.5rem' }} />% RTG</Label>
          <Input id="rtg" name="rtg" value={formData.rtg} onChange={handleChange} inputMode="decimal" placeholder="Ej. 20" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="ta_mmhg"><FaHeart style={{ marginRight: '0.5rem' }} />TA (mmHg)</Label>
          <Input id="ta_mmhg" name="ta_mmhg" value={formData.ta_mmhg} onChange={handleChange} placeholder="Ej. 120/80" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="frecuencia_cardiaca"><FaHeart style={{ marginRight: '0.5rem' }} />FC (frecuencia cardiaca)</Label>
          <Input id="frecuencia_cardiaca" name="frecuencia_cardiaca" value={formData.frecuencia_cardiaca} onChange={handleChange} inputMode="numeric" placeholder="lpm" />
        </FieldGroup>
      </TwoColumnRow>

      <TwoColumnRow $cols={3}>
        <FieldGroup>
          <Label htmlFor="frecuencia_respiratoria"><GiLungs style={{ marginRight: '0.5rem' }} />FR (frecuencia respiratoria)</Label>
          <Input id="frecuencia_respiratoria" name="frecuencia_respiratoria" value={formData.frecuencia_respiratoria} onChange={handleChange} inputMode="numeric" placeholder="rpm" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="temperatura_c"><FaThermometerHalf style={{ marginRight: '0.5rem' }} />Temp (°C)</Label>
          <Input id="temperatura_c" name="temperatura_c" value={formData.temperatura_c} onChange={handleChange} inputMode="decimal" placeholder="Ej. 36.7" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="cadera_cm"><FaRulerCombined style={{ marginRight: '0.5rem' }} />Cadera (cm)</Label>
          <Input id="cadera_cm" name="cadera_cm" value={formData.cadera_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 95" />
        </FieldGroup>
      </TwoColumnRow>
      <TwoColumnRow $cols={4}>
        <FieldGroup>
          <Label htmlFor="cintura_cm"><FaRulerHorizontal style={{ marginRight: '0.5rem' }} />Cintura (cm)</Label>
          <Input id="cintura_cm" name="cintura_cm" value={formData.cintura_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 80" />
        </FieldGroup>
      </TwoColumnRow>

      {/* Inspección general (dinámica) */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="select_inspeccion">Inspección general</Label>
          <Select id="select_inspeccion" value={nuevoInspeccion} onChange={(e) => setNuevoInspeccion(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {INSPECCION_OPCIONES.filter((opt) => !formData.inspeccion_general.some((s) => s.nombre === opt)).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addInspeccion} disabled={!nuevoInspeccion}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      {formData.inspeccion_general.length > 0 && (
        <ListContainer>
          {formData.inspeccion_general.map((s, idx) => (
            <ItemCard key={idx}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label>
                    <FaStethoscope style={{ marginRight: '0.5rem' }} />Área
                  </Label>
                  <Input value={s.nombre} disabled />
                </FieldGroup>
                <FieldGroup>
                  <Label>{`Descripción de ${s.nombre.toLowerCase()}`}</Label>
                  <TextArea value={s.descripcion} onChange={(e) => updateInspeccionDesc(idx, e.target.value)} rows={3} placeholder={`Detalle de ${s.nombre.toLowerCase()}`} />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => removeInspeccionAt(idx)}>
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

export default ExploracionFisicaSection;

