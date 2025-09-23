// Construye el payload anidado tal como se envía al backend
export const buildNestedPayload = (data) => {
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
    antecedente: trim(p.antecedente),
    descripcion: trim(p.descripcion),
  }));

  // Alimentación
  const hayCambios = trim(data.hay_cambios);
  const alimentacion = {
    calidad: trim(data.calidad),
    descripcion: trim(data.descripcion),
    hay_cambios: hayCambios || '',
    ...(hayCambios === 'Si'
      ? {
          tipo: trim(data.cambio_tipo),
          causa: trim(data.cambio_causa),
          tiempo: trim(data.cambio_tiempo),
        }
      : {}),
  };

  const gineco_obstetricos = {
    edad_primera_menstruacion: trim(data.gineco_edad_menarca),
    ciclo_dias: trim(data.gineco_ciclo),
    cantidad: trim(data.gineco_cantidad),
    dolor: trim(data.gineco_dolor),
    fecha_ultima_menstruacion: trim(data.gineco_fecha_ultima_menstruacion),
    vida_sexual_activa: trim(data.gineco_vida_sexual_activa),
    anticoncepcion: trim(data.gineco_anticoncepcion),
    tipo_anticonceptivo: trim(data.gineco_tipo_anticonceptivo),
    gestas: trim(data.gineco_gestas),
    partos: trim(data.gineco_partos),
    cesareas: trim(data.gineco_cesareas),
    abortos: trim(data.gineco_abortos),
    fecha_ultimo_parto: trim(data.gineco_fecha_ultimo_parto),
    fecha_menopausia: trim(data.gineco_fecha_menopausia),
  };

  const antecedentes_personales = {
    habitos,
    alimentacion,
  };

  // Consultas
  const consultas = {
    fecha_consulta: trim(data.fecha_consulta),
    recordatorio: trim(data.recordatorio),
    padecimiento_actual: trim(data.padecimiento_actual),
    diagnostico: trim(data.diagnostico),
    tratamiento: trim(data.tratamiento),
    notas: trim(data.notas),
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
    imc: trim(data.imc),
    rtg: trim(data.rtg),
    ta_mmhg: trim(data.ta_mmhg),
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
    gineco_obstetricos,
    antecedentes_personales,
    antecedentes_personales_patologicos: patologicos,
    consultas,
    exploracion_fisica,
    diagnostico_y_tratamiento,
  };
};
