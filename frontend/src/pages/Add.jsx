// add.jsx (actualizado con nuevos campos y sección colapsable)
import { useState, useEffect } from 'react';
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

// Opciones: Antecedentes personales patológicos
const PATOLOGICOS_OPCIONES = [
  'Amigdalitis',
  'Alérgicos',
  'Enf. Venéreas',
  'Traumatismos',
  'Parasitosis',
  'Transfusiones',
  'Cirugías',
  'Cáncer',
  'Enf. Hígado',
  'Enf. Riñones',
  'Corazón',
  'Varicela',
  'Rubéola',
  'Sarampión',
  'Ojos',
  'Gastrointestinal',
  'Respiratorio',
  'Piel',
  'Migraña',
  'Colesterol',
  'Várices',
  'Glucosa',
  'Metabólico',
  'Insomnio',
  'Otros',
];

// Opciones: Interrogatorio por aparatos y sistemas
const SISTEMAS_OPCIONES = [
  'Síntomas generales',
  'Endocrino',
  'Órganos de los sentidos',
  'Gastrointestinal',
  'Cardiopulmonar',
  'Genitourinario',
  'Genital femenino',
  'Sexualidad',
  'Dermatológico',
  'Neurológico',
  'Hematológico',
  'Reumatológico',
  'Psiquiátrico',
  'Medicamentos',
];

// Opciones: Inspección general en exploración física
const INSPECCION_OPCIONES = [
  'Cabeza',
  'Cuello',
  'Tórax',
  'Abdomen',
  'Genitales',
  'Extremidades',
];

// Eliminado: DIETA_OPCIONES (componentes de la dieta)

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
  // Eliminado: antecedentes_personales_dieta
  // Eliminado: vacunacion
  antecedentes_personales_patologicos: [], // [{ nombre: string, descripcion: string }]
  // Padecimiento actual e interrogatorio por aparatos y sistemas
  padecimiento_actual: '',
  interrogatorio_aparatos: [], // [{ nombre: string, descripcion: string }]
  alimentacion_calidad: '',
  alimentacion_descripcion: '',
  cambios_alimentacion: '',
  cambio_tipo: '',
  cambio_causa: '',
  cambio_tiempo: '',
  // Exploración física - datos antropométricos y vitales
  peso_actual: '',
  peso_anterior: '',
  peso_deseado: '',
  peso_ideal: '',
  talla_cm: '',
  imc_porcentaje: '',
  porcentaje_rtg: '',
  ta_mmhg: '',
  pulso: '',
  frecuencia_cardiaca: '',
  frecuencia_respiratoria: '',
  temperatura_c: '',
  cadera_cm: '',
  cintura_cm: '',
  inspeccion_general: [], // [{ nombre: string, descripcion: string }]
  // Diagnóstico y tratamiento
  diagnostico: '',
  tratamiento: '',
  pronostico: '',
  notas: '',
};

