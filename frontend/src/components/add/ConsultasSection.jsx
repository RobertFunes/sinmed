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
  FaCalendarAlt,
  FaBell,
  FaNotesMedical,
  FaPlusCircle,
  FaClipboardCheck,
  FaTrash,
  FaDiagnoses,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaFlask,
  FaHeartbeat,
  FaTachometerAlt,
  FaTint,
  FaVial,
} from 'react-icons/fa';
import ConfirmModal from '../ConfirmModal';

const displaySistemaLabel = (name) => {
  if (name === 'Psiquiátrico' || name === 'Psiquiatrico') return 'Psicoemocional';
  if (name === 'Reumatológico' || name === 'Reumatologico' || name === 'Reumatólogo' || name === 'Reumatologo') return 'Musculoesquelético';
  return name;
};

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
  const isMujer = (formData.genero || '').trim() === 'Mujer';

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
      <TwoColumnRow>
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
          <Label htmlFor="consulta_glucosa">
            <FaVial style={{ marginRight: '0.5rem' }} />
            Glucosa
          </Label>
          <TextArea
            id="consulta_glucosa"
            name="glucosa"
            value={formData.glucosa}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. 90 mg/dL"
          />
        </FieldGroup>
      </TwoColumnRow>
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
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="consulta_agua">
            <FaTint style={{ marginRight: '0.5rem' }} />
            Agua
          </Label>
          <Input
            id="consulta_agua"
            name="agua"
            value={formData.agua}
            onChange={handleChange}
            placeholder="Indica consumo o indicaciones de agua"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="consulta_laboratorios">
            <FaFlask style={{ marginRight: '0.5rem' }} />
            Laboratorios
          </Label>
          <TextArea
            id="consulta_laboratorios"
            name="laboratorios"
            value={formData.laboratorios}
            onChange={handleChange}
            rows={2}
            placeholder="Resultados o indicaciones de laboratorio"
          />
        </FieldGroup>
      </TwoColumnRow>
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="consulta_presion">
            <FaTachometerAlt style={{ marginRight: '0.5rem' }} />
            Presión
          </Label>
          <TextArea
            id="consulta_presion"
            name="presion"
            value={formData.presion}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. 120/80 mmHg"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="consulta_pam">
            <FaHeartbeat style={{ marginRight: '0.5rem' }} />
            PAM
          </Label>
          <Input
            id="consulta_pam"
            name="consulta_pam"
            value={formData.consulta_pam}
            onChange={handleChange}
            placeholder="Calculada o manual"
          />
        </FieldGroup>
      </TwoColumnRow>
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
          {formData.interrogatorio_aparatos.map((s, idx) => {
            const sistemaNombre = displaySistemaLabel(s.nombre);
            const sistemaNombreLower = sistemaNombre.toLowerCase();
            return (
            <ItemCard key={idx}>
              <TwoColumnRow>
                <FieldGroup>
                  <Label><FaClipboardCheck style={{ marginRight: '0.5rem' }} />Sistema</Label>
                  <Input value={sistemaNombre} disabled />
                </FieldGroup>
                <FieldGroup>
                  <Label>{`Descripción de aparato ${sistemaNombreLower}`}</Label>
                  <TextArea value={s.descripcion} onChange={(e) => updateSistemaDesc(idx, e.target.value)} rows={3} placeholder={`Detalle de ${sistemaNombreLower}`} />
                </FieldGroup>
              </TwoColumnRow>
              <ItemActions>
                <DangerButton type="button" onClick={() => requestDeleteSistema(idx)}>
                  <FaTrash />
                  <ButtonLabel>Eliminar</ButtonLabel>
                </DangerButton>
              </ItemActions>
            </ItemCard>
          );
        })}
        </ListContainer>
      )}
      {isMujer && (
        <FieldGroup>
          <Label htmlFor="consulta_fum">
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
            FUM
          </Label>
          <Input
            type="text"
            id="consulta_fum"
            name="fum"
            value={formData.fum || ''}
            onChange={handleChange}
            placeholder="Escribe la FUM"
          />
        </FieldGroup>
      )}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="select_sistema">Selecciona un sistema</Label>
          <Select id="select_sistema" value={nuevoSistema} onChange={(e) => setNuevoSistema(e.target.value)}>
            <option value="">-- Selecciona --</option>
            {SISTEMAS_OPCIONES.filter((opt) => !formData.interrogatorio_aparatos.some((s) => s.nombre === opt)).map((opt) => (
              <option key={opt} value={opt}>
                {displaySistemaLabel(opt)}
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
