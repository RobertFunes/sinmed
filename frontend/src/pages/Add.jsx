// add.jsx (actualizado con nuevos campos y sección colapsable)
import { useState } from 'react';
import Header from '../components/Header';
import {
  AddContainer,
  FormCard,
  Title,
  Form,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
  ButtonRow,
  SubmitButton,
  TwoColumnRow,
} from './Add.styles';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';

// iconos
import { AiFillStar } from 'react-icons/ai';
import {
  FaUserCircle,
  FaVenusMars,
  FaEnvelope,
  FaPhoneAlt,
  FaHome,
  FaBirthdayCake,
  FaBriefcase,
  FaTrash,
  FaPlusCircle,
} from 'react-icons/fa';

/* ---------- Catálogos ---------- */
const ANTECEDENTES_OPCIONES = [
  'Diabetes',
  'Hipertensión arterial (Presión alta)',
  'Enfermedades oculares (Miopía, Astigmatismo, etc.)',
  'Enfermedades del corazón',
  'Enfermedades de la piel',
  'Várices',
  'Cáncer',
  'Obesidad',
  'Alcoholismo',
  'Cálculos en riñón',
  'Cálculos en vesícula',
  'Insomnio',
  'Asma',
  'Colesterol',
  'Enfermedades mentales',
  'Epilepsia',
  'Enfermedades tiroideas',
  'Anemia',
  'Enfermedades de riñón',
  'Enfermedades de hígado',
  'Enfermedades gástricas',
  'Artritis',
  'Otras',
];

const HABITOS_OPCIONES = [
  'Alcoholismo',
  'Tabaquismo',
  'Toxicomanías',
];

const DIETA_OPCIONES = [
  'Tortillas',
  'Frijoles',
  'Pan/Pastas',
  'Carne',
  'Pescado',
  'Huevo',
  'Verduras',
  'Frutas',
  'Refrescos',
  'Comida chatarra',
  'Agua (litros)',
];

/* ---------- Estado inicial (solo nuevos campos) ---------- */
const initialState = {
  nombre: '',                 // varchar(100) NOT NULL
  fecha_nacimiento: '',       // date NULL
  genero: '',                 // enum('Hombre','Mujer','NA')
  telefono_movil: '',         // varchar(20) NULL
  correo_electronico: '',     // varchar(100) NULL
  residencia: '',             // varchar(255) NULL
  ocupacion: '',              // varchar(50) NULL
  escolaridad: '',            // varchar(100) NULL
  estado_civil: '',           // enum(...)
  tipo_sangre: '',            // varchar(10) NULL
  referido_por: '',           // varchar(100) NULL
  antecedentes_familiares: [], // [{ nombre: string, descripcion: string, esOtro?: boolean }]
  // Antecedentes personales
  antecedentes_personales_habitos: [], // [{ tipo: 'Alcoholismo'|'Tabaquismo'|'Toxicomanías', campos: {...} }]
  antecedentes_personales_dieta: [],   // [{ nombre: string, veces_por_semana?: string, agua_litros?: string }]
  vacunacion: '',
  alimentacion_calidad: '',
  alimentacion_motivo: '',
  cambios_alimentacion: '',
  cambio_tipo: '',
  cambio_causa: '',
  cambio_tiempo: '',
};

