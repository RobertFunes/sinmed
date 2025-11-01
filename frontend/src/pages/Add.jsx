// add.jsx (actualizado con nuevos campos y sección colapsable)
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import {
  AddContainer,
  FormCard,
  Title,
  Form,
  Summary,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
  ButtonRow,
  SubmitButton,
  TwoColumnRow,
  ThreeColumnRow,
  ItemCard,
  ItemActions,
  DangerButton,
  ButtonLabel,
  ListContainer,
  AlergicoContainer,
  AlergicoOptions,
  AlergicoOption,
} from './Add.styles';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';
import {
  ANTECEDENTES_OPCIONES,
  HABITOS_OPCIONES,
  PATOLOGICOS_OPCIONES,
  SISTEMAS_OPCIONES,
  INSPECCION_OPCIONES,
} from '../helpers/add/catalogos';
import { initialState } from '../helpers/add/initialState';
import { buildNestedPayload } from '../helpers/add/buildPayload';

// iconos
import { AiFillStar } from 'react-icons/ai';
import {
  FaUser,
  FaBirthdayCake,
  FaPhone,
  FaUserPlus,
  FaGraduationCap,
  FaTint,
  FaUsers,
  FaBeer,
  FaClock,
  FaSmoking,
  FaPills,
  FaUtensils,
  FaExchangeAlt,
  FaExclamationCircle,
  FaFemale,
  FaCalendarAlt,
  FaCalendarCheck,
  FaBaby,
  FaBabyCarriage,
  FaProcedures,
  FaHeartbeat,
  FaCalendarDay,
  FaCalendarTimes,
  FaFileMedical,
  FaWeight,
  FaHistory,
  FaRulerVertical,
  FaRulerCombined,
  FaRulerHorizontal,
  FaBullseye,
  FaBalanceScale,
  FaChartBar,
  FaHeart,
  FaThermometerHalf,
  FaStethoscope,
  FaBell,
  FaNotesMedical,
  FaDiagnoses,
  FaPrescriptionBottleAlt,
  FaStickyNote,
  FaClipboardCheck,
  FaTrash,
  FaPlusCircle,
} from 'react-icons/fa';
import { MdEmail, MdHome, MdWork, MdDescription } from 'react-icons/md';
import { GiLungs } from 'react-icons/gi';
import DatosPersonalesSection from '../components/add/DatosPersonalesSection';
import AntecedentesFamiliaresSection from '../components/add/AntecedentesFamiliaresSection';
import AntecedentesPersonalesSection from '../components/add/AntecedentesPersonalesSection';
import GinecoObstetricosSection from '../components/add/GinecoObstetricosSection';
import AntecedentesPatologicosSection from '../components/add/AntecedentesPatologicosSection';
import ExploracionFisicaSection from '../components/add/ExploracionFisicaSection';




const todayISO = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const buildInitialForm = () => ({
  ...initialState,
  fecha_consulta: todayISO(),
});

