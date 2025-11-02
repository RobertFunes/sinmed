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
  AlergicoContainer,
  AlergicoOptions,
  AlergicoOption,
} from '../../pages/Add.styles';
import {
  FaCalendarDay,
  FaBell,
  FaNotesMedical,
  FaPlusCircle,
  FaClipboardCheck,
  FaTrash,
  FaDiagnoses,
  FaPrescriptionBottleAlt,
  FaStickyNote,
} from 'react-icons/fa';

const ConsultasSection = ({
  formData,
  handleChange,
  isOpen,
  onToggle,
  SISTEMAS_OPCIONES,
  nuevoSistema,
  setNuevoSistema,
  addSistema,
  removeSistemaAt,
  updateSistemaDesc,
  addPersonalizado,
  removePersonalizadoAt,
  updatePersonalizadoField,
  toggleAlergico,
}) => {
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>Consultas</Summary>

      <AlergicoContainer>
        <Label>Alérgico</Label>
        <AlergicoOptions>
          <AlergicoOption $selected={formData.alergico === 'Si'}>
            <input type="checkbox" name="alergico_si" checked={formData.alergico === 'Si'} onChange={toggleAlergico('Si')} />
            <span>Sí</span>
          </AlergicoOption>
          <AlergicoOption $selected={formData.alergico === 'No'}>
            <input type="checkbox" name="alergico_no" checked={formData.alergico === 'No'} onChange={toggleAlergico('No')} />
            <span>No</span>
          </AlergicoOption>
        </AlergicoOptions>
      </AlergicoContainer>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="fecha_consulta"><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta</Label>
          <Input type="date" id="fecha_consulta" name="fecha_consulta" value={formData.fecha_consulta} onChange={handleChange} />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="recordatorio"><FaBell style={{ marginRight: '0.5rem' }} />Recordatorio</Label>
          <Input type="date" id="recordatorio" name="recordatorio" value={formData.recordatorio} onChange={handleChange} />
        </FieldGroup>
      </TwoColumnRow>

      <FieldGroup>
        <Label htmlFor="consulta_padecimiento_actual"><FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual</Label>
        <TextArea id="consulta_padecimiento_actual" name="padecimiento_actual" value={formData.padecimiento_actual} onChange={handleChange} rows={6} placeholder="Describe el padecimiento actual" />
      </FieldGroup>

      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="select_sistema">Selecciona un sistema</Label>
          <Select id="select_sistema" value={nuevoSistema} onChange={(e) => setNuevoSistema(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {SISTEMAS_OPCIONES.filter((opt) => !formData.interrogatorio_aparatos.some((s) => s.nombre === opt)).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label>&nbsp;</Label>
          <SubmitButton type="button" onClick={addSistema} disabled={!nuevoSistema}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>

      {formData.interrogatorio_aparatos.length > 0 && (
        <ListContainer>
          {formData.interrogatorio_aparatos.map((s, idx) => (
            <ItemCard key={idx}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label><FaClipboardCheck style={{ marginRight: '0.5rem' }} />Sistema</Label>
                  <Input value={s.nombre} disabled />
                </FieldGroup>
                <FieldGroup>
                  <Label>{`Descripción de aparato ${s.nombre.toLowerCase()}`}</Label>
                  <TextArea value={s.descripcion} onChange={(e) => updateSistemaDesc(idx, e.target.value)} rows={3} placeholder={`Detalle de ${s.nombre.toLowerCase()}`} />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => removeSistemaAt(idx)}>
                  <FaTrash />
                  <ButtonLabel>Eliminar</ButtonLabel>
                </DangerButton>
              </ItemActions>
            </ItemCard>
          ))}
        </ListContainer>
      )}

      <FieldGroup>
        <Label>&nbsp;</Label>
        <SubmitButton type="button" onClick={addPersonalizado} disabled={(formData.personalizados || []).length >= 10}>
          Crear personalizado
        </SubmitButton>
      </FieldGroup>

      {(formData.personalizados || []).length > 0 && (
        <ListContainer>
          {formData.personalizados.map((p, idx) => (
            <ItemCard key={`pers-${idx}`}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label>Título</Label>
                  <Input value={p.nombre} onChange={(e) => updatePersonalizadoField(idx, 'nombre', e.target.value)} placeholder="Escribe el título" maxLength={100} />
                </FieldGroup>
                <FieldGroup>
                  <Label>Descripción</Label>
                  <TextArea value={p.descripcion} onChange={(e) => updatePersonalizadoField(idx, 'descripcion', e.target.value)} rows={3} placeholder="Describe el contenido" />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => removePersonalizadoAt(idx)}>
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

export default ConsultasSection;

