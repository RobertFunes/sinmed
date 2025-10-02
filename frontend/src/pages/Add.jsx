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
            <details open={openSection === 'datos'} onToggle={handleToggle('datos')}>
              <Summary>
                Datos personales
              </Summary>

              {/* Nombre (requerido) y Género */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="nombre">
                    <FaUser style={{ marginRight: '0.5rem' }} />
                    Nombre
                    <Required />
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    ref={nombreRef}
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Nombre completo"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="genero">
                    {/* icon removed */}
                    Género
                  </Label>
                  <Select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="NA">NA</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>

              {/* Fecha de nacimiento y Teléfono */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="fecha_nacimiento">
                    <FaBirthdayCake style={{ marginRight: '0.5rem' }} />
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="telefono_movil">
                    <FaPhone style={{ marginRight: '0.5rem' }} />
                    Teléfono móvil
                  </Label>
                  <Input
                    id="telefono_movil"
                    type="tel"
                    name="telefono_movil"
                    value={formData.telefono_movil}
                    onChange={handleChange}
                    maxLength={20}
                    placeholder="Ej. +525512345678"
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Correo y Referido por */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="correo_electronico">
                    <MdEmail style={{ marginRight: '0.5rem' }} />
                    Correo electrónico
                  </Label>
                  <Input
                    id="correo_electronico"
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="mail@ejemplo.com"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="referido_por">
                    <FaUserPlus style={{ marginRight: '0.5rem' }} />
                    Referido por
                  </Label>
                  <Input
                    id="referido_por"
                    name="referido_por"
                    value={formData.referido_por}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="Persona o canal de referencia"
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Dirección Completa (full width) */}
              <FieldGroup>
                <Label htmlFor="residencia">
                  <MdHome style={{ marginRight: '0.5rem' }} />
                  Dirección Completa
                </Label>
                <TextArea
                  id="residencia"
                  name="residencia"
                  value={formData.residencia}
                  onChange={handleChange}
                  maxLength={255}
                  rows={4}
                  placeholder="Calle, número, colonia, ciudad, CP"
                />
              </FieldGroup>

              

              {/* Ocupación y Escolaridad */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="ocupacion">
                    <MdWork style={{ marginRight: '0.5rem' }} />
                    Ocupación
                  </Label>
                  <Input
                    id="ocupacion"
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="escolaridad">
                    <FaGraduationCap style={{ marginRight: '0.5rem' }} />
                    Escolaridad
                  </Label>
                  <Input
                    id="escolaridad"
                    name="escolaridad"
                    value={formData.escolaridad}
                    onChange={handleChange}
                    maxLength={100}
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Estado civil y Tipo de sangre */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="estado_civil">
                    Estado civil
                  </Label>
                  <Select
                    id="estado_civil"
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Soltero">Soltero</option>
                    <option value="Casado">Casado</option>
                    <option value="Divorciado">Divorciado</option>
                    <option value="Viudo">Viudo</option>
                    <option value="Union libre">Union libre</option>
                    <option value="Otro">Otro</option>
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="tipo_sangre">
                    <FaTint style={{ marginRight: '0.5rem' }} />
                    Tipo de sangre
                  </Label>
                  <Input
                    id="tipo_sangre"
                    name="tipo_sangre"
                    value={formData.tipo_sangre}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="Ej. O+, A-"
                  />
                </FieldGroup>
              </TwoColumnRow>

              {/* Alérgico (Sí/No) exclusivo, permite ninguno o uno */}
              <AlergicoContainer>
                <Label>Alérgico</Label>
                <AlergicoOptions>
                  <AlergicoOption $selected={formData.alergico === 'Si'}>
                    <input
                      type="checkbox"
                      name="alergico_si"
                      checked={formData.alergico === 'Si'}
                      onChange={toggleAlergico('Si')}
                    />
                    <span>Sí</span>
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
              {/* Eliminado: fila separada de Referido por (se movió junto a Correo) */}
            </details>

            {/* 👪 Antecedentes familiares -> payload.antecedentes_familiares[] */}
            <details open={openSection === 'familiares'} onToggle={handleToggle('familiares')}>
              <Summary>Antecedentes familiares</Summary>

              {/* Selector para agregar antecedente */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_antecedente">Selecciona un antecedente</Label>
                  <Select
                    id="select_antecedente"
                    value={nuevoAntecedente}
                    onChange={e => setNuevoAntecedente(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {ANTECEDENTES_OPCIONES
                      .filter(opt => {
                        const selectedNames = formData.antecedentes_familiares.map(a => (a.esOtro ? 'Otras' : a.nombre));
                        return !selectedNames.includes(opt);
                      })
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
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

              {/* Lista de antecedentes seleccionados */}
              {formData.antecedentes_familiares.length > 0 && (
                <ListContainer>
                  {formData.antecedentes_familiares.map((a, idx) => (
                    <ItemCard key={idx}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label><FaUsers style={{ marginRight: '0.5rem' }} />{a.esOtro ? 'Otra (especifique)' : 'Antecedente'}</Label>
                          {a.esOtro ? (
                            <Input
                              value={a.nombre}
                              onChange={e => updateAntecedenteField(idx, 'nombre', e.target.value)}
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
                            onChange={e => updateAntecedenteField(idx, 'descripcion', e.target.value)}
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

            {/* 🧗 Hábitos y alimentación -> payload.antecedentes_personales */}
            <details open={openSection === 'personales'} onToggle={handleToggle('personales')}>
              <Summary>
                Antecedentes personales
              </Summary>
              {/* Select dinámico: Alcoholismo / Tabaquismo / Toxicomanías */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_habito">Selecciona hábito</Label>
                  <Select
                    id="select_habito"
                    value={nuevoHabito}
                    onChange={e => setNuevoHabito(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {HABITOS_OPCIONES
                      .filter(opt => !formData.antecedentes_personales_habitos.some(h => h.tipo === opt))
                      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addHabito} disabled={!nuevoHabito}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar hábito
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {formData.antecedentes_personales_habitos.length > 0 && (
                <ListContainer>
                  {formData.antecedentes_personales_habitos.map((h, idx) => (
                    <ItemCard key={idx}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{h.tipo}</strong>
                      <TwoColumnRow>
                        {h.tipo === 'Alcoholismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`bebidas_${idx}`}>Alcohol: Bebidas por día</Label>
                              <Input
                                id={`bebidas_${idx}`}
                                value={h.campos.bebidas_por_dia}
                                onChange={e => updateHabitoCampo(idx, 'bebidas_por_dia', e.target.value)}
                                inputMode="numeric"
                                placeholder="Ej. 2"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`freq_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`freq_${idx}`}
                                value={h.campos.tiempo_activo_alc}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_alc', e.target.value)}
                                placeholder="Ej. 5 años"
                              />
                            </FieldGroup>
                          </>
                        )}

                        {h.tipo === 'Tabaquismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`cigs_${idx}`}>Cigarrillos por día</Label>
                              <Input
                                id={`cigs_${idx}`}
                                value={h.campos.cigarrillos_por_dia}
                                onChange={e => updateHabitoCampo(idx, 'cigarrillos_por_dia', e.target.value)}
                                inputMode="numeric"
                                placeholder="Ej. 10"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`tiempo_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`tiempo_${idx}`}
                                value={h.campos.tiempo_activo_tab}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_tab', e.target.value)}
                                placeholder="Ej. 5 años"
                              />
                            </FieldGroup>
                          </>
                        )}

                        {h.tipo === 'Toxicomanías' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`tox_${idx}`}>Tipo de toxicomanía</Label>
                              <Input
                                id={`tox_${idx}`}
                                value={h.campos.tipo_toxicomania}
                                onChange={e => updateHabitoCampo(idx, 'tipo_toxicomania', e.target.value)}
                                placeholder="Sustancia"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`tox_freq_${idx}`}>Tiempo activo</Label>
                              <Input
                                id={`tox_freq_${idx}`}
                                value={h.campos.tiempo_activo_tox}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo_tox', e.target.value)}
                                placeholder="Ej. diario, esporádico"
                              />
                            </FieldGroup>
                          </>
                        )}
                      </TwoColumnRow>

                      <ItemActions>
                        <DangerButton type="button" onClick={() => removeHabitoAt(idx)}>
                          <FaTrash />
                          <ButtonLabel>Eliminar</ButtonLabel>
                        </DangerButton>
                      </ItemActions>
                    </ItemCard>
                  ))}
                </ListContainer>
              )}

              {/* Eliminado: Select y lista de componentes de la dieta */}

              {/* Campos fijos */}
              <TwoColumnRow>
                {/* Eliminado: Vacunación */}
                <FieldGroup>
                  <Label htmlFor="alimentacion_calidad">Alimentación (calidad)</Label>
                  <Select id="calidad" name="calidad" value={formData.calidad} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Buena">Buena</option>
                    <option value="Regular">Regular</option>
                    <option value="Mala">Mala</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>

              <FieldGroup>
                <Label htmlFor="alimentacion_descripcion"><FaUtensils style={{ marginRight: '0.5rem' }} />Descripción de la alimentación</Label>
                <TextArea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} placeholder="Describe la alimentación del paciente" />
              </FieldGroup>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="hay_cambios">Cambios en la alimentación</Label>
                  <Select id="hay_cambios" name="hay_cambios" value={formData.hay_cambios} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>
                {formData.hay_cambios === 'Si' && (
                  <FieldGroup>
                    <Label htmlFor="cambio_tipo"><FaExchangeAlt style={{ marginRight: '0.5rem' }} />Tipo de cambio</Label>
                    <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
                  </FieldGroup>
                )}
              </TwoColumnRow>

              {formData.hay_cambios === 'Si' && (
                <TwoColumnRow>
                  <FieldGroup>
                    <Label htmlFor="cambio_causa"><FaExclamationCircle style={{ marginRight: '0.5rem' }} />Causa del cambio</Label>
                    <Input id="cambio_causa" name="cambio_causa" value={formData.cambio_causa} onChange={handleChange} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label htmlFor="cambio_tiempo"><FaClock style={{ marginRight: '0.5rem' }} />Tiempo</Label>
                    <Input id="cambio_tiempo" name="cambio_tiempo" value={formData.cambio_tiempo} onChange={handleChange} placeholder="Ej. 6 meses" />
                  </FieldGroup>
                </TwoColumnRow>
              )}
            </details>

            {/* 👶 Gineco-Obstétricos -> payload.gineco_obstetricos (solo si no es Hombre) */}
            {showGineco && (
            <details open={openSection === 'gineco'} onToggle={handleToggle('gineco')}>
              <Summary>Gineco-Obstetricos</Summary>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_edad_menarca"><FaFemale style={{ marginRight: '0.5rem' }} />Edad de la primera menstruacion</Label>
                  <Input
                    id="gineco_edad_menarca"
                    name="gineco_edad_menarca"
                    value={formData.gineco_edad_menarca}
                    onChange={handleChange}
                    placeholder="Ej. 12"
                    inputMode="numeric"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_ciclo"><FaCalendarAlt style={{ marginRight: '0.5rem' }} />Ciclo/Dias</Label>
                  <Input
                    id="gineco_ciclo"
                    name="gineco_ciclo"
                    value={formData.gineco_ciclo}
                    onChange={handleChange}
                    placeholder="Ej. 28 dias"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_cantidad"><FaTint style={{ marginRight: '0.5rem' }} />Cantidad</Label>
                  <Input
                    id="gineco_cantidad"
                    name="gineco_cantidad"
                    value={formData.gineco_cantidad}
                    onChange={handleChange}
                    placeholder="Ej. Moderado"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_dolor">Dolor</Label>
                  <Select
                    id="gineco_dolor"
                    name="gineco_dolor"
                    value={formData.gineco_dolor}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Si</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_ultima_menstruacion"><FaCalendarCheck style={{ marginRight: '0.5rem' }} />Fecha de la ultima menstruacion</Label>
                  <Input
                    id="gineco_fecha_ultima_menstruacion"
                    name="gineco_fecha_ultima_menstruacion"
                    type="date"
                    value={formData.gineco_fecha_ultima_menstruacion}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_vida_sexual_activa">Vida sexual activa</Label>
                  <Select
                    id="gineco_vida_sexual_activa"
                    name="gineco_vida_sexual_activa"
                    value={formData.gineco_vida_sexual_activa}
                    onChange={handleChange}
                  >
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
                    <Select
                      id="gineco_anticoncepcion"
                      name="gineco_anticoncepcion"
                      value={formData.gineco_anticoncepcion}
                      onChange={handleChange}
                    >
                      <option value="">-- Selecciona --</option>
                      <option value="Si">Si</option>
                      <option value="No">No</option>
                    </Select>
                  </FieldGroup>
                  {formData.gineco_anticoncepcion === 'Si' ? (
                    <FieldGroup>
                      <Label htmlFor="gineco_tipo_anticonceptivo"><FaPills style={{ marginRight: '0.5rem' }} />Tipo de anticonceptivo</Label>
                      <Input
                        id="gineco_tipo_anticonceptivo"
                        name="gineco_tipo_anticonceptivo"
                        value={formData.gineco_tipo_anticonceptivo}
                        onChange={handleChange}
                        placeholder="Ej. DIU, Implante, Pastillas"
                      />
                    </FieldGroup>
                  ) : null}
                </TwoColumnRow>
              ) : null}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_gestas"><FaBaby style={{ marginRight: '0.5rem' }} />Gestas</Label>
                  <Input
                    id="gineco_gestas"
                    name="gineco_gestas"
                    value={formData.gineco_gestas}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 2"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_partos"><FaBabyCarriage style={{ marginRight: '0.5rem' }} />Partos</Label>
                  <Input
                    id="gineco_partos"
                    name="gineco_partos"
                    value={formData.gineco_partos}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 1"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_cesareas"><FaProcedures style={{ marginRight: '0.5rem' }} />Cesareas</Label>
                  <Input
                    id="gineco_cesareas"
                    name="gineco_cesareas"
                    value={formData.gineco_cesareas}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 0"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_abortos"><FaHeartbeat style={{ marginRight: '0.5rem' }} />Abortos</Label>
                  <Input
                    id="gineco_abortos"
                    name="gineco_abortos"
                    value={formData.gineco_abortos}
                    onChange={handleChange}
                    inputMode="numeric"
                    placeholder="Ej. 0"
                  />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_ultimo_parto"><FaCalendarDay style={{ marginRight: '0.5rem' }} />Fecha del ultimo parto</Label>
                  <Input
                    id="gineco_fecha_ultimo_parto"
                    name="gineco_fecha_ultimo_parto"
                    type="date"
                    value={formData.gineco_fecha_ultimo_parto}
                    onChange={handleChange}
                  />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="gineco_fecha_menopausia"><FaCalendarTimes style={{ marginRight: '0.5rem' }} />Fecha de menopausia</Label>
                  <Input
                    id="gineco_fecha_menopausia"
                    name="gineco_fecha_menopausia"
                    type="date"
                    value={formData.gineco_fecha_menopausia}
                    onChange={handleChange}
                  />
                </FieldGroup>
              </TwoColumnRow>
            </details>
            )}

            {/* 🧬 Patológicos -> payload.antecedentes_personales_patologicos[] */}
            <details open={openSection === 'patologicos'} onToggle={handleToggle('patologicos')}>
              <Summary>Antecedentes personales patológicos</Summary>

              {/* Selector para agregar patológico */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_patologico">Selecciona un antecedente</Label>
                  <Select
                    id="select_patologico"
                    value={nuevoPatologico}
                    onChange={e => setNuevoPatologico(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {PATOLOGICOS_OPCIONES
                      .filter(opt => !formData.antecedentes_personales_patologicos.some(p => p.antecedente === opt))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
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
                          <Label><FaFileMedical style={{ marginRight: '0.5rem' }} />Antecedente</Label>
                          <Input value={p.antecedente} disabled />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>{`Descripción de antecedente: ${p.antecedente.toLowerCase()}`}</Label>
                          <TextArea
                            value={p.descripcion}
                            onChange={e => updatePatologicoDesc(idx, e.target.value)}
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

            {/* 🩺 Exploración física -> payload.exploracion_fisica */}
            <details open={openSection === 'exploracion'} onToggle={handleToggle('exploracion')}>
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
                  <Select
                    id="select_inspeccion"
                    value={nuevoInspeccion}
                    onChange={e => setNuevoInspeccion(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {INSPECCION_OPCIONES
                      .filter(opt => !formData.inspeccion_general.some(s => s.nombre === opt))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
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
                          <Label><FaStethoscope style={{ marginRight: '0.5rem' }} />Área</Label>
                          <Input value={s.nombre} disabled />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>{`Descripción de ${s.nombre.toLowerCase()}`}</Label>
                          <TextArea
                            value={s.descripcion}
                            onChange={e => updateInspeccionDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${s.nombre.toLowerCase()}`}
                          />
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

            {/* 📅 Consultas (padecimiento + interrogatorio) -> payload.consultas */}
            <details open={openSection === 'consultas'} onToggle={handleToggle('consultas')}>
              <Summary>Consultas</Summary>

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

              {/* Acción: crear sistema personalizado (placeholder) */}
              <FieldGroup>
                <Label>&nbsp;</Label>
                <SubmitButton type="button" onClick={() => {}}>
                  Crear personalizado
                </SubmitButton>
              </FieldGroup>

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