// Construye el payload anidado tal como se envía al backend
const buildNestedPayload = (data) => {
  const trim = (v) => (typeof v === 'string' ? v.trim() : v);

  // Datos personales
  const datos_personales = {
    nombre: trim(data.nombre),
    fecha_nacimiento: trim(data.fecha_nacimiento),
    genero: trim(data.genero),
    telefono_movil: trim(data.telefono_movil),
    correo_electronico: trim(data.correo_electronico),
    residencia: trim(data.residencia),
    ocupacion: trim(data.ocupacion),
    escolaridad: trim(data.escolaridad),
    estado_civil: trim(data.estado_civil),
    tipo_sangre: trim(data.tipo_sangre),
    referido_por: trim(data.referido_por),
  };

  // Antecedentes familiares
  const antecedentes_familiares = (data.antecedentes_familiares || []).map((a) => ({
    nombre: trim(a.nombre),
    descripcion: trim(a.descripcion),
    ...(a.esOtro ? { esOtro: true } : {}),
  }));

  // Antecedentes personales: hábitos
  const habitos = (data.antecedentes_personales_habitos || []).map((h) => ({
    tipo: trim(h.tipo),
    campos: Object.fromEntries(
      Object.entries(h.campos || {}).map(([k, v]) => [k, trim(v)])
    ),
  }));

  // Antecedentes personales: patológicos
  const patologicos = (data.antecedentes_personales_patologicos || []).map((p) => ({
    nombre: trim(p.nombre),
    descripcion: trim(p.descripcion),
  }));

  // Alimentación
  const hayCambios = trim(data.cambios_alimentacion);
  const cambios =
    hayCambios === 'Si'
      ? {
          hay_cambios: 'Si',
          tipo: trim(data.cambio_tipo),
          causa: trim(data.cambio_causa),
          tiempo: trim(data.cambio_tiempo),
        }
      : { hay_cambios: hayCambios || '' };
  const alimentacion = {
    calidad: trim(data.alimentacion_calidad),
    descripcion: trim(data.alimentacion_descripcion),
    cambios,
  };

  const antecedentes_personales = {
    habitos,
    patologicos,
    alimentacion,
  };

  // Padecimiento actual e interrogatorio
  const padecimiento_e_interrogatorio = {
    padecimiento_actual: trim(data.padecimiento_actual),
    interrogatorio_aparatos: (data.interrogatorio_aparatos || []).map((s) => ({
      nombre: trim(s.nombre),
      descripcion: trim(s.descripcion),
    })),
  };

  // Exploración física
  const exploracion_fisica = {
    peso_actual: trim(data.peso_actual),
    peso_anterior: trim(data.peso_anterior),
    peso_deseado: trim(data.peso_deseado),
    peso_ideal: trim(data.peso_ideal),
    talla_cm: trim(data.talla_cm),
    imc_porcentaje: trim(data.imc_porcentaje),
    porcentaje_rtg: trim(data.porcentaje_rtg),
    ta_mmhg: trim(data.ta_mmhg),
    pulso: trim(data.pulso),
    frecuencia_cardiaca: trim(data.frecuencia_cardiaca),
    frecuencia_respiratoria: trim(data.frecuencia_respiratoria),
    temperatura_c: trim(data.temperatura_c),
    cadera_cm: trim(data.cadera_cm),
    cintura_cm: trim(data.cintura_cm),
    inspeccion_general: (data.inspeccion_general || []).map((s) => ({
      nombre: trim(s.nombre),
      descripcion: trim(s.descripcion),
    })),
  };

  // Diagnóstico y tratamiento
  const diagnostico_y_tratamiento = {
    diagnostico: trim(data.diagnostico),
    tratamiento: trim(data.tratamiento),
    pronostico: trim(data.pronostico),
    notas: trim(data.notas),
  };

  return {
    datos_personales,
    antecedentes_familiares,
    antecedentes_personales,
    padecimiento_e_interrogatorio,
    exploracion_fisica,
    diagnostico_y_tratamiento,
  };
};