const Add = () => {
  const [formData, setFormData] = useState(() => buildInitialForm());
  const nombreRef = useRef(null);
  // Control de acordeón: solo una sección abierta a la vez
  const [openSection, setOpenSection] = useState('datos');
  const handleToggle = (key) => (e) => {
    if (e.currentTarget.open) {
      // Abrir esta sección y mantener cerradas las demás
      setOpenSection(key);
    } else {
      // Solo cerrar si es la sección actualmente activa; ignorar cierres de otras
      setOpenSection((prev) => (prev === key ? null : prev));
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoAntecedente, setNuevoAntecedente] = useState('');
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [nuevoPatologico, setNuevoPatologico] = useState('');
  const [nuevoSistema, setNuevoSistema] = useState('');
  const [nuevoInspeccion, setNuevoInspeccion] = useState('');
  // Eliminado: nuevoDieta

  // Toggle exclusivo para 'alérgico': permite ninguno o sólo uno (Sí/No)
  const toggleAlergico = (valor) => (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      alergico: checked ? valor : (prev.alergico === valor ? '' : prev.alergico),
    }));
  };

  const handleChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  // Log en tiempo real cada vez que cambia el payload
  useEffect(() => {
    const livePayload = buildNestedPayload(formData);
    console.log('[Add] Payload actualizado:', livePayload);
  }, [formData]);

  // 🧮 Auto-cálculo de IMC cuando hay peso y talla
  useEffect(() => {
    const w = parseFloat(formData.peso_actual);
    const hcm = parseFloat(formData.talla_cm);
    if (Number.isFinite(w) && w > 0 && Number.isFinite(hcm) && hcm > 0) {
      const hm = hcm / 100;
      const bmi = w / (hm * hm);
      setFormData(prev => ({ ...prev, imc: bmi.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, imc: '' }));
    }
  }, [formData.peso_actual, formData.talla_cm]);

  const handleSubmit = async e => {
    e.preventDefault();

    // Validación manual para evitar el error de controles no enfocables cuando <details> está cerrado
    if (!formData.nombre.trim()) {
      setOpenSection('datos');
      setTimeout(() => {
        if (nombreRef.current) nombreRef.current.focus();
      }, 0);
      alert('El nombre es obligatorio.');
      return;
    }

    setIsSubmitting(true);

    // Construye objeto anidado y registra exactamente ese objeto
    const payload = buildNestedPayload(formData);
    console.log(payload);

    try {
      const res = await fetch(`${url}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Perfil agregado correctamente');
        setFormData(buildInitialForm());
      } else {
        alert('Ocurrió un error al agregar el perfil');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al intentar agregar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setFormData(buildInitialForm());
  const addAntecedente = () => {
    if (!nuevoAntecedente) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: [
        nuevoAntecedente === 'Otras'
          ? { nombre: '', descripcion: '', esOtro: true }
          : { nombre: nuevoAntecedente, descripcion: '' },
        ...prev.antecedentes_familiares,
      ],
    }));
    setNuevoAntecedente('');
  };
  const removeAntecedenteAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.filter((_, i) => i !== idx),
    }));
  };
  const updateAntecedenteField = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: prev.antecedentes_familiares.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  // ---- Antecedentes personales: hábitos ----
  const addHabito = () => {
    if (!nuevoHabito) return;
    const base = { tipo: nuevoHabito, campos: {} };
    if (nuevoHabito === 'Alcoholismo') base.campos = { bebidas_por_dia: '', tiempo_activo_alc: '' };
    if (nuevoHabito === 'Tabaquismo') base.campos = { cigarrillos_por_dia: '', tiempo_activo_tab: '' };
    if (nuevoHabito === 'Toxicomanías') base.campos = { tipo_toxicomania: '', tiempo_activo_tox: '' };
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: [base, ...prev.antecedentes_personales_habitos],
    }));
    setNuevoHabito('');
  };
  const removeHabitoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.filter((_, i) => i !== idx),
    }));
  };
  const updateHabitoCampo = (idx, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: prev.antecedentes_personales_habitos.map((h, i) => i === idx ? { ...h, campos: { ...h.campos, [campo]: valor } } : h),
    }));
  };

  // Eliminado: lógica de componentes de la dieta (add/remove/update)

  // ---- Antecedentes personales patológicos ----
  const addPatologico = () => {
    if (!nuevoPatologico) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: [
        { antecedente: nuevoPatologico, descripcion: '' },
        ...prev.antecedentes_personales_patologicos,
      ],
    }));
    setNuevoPatologico('');
  };
  const removePatologicoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.filter((_, i) => i !== idx),
    }));
  };
  const updatePatologicoDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: prev.antecedentes_personales_patologicos.map((p, i) => i === idx ? { ...p, descripcion: valor } : p),
    }));
  };

  // ---- Padecimiento actual e interrogatorio por aparatos y sistemas ----
  const addSistema = () => {
    if (!nuevoSistema) return;
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: [
        { nombre: nuevoSistema, descripcion: '' },
        ...prev.interrogatorio_aparatos,
      ],
    }));
    setNuevoSistema('');
  };
  const removeSistemaAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: prev.interrogatorio_aparatos.filter((_, i) => i !== idx),
    }));
  };
  const updateSistemaDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      interrogatorio_aparatos: prev.interrogatorio_aparatos.map((s, i) => i === idx ? { ...s, descripcion: valor } : s),
    }));
  };

  // ---- Consultas: personalizados (título + descripción) ----
  const addPersonalizado = () => {
    setFormData(prev => {
      const list = Array.isArray(prev.personalizados) ? prev.personalizados : [];
      if (list.length >= 10) return prev;
      return {
        ...prev,
        personalizados: [
          { nombre: '', descripcion: '' },
          ...list,
        ],
      };
    });
  };
  const removePersonalizadoAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      personalizados: (prev.personalizados || []).filter((_, i) => i !== idx),
    }));
  };
  const updatePersonalizadoField = (idx, field, valor) => {
    setFormData(prev => ({
      ...prev,
      personalizados: (prev.personalizados || []).map((p, i) => i === idx ? { ...p, [field]: valor } : p),
    }));
  };

  // ---- Exploración física: inspección general ----
  const addInspeccion = () => {
    if (!nuevoInspeccion) return;
    setFormData(prev => ({
      ...prev,
      inspeccion_general: [
        { nombre: nuevoInspeccion, descripcion: '' },
        ...prev.inspeccion_general,
      ],
    }));
    setNuevoInspeccion('');
  };
  const removeInspeccionAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.filter((_, i) => i !== idx),
    }));
  };
  const updateInspeccionDesc = (idx, valor) => {
    setFormData(prev => ({
      ...prev,
      inspeccion_general: prev.inspeccion_general.map((s, i) => i === idx ? { ...s, descripcion: valor } : s),
    }));
  };
  const Required = () => (
    <AiFillStar
      style={{
        marginLeft: '0.25rem',
        verticalAlign: 'middle',
        color: Palette.primary,
        fontSize: '2.2rem',
      }}
      title="Obligatorio"
    />
  );

  // 👩‍⚕️ Visibilidad Gineco-Obstétricos
  // Muestra la sección solo si el género NO es "Hombre" ("", "Mujer", etc.)
  const showGineco = (formData.genero || '').trim() !== 'Hombre';

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Nueva</span> historia clínica.
          </Title>

          <Form onSubmit={handleSubmit} noValidate>
            {/* 🧍 Datos personales -> payload.datos_personales */}
            <DatosPersonalesSection
              formData={formData}
              onChange={handleChange}
              isOpen={openSection === 'datos'}
              onToggle={handleToggle('datos')}
              nombreRef={nombreRef}
            />

            {/* 👪 Antecedentes familiares -> payload.antecedentes_familiares[] */}
            <AntecedentesFamiliaresSection
              formData={formData}
              nuevoAntecedente={nuevoAntecedente}
              setNuevoAntecedente={setNuevoAntecedente}
              addAntecedente={addAntecedente}
              removeAntecedenteAt={removeAntecedenteAt}
              updateAntecedenteField={updateAntecedenteField}
              isOpen={openSection === 'familiares'}
              onToggle={handleToggle('familiares')}
            />

            {/* 🧗 Hábitos y alimentación -> payload.antecedentes_personales */}
            <AntecedentesPersonalesSection
              formData={formData}
              nuevoHabito={nuevoHabito}
              setNuevoHabito={setNuevoHabito}
              addHabito={addHabito}
              removeHabitoAt={removeHabitoAt}
              updateHabitoCampo={updateHabitoCampo}
              handleChange={handleChange}
              isOpen={openSection === 'personales'}
              onToggle={handleToggle('personales')}
            />

            {/* 👶 Gineco-Obstétricos -> payload.gineco_obstetricos (solo si no es Hombre) */}
            {showGineco && (
            <GinecoObstetricosSection
              formData={formData}
              handleChange={handleChange}
              isOpen={openSection === 'gineco'}
              onToggle={handleToggle('gineco')}
              showGineco={showGineco}
            />
            )}

            {/* 🧬 Patológicos -> payload.antecedentes_personales_patologicos[] */}
            <AntecedentesPatologicosSection
              formData={formData}
              nuevoPatologico={nuevoPatologico}
              setNuevoPatologico={setNuevoPatologico}
              addPatologico={addPatologico}
              removePatologicoAt={removePatologicoAt}
              updatePatologicoDesc={updatePatologicoDesc}
              isOpen={openSection === 'patologicos'}
              onToggle={handleToggle('patologicos')}
            />

            {/* 🩺 Exploración física -> payload.exploracion_fisica */}
            <ExploracionFisicaSection
              formData={formData}
              handleChange={handleChange}
              isOpen={openSection === 'exploracion'}
              onToggle={handleToggle('exploracion')}
              INSPECCION_OPCIONES={INSPECCION_OPCIONES}
              nuevoInspeccion={nuevoInspeccion}
              setNuevoInspeccion={setNuevoInspeccion}
              addInspeccion={addInspeccion}
              removeInspeccionAt={removeInspeccionAt}
              updateInspeccionDesc={updateInspeccionDesc}
            />

            {/* 📅 Consultas (padecimiento + interrogatorio) -> payload.consultas */}
            <details open={openSection === 'consultas'} onToggle={handleToggle('consultas')}>
              <Summary>Consultas</Summary>

              {/* Alérgico (Sí/No) exclusivo, permite ninguno o uno - visual primero en Consultas */}
              <AlergicoContainer>
                <Label>Al&eacute;rgico</Label>
                <AlergicoOptions>
                  <AlergicoOption $selected={formData.alergico === 'Si'}>
                    <input
                      type="checkbox"
                      name="alergico_si"
                      checked={formData.alergico === 'Si'}
                      onChange={toggleAlergico('Si')}
                    />
                    <span>S&iacute;</span>
                  </AlergicoOption>
                  <AlergicoOption $selected={formData.alergico === 'No'}>
                    <input
                      type="checkbox"
                      name="alergico_no"
                      checked={formData.alergico === 'No'}
                      onChange={toggleAlergico('No')}
                    />
                    <span>No</span>
                  </AlergicoOption>
                </AlergicoOptions>
              </AlergicoContainer>

              {/* Subgrid 2 columnas: Fecha de consulta + Recordatorio */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="fecha_consulta"><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha de consulta</Label>
                  <Input
                    type="date"
                    id="fecha_consulta"
                    name="fecha_consulta"
                    value={formData.fecha_consulta}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="recordatorio"><FaBell style={{ marginRight: '0.5rem' }} />Recordatorio</Label>
                  <Input
                    type="date"
                    id="recordatorio"
                    name="recordatorio"
                    value={formData.recordatorio}
                    onChange={handleChange}
                  />
                </FieldGroup>
              </TwoColumnRow>

              <FieldGroup>
                <Label htmlFor="consulta_padecimiento_actual"><FaNotesMedical style={{ marginRight: '0.5rem' }} />Padecimiento actual</Label>
                <TextArea
                  id="consulta_padecimiento_actual"
                  name="padecimiento_actual"
                  value={formData.padecimiento_actual}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe el padecimiento actual"
                />
              </FieldGroup>

              {/* Selector para agregar sistemas */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_sistema">Selecciona un sistema</Label>
                  <Select
                    id="select_sistema"
                    value={nuevoSistema}
                    onChange={e => setNuevoSistema(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {SISTEMAS_OPCIONES
                      .filter(opt => !formData.interrogatorio_aparatos.some(s => s.nombre === opt))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
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

              {/* Lista de sistemas agregados */}
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
                          <Label>{`Descripci\u00f3n de aparato ${s.nombre.toLowerCase()}`}</Label>
                          <TextArea
                            value={s.descripcion}
                            onChange={e => updateSistemaDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${s.nombre.toLowerCase()}`}
                          />
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

              {/* Acción: crear tarjeta personalizada (título + descripción) */}
              <FieldGroup>
                <Label>&nbsp;</Label>
                <SubmitButton
                  type="button"
                  onClick={addPersonalizado}
                  disabled={(formData.personalizados || []).length >= 10}
                >
                  Crear personalizado
                </SubmitButton>
              </FieldGroup>

              {/* Lista de personalizados agregados */}
              {(formData.personalizados || []).length > 0 && (
                <ListContainer>
                  {formData.personalizados.map((p, idx) => (
                    <ItemCard key={`pers-${idx}`}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label>Título</Label>
                          <Input
                            value={p.nombre}
                            onChange={e => updatePersonalizadoField(idx, 'nombre', e.target.value)}
                            placeholder="Escribe el título"
                            maxLength={100}
                          />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>Descripción</Label>
                          <TextArea
                            value={p.descripcion}
                            onChange={e => updatePersonalizadoField(idx, 'descripcion', e.target.value)}
                            rows={3}
                            placeholder="Describe el contenido"
                          />
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

              <FieldGroup>
                <Label htmlFor="consulta_diagnostico"><FaDiagnoses style={{ marginRight: '0.5rem' }} />Diagnóstico</Label>
                <TextArea
                  id="consulta_diagnostico"
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Escribe el diagnóstico clínico"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="consulta_tratamiento"><FaPrescriptionBottleAlt style={{ marginRight: '0.5rem' }} />Tratamiento</Label>
                <TextArea
                  id="consulta_tratamiento"
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Plan de tratamiento"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="consulta_notas"><FaStickyNote style={{ marginRight: '0.5rem' }} />Notas</Label>
                <TextArea
                  id="consulta_notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Notas de la consulta"
                />
              </FieldGroup>

              {/* Selector para agregar sistemas */}
              

              {/* Lista de sistemas agregados */}
              {false && (
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
                          <TextArea
                            value={s.descripcion}
                            onChange={e => updateSistemaDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${s.nombre.toLowerCase()}`}
                          />
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
            </details>

            {/* Botonera */}
            <ButtonRow>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Grabando...' : 'Grabar en base de datos'}
              </SubmitButton>
            </ButtonRow>
          </Form>
        </FormCard>
      </AddContainer>
    </>
  );
};

export default Add;
