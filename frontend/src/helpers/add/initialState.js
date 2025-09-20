export const initialState = {
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
  gineco_edad_menarca: '',          // edad de menarca (años)
  gineco_ciclo: '',                 // descripción de ciclo/días
  gineco_cantidad: '',             // cantidad del sangrado
  gineco_dolor: '',                // presencia de dolor (Si/No)
  // Eliminado: antecedentes_personales_dieta
  // Eliminado: vacunacion
  antecedentes_personales_patologicos: [], // [{ antecedente: string, descripcion: string }]
  // Padecimiento actual e interrogatorio por aparatos y sistemas
  padecimiento_actual: '',
  interrogatorio_aparatos: [], // [{ nombre: string, descripcion: string }]
  calidad: '',
  descripcion: '',
  hay_cambios: '',
  cambio_tipo: '',
  cambio_causa: '',
  cambio_tiempo: '',
  // Exploración física - datos antropométricos y vitales
  peso_actual: '',
  peso_anterior: '',
  peso_deseado: '',
  peso_ideal: '',
  talla_cm: '',
  imc: '',
  rtg: '',
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
