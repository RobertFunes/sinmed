import React, { useState } from 'react';
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
import ConfirmModal from '../ConfirmModal';

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
  const [deleteTarget, setDeleteTarget] = useState(null);

  const selectedItem = (() => {
    if (!deleteTarget) return null;
    if (deleteTarget.type === 'personalizado') {
      const list = formData.personalizados || [];
      return list[deleteTarget.index] || null;
    }
    return formData.interrogatorio_aparatos[deleteTarget.index] || null;
  })();

  const requestDeletePersonalizado = (idx) => setDeleteTarget({ type: 'personalizado', index: idx });
  const requestDeleteSistema = (idx) => setDeleteTarget({ type: 'sistema', index: idx });
  const cancelDelete = () => setDeleteTarget(null);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'personalizado') {
      removePersonalizadoAt(deleteTarget.index);
    } else if (deleteTarget.type === 'sistema') {
      removeSistemaAt(deleteTarget.index);
    }
    setDeleteTarget(null);
  };

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
          <Label htmlFor="consulta_recordatorio"><FaBell style={{ marginRight: '0.5rem' }} />Recordatorio</Label>
          <Input
            type="date"
            id="consulta_recordatorio"
            name="consulta_recordatorio"
            value={formData.consulta_recordatorio}
            onChange={handleChange}
          />
        </FieldGroup>
      </TwoColumnRow>
      <FieldGroup>
        <Label>Oreja</Label>
        <AlergicoOptions>
          <AlergicoOption $selected={formData.oreja === 'izquierda'}>
            <input
              type="checkbox"
              name="oreja_izquierda"
              checked={formData.oreja === 'izquierda'}
              onChange={(e) => {
                const next = e.target.checked ? 'izquierda' : (formData.oreja === 'izquierda' ? '' : formData.oreja);
                handleChange({ target: { name: 'oreja', value: next } });
              }}
            />
            <span>Izquierda</span>
          </AlergicoOption>
          <AlergicoOption $selected={formData.oreja === 'derecha'}>
            <input
              type="checkbox"
              name="oreja_derecha"
              checked={formData.oreja === 'derecha'}
              onChange={(e) => {
                const next = e.target.checked ? 'derecha' : (formData.oreja === 'derecha' ? '' : formData.oreja);
                handleChange({ target: { name: 'oreja', value: next } });
              }}
            />
            <span>Derecha</span>
          </AlergicoOption>
        </AlergicoOptions>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="consulta_padecimiento_actual"><FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual</Label>
        <TextArea id="consulta_padecimiento_actual" name="padecimiento_actual" value={formData.padecimiento_actual} onChange={handleChange} rows={3} placeholder="Describe el padecimiento actual" />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="consulta_diagnostico"><FaDiagnoses style={{ marginRight: '0.5rem' }} />Diagnóstico</Label>
        <TextArea
          id="consulta_diagnostico"
          name="diagnostico"
          value={formData.diagnostico}
          onChange={handleChange}
          rows={4}
          placeholder="Especifica el diagnóstico"
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="consulta_medicamentos"><FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Medicamentos y suplementos</Label>
        <TextArea
          id="consulta_medicamentos"
          name="medicamentos"
          value={formData.medicamentos}
          onChange={handleChange}
          rows={3}
          placeholder="Medicamentos actuales o recetados"
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="consulta_tratamiento"><FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Tratamiento</Label>
        <TextArea
          id="consulta_tratamiento"
          name="tratamiento"
          value={formData.tratamiento}
          onChange={handleChange}
          rows={4}
          placeholder="Describe el plan de tratamiento"
        />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="consulta_notas"><FaStickyNote style={{ marginRight: '0.5rem' }} />Notas</Label>
        <TextArea
          id="consulta_notas"
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Notas adicionales"
        />
      </FieldGroup>
      
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
                <DangerButton type="button" onClick={() => requestDeleteSistema(idx)}>
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
          
          <SubmitButton type="button" onClick={addSistema} disabled={!nuevoSistema}>
            <FaPlusCircle style={{ marginRight: '0.5rem' }} />
            Agregar
          </SubmitButton>
        </FieldGroup>
      </TwoColumnRow>
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
                <DangerButton type="button" onClick={() => requestDeletePersonalizado(idx)}>
                  <FaTrash />
                  <ButtonLabel>Eliminar</ButtonLabel>
                </DangerButton>
              </ItemActions>
            </ItemCard>
          ))}
        </ListContainer>
      )}
      
      <FieldGroup style={{ marginTop:'40px' }}>
        <SubmitButton type="button" onClick={addPersonalizado} disabled={(formData.personalizados || []).length >= 10}>
          Crear personalizado
        </SubmitButton>
      </FieldGroup>
      <ConfirmModal
        open={deleteTarget !== null}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="¿Eliminar elemento?"
        text={
          deleteTarget?.type === 'personalizado'
            ? selectedItem
              ? `Vas a eliminar el personalizado "${selectedItem.nombre || 'Sin título'}". Esta acción no se puede deshacer.`
              : 'Vas a eliminar este personalizado. Esta acción no se puede deshacer.'
            : selectedItem
              ? `Vas a eliminar el sistema "${selectedItem.nombre}". Esta acción no se puede deshacer.`
              : 'Vas a eliminar este sistema. Esta acción no se puede deshacer.'
        }
        confirmLabel="Eliminar"
      />
    </details>
  );
};

export default ConsultasSection;