const Add = () => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoAntecedente, setNuevoAntecedente] = useState('');
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [nuevoDieta, setNuevoDieta] = useState('');

  const handleChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // Normaliza espacios en todos los strings
    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : v,
      ])
    );

    console.log('Payload enviado', payload);

    try {
      const res = await fetch(`${url}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Perfil agregado correctamente');
        setFormData(initialState);
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

  const handleCancel = () => setFormData(initialState);
  const addAntecedente = () => {
    if (!nuevoAntecedente) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_familiares: [
        ...prev.antecedentes_familiares,
        nuevoAntecedente === 'Otras'
          ? { nombre: '', descripcion: '', esOtro: true }
          : { nombre: nuevoAntecedente, descripcion: '' },
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
    if (nuevoHabito === 'Alcoholismo') base.campos = { vasos_por_dia: '', frecuencia: '' };
    if (nuevoHabito === 'Tabaquismo') base.campos = { cigarrillos_por_dia: '', tiempo_activo: '' };
    if (nuevoHabito === 'Toxicomanías') base.campos = { tipo_toxicomania: '', frecuencia: '' };
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_habitos: [...prev.antecedentes_personales_habitos, base],
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

  // ---- Antecedentes personales: dieta ----
  const addDieta = () => {
    if (!nuevoDieta) return;
    const isAgua = nuevoDieta === 'Agua (litros)';
    const item = isAgua ? { nombre: nuevoDieta, agua_litros: '' } : { nombre: nuevoDieta, veces_por_semana: '' };
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_dieta: [...prev.antecedentes_personales_dieta, item],
    }));
    setNuevoDieta('');
  };
  const removeDietaAt = (idx) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_dieta: prev.antecedentes_personales_dieta.filter((_, i) => i !== idx),
    }));
  };
  const updateDietaCampo = (idx, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_dieta: prev.antecedentes_personales_dieta.map((d, i) => i === idx ? { ...d, [campo]: valor } : d),
    }));
  };
  const Required = () => (
    <AiFillStar
      style={{
        marginLeft: '0.25rem',
        verticalAlign: 'middle',
        color: Palette.cyan,
        fontSize: '2.2rem',
      }}
      title="Obligatorio"
    />
  );

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Añadir</span> perfil a la base de datos.
          </Title>

          <Form onSubmit={handleSubmit}>
            {/* Sección colapsable: Datos personales */}
            <details open>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                Datos personales
              </summary>

              {/* Nombre (requerido) y Género */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="nombre">
                    <FaUserCircle style={{ marginRight: '0.5rem' }} />
                    Nombre
                    <Required />
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Nombre completo"
                  />
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="genero">
                    <FaVenusMars style={{ marginRight: '0.5rem' }} />
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
                    <FaPhoneAlt style={{ marginRight: '0.5rem' }} />
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

              {/* Correo */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="correo_electronico">
                    <FaEnvelope style={{ marginRight: '0.5rem' }} />
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
              </TwoColumnRow>

              {/* Dirección Completa (full width) */}
              <FieldGroup>
                <Label htmlFor="residencia">
                  <FaHome style={{ marginRight: '0.5rem' }} />
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
                    <FaBriefcase style={{ marginRight: '0.5rem' }} />
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

              {/* Referido por */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="referido_por">
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
            </details>

            {/* Sección colapsable: Antecedentes familiares */}
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  margin: '1rem 0 0.75rem',
                }}
              >
                Antecedentes familiares
              </summary>

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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_familiares.map((a, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.darkGray}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label>{a.esOtro ? 'Otra (especifique)' : 'Antecedente'}</Label>
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
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeAntecedenteAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.darkGray}`,
                            borderRadius: 4,
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                          <span style={{ marginLeft: 8 }}>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </details>

            {/* Sección colapsable: Antecedentes personales */}
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  margin: '1rem 0 0.75rem',
                }}
              >
                Antecedentes personales
              </summary>

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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_personales_habitos.map((h, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.darkGray}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{h.tipo}</strong>
                      <TwoColumnRow>
                        {h.tipo === 'Alcoholismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`vasos_${idx}`}>Alcohol: Vasos por día</Label>
                              <Input
                                id={`vasos_${idx}`}
                                value={h.campos.vasos_por_dia}
                                onChange={e => updateHabitoCampo(idx, 'vasos_por_dia', e.target.value)}
                                inputMode="numeric"
                                placeholder="Ej. 2"
                              />
                            </FieldGroup>
                            <FieldGroup>
                              <Label htmlFor={`freq_${idx}`}>Frecuencia</Label>
                              <Input
                                id={`freq_${idx}`}
                                value={h.campos.frecuencia}
                                onChange={e => updateHabitoCampo(idx, 'frecuencia', e.target.value)}
                                placeholder="Ej. diario, fines de semana"
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
                                value={h.campos.tiempo_activo}
                                onChange={e => updateHabitoCampo(idx, 'tiempo_activo', e.target.value)}
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
                              <Label htmlFor={`tox_freq_${idx}`}>Frecuencia</Label>
                              <Input
                                id={`tox_freq_${idx}`}
                                value={h.campos.frecuencia}
                                onChange={e => updateHabitoCampo(idx, 'frecuencia', e.target.value)}
                                placeholder="Ej. diario, esporádico"
                              />
                            </FieldGroup>
                          </>
                        )}
                      </TwoColumnRow>

                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeHabitoAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.darkGray}`,
                            borderRadius: 4,
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                          <span style={{ marginLeft: 8 }}>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Select dinámico: Componentes habituales de la dieta */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="select_dieta">Componente de la dieta</Label>
                  <Select
                    id="select_dieta"
                    value={nuevoDieta}
                    onChange={e => setNuevoDieta(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {DIETA_OPCIONES
                      .filter(opt => !formData.antecedentes_personales_dieta.some(d => d.nombre === opt))
                      .map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                  </Select>
                </FieldGroup>
                <FieldGroup>
                  <Label>&nbsp;</Label>
                  <SubmitButton type="button" onClick={addDieta} disabled={!nuevoDieta}>
                    <FaPlusCircle style={{ marginRight: '0.5rem' }} />
                    Agregar componente
                  </SubmitButton>
                </FieldGroup>
              </TwoColumnRow>

              {formData.antecedentes_personales_dieta.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_personales_dieta.map((d, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.darkGray}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{d.nombre}</strong>
                      <TwoColumnRow>
                        {d.nombre === 'Agua (litros)' ? (
                          <FieldGroup>
                            <Label htmlFor={`agua_${idx}`}>{`Agua (litros) — Litros por día`}</Label>
                            <Input
                              id={`agua_${idx}`}
                              value={d.agua_litros}
                              onChange={e => updateDietaCampo(idx, 'agua_litros', e.target.value)}
                              inputMode="decimal"
                              placeholder="Ej. 2"
                            />
                          </FieldGroup>
                        ) : (
                          <FieldGroup>
                            <Label htmlFor={`veces_${idx}`}>{`${d.nombre} — Veces por semana`}</Label>
                            <Input
                              id={`veces_${idx}`}
                              value={d.veces_por_semana}
                              onChange={e => updateDietaCampo(idx, 'veces_por_semana', e.target.value)}
                              inputMode="numeric"
                              placeholder="Ej. 3"
                            />
                          </FieldGroup>
                        )}
                      </TwoColumnRow>
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeDietaAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.darkGray}`,
                            borderRadius: 4,
                            padding: '0.35rem 0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                          <span style={{ marginLeft: 8 }}>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Campos fijos */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="vacunacion">Vacunación</Label>
                  <Select id="vacunacion" name="vacunacion" value={formData.vacunacion} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="alimentacion_calidad">Alimentación (calidad)</Label>
                  <Select id="alimentacion_calidad" name="alimentacion_calidad" value={formData.alimentacion_calidad} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Buena">Buena</option>
                    <option value="Regular">Regular</option>
                    <option value="Mala">Mala</option>
                  </Select>
                </FieldGroup>
              </TwoColumnRow>

              <FieldGroup>
                <Label htmlFor="alimentacion_motivo">Motivo</Label>
                <TextArea id="alimentacion_motivo" name="alimentacion_motivo" value={formData.alimentacion_motivo} onChange={handleChange} rows={3} placeholder="Explica brevemente" />
              </FieldGroup>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="cambios_alimentacion">Cambios en la alimentación</Label>
                  <Select id="cambios_alimentacion" name="cambios_alimentacion" value={formData.cambios_alimentacion} onChange={handleChange}>
                    <option value="">-- Selecciona --</option>
                    <option value="Si">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="cambio_tipo">Tipo de cambio</Label>
                  <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
                </FieldGroup>
              </TwoColumnRow>

              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="cambio_causa">Causa del cambio</Label>
                  <Input id="cambio_causa" name="cambio_causa" value={formData.cambio_causa} onChange={handleChange} />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="cambio_tiempo">Tiempo</Label>
                  <Input id="cambio_tiempo" name="cambio_tiempo" value={formData.cambio_tiempo} onChange={handleChange} placeholder="Ej. 6 meses" />
                </FieldGroup>
              </TwoColumnRow>
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