const Add = () => {
  const [formData, setFormData] = useState(initialState);
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

  const handleChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  // Log en tiempo real cada vez que cambia el payload
  useEffect(() => {
    const livePayload = buildNestedPayload(formData);
    console.log('[Add] Payload actualizado:', livePayload);
  }, [formData]);

  const handleSubmit = async e => {
    e.preventDefault();
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
    if (nuevoHabito === 'Alcoholismo') base.campos = { vasos_por_semana: '', tiempo_activo_alc: '' };
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

  // Eliminado: lógica de componentes de la dieta (add/remove/update)

  // ---- Antecedentes personales patológicos ----
  const addPatologico = () => {
    if (!nuevoPatologico) return;
    setFormData(prev => ({
      ...prev,
      antecedentes_personales_patologicos: [
        ...prev.antecedentes_personales_patologicos,
        { nombre: nuevoPatologico, descripcion: '' },
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
        ...prev.interrogatorio_aparatos,
        { nombre: nuevoSistema, descripcion: '' },
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
        ...prev.inspeccion_general,
        { nombre: nuevoInspeccion, descripcion: '' },
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

  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title>
            <span>Nueva</span> historia clínica.
          </Title>

          <Form onSubmit={handleSubmit}>
            {/* Sección colapsable: Datos personales */}
            <details open={openSection === 'datos'} onToggle={handleToggle('datos')}>
              <Summary>
                Datos personales
              </Summary>

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

              {/* Correo y Referido por */}
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
              {/* Eliminado: fila separada de Referido por (se movió junto a Correo) */}
            </details>

            {/* Sección colapsable: Antecedentes familiares */}
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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_familiares.map((a, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.secondary}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
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
                            border: `1px solid ${Palette.secondary}`,
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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_personales_habitos.map((h, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.secondary}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{h.tipo}</strong>
                      <TwoColumnRow>
                        {h.tipo === 'Alcoholismo' && (
                          <>
                            <FieldGroup>
                              <Label htmlFor={`vasos_${idx}`}>Alcohol: Vasos por semana</Label>
                              <Input
                                id={`vasos_${idx}`}
                                value={h.campos.vasos_por_semana}
                                onChange={e => updateHabitoCampo(idx, 'vasos_por_semana', e.target.value)}
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
                            border: `1px solid ${Palette.secondary}`,
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

              {/* Eliminado: Select y lista de componentes de la dieta */}

              {/* Campos fijos */}
              <TwoColumnRow>
                {/* Eliminado: Vacunación */}
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
                <Label htmlFor="alimentacion_descripcion">Descripción de la alimentación</Label>
                <TextArea id="alimentacion_descripcion" name="alimentacion_descripcion" value={formData.alimentacion_descripcion} onChange={handleChange} rows={3} placeholder="Describe la alimentación del paciente" />
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
                {formData.cambios_alimentacion === 'Si' && (
                  <FieldGroup>
                    <Label htmlFor="cambio_tipo">Tipo de cambio</Label>
                    <Input id="cambio_tipo" name="cambio_tipo" value={formData.cambio_tipo} onChange={handleChange} />
                  </FieldGroup>
                )}
              </TwoColumnRow>

              {formData.cambios_alimentacion === 'Si' && (
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
              )}
            </details>

            {/* Sección colapsable: Antecedentes personales patológicos */}
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
                      .filter(opt => !formData.antecedentes_personales_patologicos.some(p => p.nombre === opt))
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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.antecedentes_personales_patologicos.map((p, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.secondary}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label>Antecedente</Label>
                          <Input value={p.nombre} disabled />
                        </FieldGroup>
                        <FieldGroup>
                          <Label>{`Descripción de antecedente: ${p.nombre.toLowerCase()}`}</Label>
                          <TextArea
                            value={p.descripcion}
                            onChange={e => updatePatologicoDesc(idx, e.target.value)}
                            rows={3}
                            placeholder={`Detalle de ${p.nombre.toLowerCase()}`}
                          />
                        </FieldGroup>
                      </TwoColumnRow>
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removePatologicoAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.secondary}`,
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

            {/* Sección colapsable: Padecimiento actual e interrogatorio por aparatos y sistemas */}
            <details open={openSection === 'padecimiento'} onToggle={handleToggle('padecimiento')}>
              <Summary>Padecimiento actual e interrogatorio</Summary>

              {/* Padecimiento actual (textarea grande) */}
              <FieldGroup>
                <Label htmlFor="padecimiento_actual">Padecimiento actual</Label>
                <TextArea
                  id="padecimiento_actual"
                  name="padecimiento_actual"
                  value={formData.padecimiento_actual}
                  onChange={handleChange}
                  rows={4}
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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.interrogatorio_aparatos.map((s, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.secondary}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label>Sistema</Label>
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
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeSistemaAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.secondary}`,
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

            {/* Sección colapsable: Exploración física */}
            <details open={openSection === 'exploracion'} onToggle={handleToggle('exploracion')}>
              <Summary>Exploración física</Summary>

              {/* Datos antropométricos y vitales */}
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="peso_actual">Peso actual (kg)</Label>
                  <Input id="peso_actual" name="peso_actual" value={formData.peso_actual} onChange={handleChange} inputMode="decimal" placeholder="Ej. 72" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="peso_anterior">Peso anterior (kg)</Label>
                  <Input id="peso_anterior" name="peso_anterior" value={formData.peso_anterior} onChange={handleChange} inputMode="decimal" placeholder="Ej. 75" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="peso_deseado">Peso deseado (kg)</Label>
                  <Input id="peso_deseado" name="peso_deseado" value={formData.peso_deseado} onChange={handleChange} inputMode="decimal" placeholder="Ej. 68" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="peso_ideal">Peso ideal (kg)</Label>
                  <Input id="peso_ideal" name="peso_ideal" value={formData.peso_ideal} onChange={handleChange} inputMode="decimal" placeholder="Ej. 70" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="talla_cm">Talla (cm)</Label>
                  <Input id="talla_cm" name="talla_cm" value={formData.talla_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 170" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="imc_porcentaje">IMC (%)</Label>
                  <Input id="imc_porcentaje" name="imc_porcentaje" value={formData.imc_porcentaje} onChange={handleChange} inputMode="decimal" placeholder="Ej. 24.9" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="porcentaje_rtg">% RTG</Label>
                  <Input id="porcentaje_rtg" name="porcentaje_rtg" value={formData.porcentaje_rtg} onChange={handleChange} inputMode="decimal" placeholder="Ej. 20" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="ta_mmhg">TA (mmHg)</Label>
                  <Input id="ta_mmhg" name="ta_mmhg" value={formData.ta_mmhg} onChange={handleChange} placeholder="Ej. 120/80" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="pulso">Pulso</Label>
                  <Input id="pulso" name="pulso" value={formData.pulso} onChange={handleChange} inputMode="numeric" placeholder="lpm" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="frecuencia_cardiaca">FC (frecuencia cardiaca)</Label>
                  <Input id="frecuencia_cardiaca" name="frecuencia_cardiaca" value={formData.frecuencia_cardiaca} onChange={handleChange} inputMode="numeric" placeholder="lpm" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="frecuencia_respiratoria">FR (frecuencia respiratoria)</Label>
                  <Input id="frecuencia_respiratoria" name="frecuencia_respiratoria" value={formData.frecuencia_respiratoria} onChange={handleChange} inputMode="numeric" placeholder="rpm" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="temperatura_c">Temp (°C)</Label>
                  <Input id="temperatura_c" name="temperatura_c" value={formData.temperatura_c} onChange={handleChange} inputMode="decimal" placeholder="Ej. 36.7" />
                </FieldGroup>
              </TwoColumnRow>
              <TwoColumnRow>
                <FieldGroup>
                  <Label htmlFor="cadera_cm">Cadera (cm)</Label>
                  <Input id="cadera_cm" name="cadera_cm" value={formData.cadera_cm} onChange={handleChange} inputMode="decimal" placeholder="Ej. 95" />
                </FieldGroup>
                <FieldGroup>
                  <Label htmlFor="cintura_cm">Cintura (cm)</Label>
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
                <div style={{ marginTop: '0.75rem' }}>
                  {formData.inspeccion_general.map((s, idx) => (
                    <div key={idx} style={{ border: `1px solid ${Palette.secondary}`, borderRadius: 6, padding: '0.75rem', marginBottom: '0.75rem', background: '#fff' }}>
                      <TwoColumnRow>
                        <FieldGroup>
                          <Label>Área</Label>
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
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => removeInspeccionAt(idx)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${Palette.secondary}`,
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

            {/* Sección colapsable: Diagnóstico y tratamiento */}
            <details open={openSection === 'diagnostico'} onToggle={handleToggle('diagnostico')}>
              <Summary>Diagnóstico y tratamiento</Summary>

              <FieldGroup>
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <TextArea
                  id="diagnostico"
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Escribe el diagnóstico clínico"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <TextArea
                  id="tratamiento"
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Plan de tratamiento"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="pronostico">Pronóstico</Label>
                <TextArea
                  id="pronostico"
                  name="pronostico"
                  value={formData.pronostico}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Pronóstico del paciente"
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="notas">Notas</Label>
                <TextArea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Notas adicionales"
                />
              </FieldGroup>
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
