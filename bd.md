# Base de datos real (`u930152635_adrian`)

Fuente: phpMyAdmin `5.2.2` en `auth-db938.hstgr.io` (servidor `127.0.0.1:3306`).

Fecha de verificación: `2026-02-20`.

## Resumen de tablas

| Tabla | Engine | Collation | Filas |
|---|---|---|---:|
| `antecedentes_familiares` | InnoDB | `utf8mb4_unicode_ci` | 250 |
| `antecedentes_personales` | InnoDB | `utf8mb4_unicode_ci` | 25 |
| `antecedentes_personales_patologicos` | InnoDB | `utf8mb4_unicode_ci` | 246 |
| `citas` | InnoDB | `utf8mb4_unicode_ci` | 1043 |
| `consultas` | InnoDB | `utf8mb4_uca1400_ai_ci` | 554 |
| `exploracion_fisica` | InnoDB | `utf8mb4_unicode_ci` | 428 |
| `gineco_obstetricos` | InnoDB | `utf8mb4_unicode_ci` | 19 |
| `perfil` | InnoDB | `utf8mb4_general_ci` | 88 |
| `personalizados` | InnoDB | `utf8mb4_uca1400_ai_ci` | 344 |

## `antecedentes_familiares`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_antecedente_familiar` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `nombre` | `varchar(100)` | No |  |  |
| `descripcion` | `text` | Si | `NULL` |  |
| `creado` | `date` | No | `curdate()` |  |
| `actualizado` | `date` | No | `curdate()` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_antecedente_familiar` |
| `ux_perfil_nombre` | Si | `id_perfil`, `nombre` |
| `ix_perfil` | No | `id_perfil` |

## `antecedentes_personales`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_ap` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `bebidas_por_dia` | `decimal(4,1)` | Si | `NULL` |  |
| `tiempo_activo_alc` | `varchar(50)` | Si | `NULL` |  |
| `tiempo_inactivo_alc` | `varchar(50)` | Si | `NULL` |  |
| `cigarrillos_por_dia` | `varchar(10)` | Si | `NULL` |  |
| `tiempo_activo_tab` | `varchar(50)` | Si | `NULL` |  |
| `tiempo_inactivo_tab` | `varchar(50)` | Si | `NULL` |  |
| `tipo_toxicomania` | `varchar(100)` | Si | `NULL` |  |
| `tiempo_activo_tox` | `varchar(50)` | Si | `NULL` |  |
| `tiempo_inactivo_tox` | `varchar(50)` | Si | `NULL` |  |
| `calidad` | `enum('Buena','Regular','Mala')` | Si | `NULL` |  |
| `hay_cambios` | `enum('Si','No')` | Si | `No` |  |
| `cambio_tipo` | `varchar(120)` | Si | `NULL` |  |
| `cambio_causa` | `varchar(120)` | Si | `NULL` |  |
| `cambio_tiempo` | `varchar(60)` | Si | `NULL` |  |
| `alimentos_que_le_caen_mal` | `text` | Si | `NULL` |  |
| `componentes_habituales_dieta` | `text` | Si | `NULL` |  |
| `vacunas` | `text` | Si | `NULL` |  |
| `desayuno` | `text` | Si | `NULL` |  |
| `comida` | `text` | Si | `NULL` |  |
| `cena` | `text` | Si | `NULL` |  |
| `creado` | `date` | No | `curdate()` |  |
| `actualizado` | `date` | No | `curdate()` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_ap` |
| `uq_antecedentes_personales_id_perfil` | Si | `id_perfil` |
| `ix_ap_perfil` | No | `id_perfil` |

## `antecedentes_personales_patologicos`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_app` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `antecedente` | `varchar(100)` | No |  |  |
| `descripcion` | `text` | Si | `NULL` |  |
| `creado` | `date` | No | `curdate()` |  |
| `actualizado` | `date` | No | `curdate()` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_app` |
| `ix_app_perfil` | No | `id_perfil` |

## `citas`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_cita` (Primaria) | `int(11)` | No |  |  |
| `nombre` | `varchar(100)` | Si | `NULL` |  |
| `telefono` | `varchar(20)` | Si | `NULL` |  |
| `inicio_utc` | `datetime` | No |  |  |
| `fin_utc` | `datetime` | No |  |  |
| `color` | `varchar(50)` | Si | `NULL` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_cita` |
| `idx_citas_inicio` | No | `inicio_utc` |
| `idx_citas_rango` | No | `inicio_utc`, `fin_utc` |

## `consultas`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_consulta` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `fecha_consulta` | `date` | No |  |  |
| `historia_clinica` | `text` | Si | `NULL` |  |
| `padecimiento_actual` | `text` | Si | `NULL` |  |
| `diagnostico` | `text` | Si | `NULL` |  |
| `tratamiento` | `text` | Si | `NULL` |  |
| `notas` | `text` | Si | `NULL` |  |
| `oreja` | `varchar(20)` | Si | `NULL` |  |
| `notas_evolucion` | `varchar(1000)` | Si | `NULL` |  |
| `sintomas_generales_desc` | `text` | Si | `NULL` |  |
| `sintomas_generales_estado` | `varchar(15)` | Si | `NULL` |  |
| `endocrino_desc` | `text` | Si | `NULL` |  |
| `endocrino_estado` | `varchar(15)` | Si | `NULL` |  |
| `organos_sentidos_desc` | `text` | Si | `NULL` |  |
| `organos_sentidos_estado` | `varchar(15)` | Si | `NULL` |  |
| `gastrointestinal_desc` | `text` | Si | `NULL` |  |
| `gastrointestinal_estado` | `varchar(15)` | Si | `NULL` |  |
| `respiratorio_desc` | `text` | Si | `NULL` |  |
| `respiratorio_estado` | `varchar(15)` | Si | `NULL` |  |
| `cardiopulmonar_desc` | `text` | Si | `NULL` |  |
| `cardiopulmonar_estado` | `varchar(15)` | Si | `NULL` |  |
| `genitourinario_desc` | `text` | Si | `NULL` |  |
| `genitourinario_estado` | `varchar(15)` | Si | `NULL` |  |
| `genital_femenino_desc` | `text` | Si | `NULL` |  |
| `genital_femenino_estado` | `varchar(15)` | Si | `NULL` |  |
| `sexualidad_desc` | `text` | Si | `NULL` |  |
| `sexualidad_estado` | `varchar(15)` | Si | `NULL` |  |
| `dermatologico_desc` | `text` | Si | `NULL` |  |
| `dermatologico_estado` | `varchar(15)` | Si | `NULL` |  |
| `neurologico_desc` | `text` | Si | `NULL` |  |
| `neurologico_estado` | `varchar(15)` | Si | `NULL` |  |
| `hematologico_desc` | `text` | Si | `NULL` |  |
| `hematologico_estado` | `varchar(15)` | Si | `NULL` |  |
| `reumatologico_desc` | `text` | Si | `NULL` |  |
| `reumatologico_estado` | `varchar(15)` | Si | `NULL` |  |
| `psiquiatrico_desc` | `text` | Si | `NULL` |  |
| `psiquiatrico_estado` | `varchar(15)` | Si | `NULL` |  |
| `medicamentos_desc` | `text` | Si | `NULL` |  |
| `medicamentos_estado` | `varchar(15)` | Si | `NULL` |  |
| `recordatorio` | `date` | Si | `NULL` |  |
| `medicamentos` | `varchar(500)` | Si | `NULL` |  |
| `agua` | `varchar(50)` | Si | `NULL` |  |
| `laboratorios` | `varchar(500)` | Si | `NULL` |  |
| `presion` | `varchar(200)` | Si | `NULL` |  |
| `glucosa` | `varchar(500)` | Si | `NULL` |  |
| `pam` | `varchar(25)` | Si | `NULL` |  |
| `peso` | `varchar(100)` | Si | `NULL` |  |
| `ejercicio` | `varchar(255)` | Si | `NULL` |  |
| `desparacitacion` | `varchar(255)` | Si | `NULL` |  |
| `fum` | `varchar(500)` | Si | `NULL` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_consulta` |
| `fk_consultas_perfil` | No | `id_perfil` |

## `exploracion_fisica`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_exploracion` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `peso_actual` | `decimal(5,2)` | Si | `NULL` |  |
| `peso_anterior` | `decimal(5,2)` | Si | `NULL` |  |
| `peso_deseado` | `decimal(5,2)` | Si | `NULL` |  |
| `peso_ideal` | `varchar(100)` | Si | `NULL` |  |
| `talla_cm` | `decimal(5,2)` | Si | `NULL` |  |
| `imc` | `decimal(5,2)` | Si | `NULL` |  |
| `ta_mmhg` | `varchar(15)` | Si | `NULL` |  |
| `frecuencia_cardiaca` | `int(11)` | Si | `NULL` |  |
| `pulso` | `varchar(20)` | Si | `NULL` |  |
| `frecuencia_respiratoria` | `int(11)` | Si | `NULL` |  |
| `temperatura_c` | `decimal(4,1)` | Si | `NULL` |  |
| `cadera_cm` | `decimal(5,2)` | Si | `NULL` |  |
| `cintura_cm` | `decimal(5,2)` | Si | `NULL` |  |
| `cabeza` | `text` | Si | `NULL` |  |
| `cuello` | `text` | Si | `NULL` |  |
| `torax` | `text` | Si | `NULL` |  |
| `abdomen` | `text` | Si | `NULL` |  |
| `genitales` | `text` | Si | `NULL` |  |
| `extremidades` | `text` | Si | `NULL` |  |
| `creado` | `date` | No | `curdate()` |  |
| `actualizado` | `date` | No | `curdate()` |  |
| `pam` | `varchar(20)` | Si | `NULL` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_exploracion` |
| `ix_exploracion_perfil` | No | `id_perfil` |

## `gineco_obstetricos`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `edad_primera_menstruacion` | `tinyint(4)` | Si | `NULL` |  |
| `ciclo_dias` | `tinyint(4)` | Si | `NULL` |  |
| `cantidad` | `varchar(50)` | Si | `NULL` |  |
| `dolor` | `varchar(50)` | Si | `NULL` |  |
| `fecha_ultima_menstruacion` | `varchar(100)` | Si | `NULL` |  |
| `vida_sexual_activa` | `enum('Si','No')` | Si | `NULL` |  |
| `anticoncepcion` | `enum('Si','No')` | Si | `NULL` |  |
| `tipo_anticonceptivo` | `varchar(100)` | Si | `NULL` |  |
| `gestas` | `tinyint(4)` | Si | `NULL` |  |
| `partos` | `tinyint(4)` | Si | `NULL` |  |
| `cesareas` | `tinyint(4)` | Si | `NULL` |  |
| `abortos` | `tinyint(4)` | Si | `NULL` |  |
| `fecha_ultimo_parto` | `varchar(100)` | Si | `NULL` |  |
| `fecha_menopausia` | `varchar(100)` | Si | `NULL` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id` |
| `uq_gineco_id_perfil` | Si | `id_perfil` |

## `perfil`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_perfil` (Primaria) | `int(11)` | No |  |  |
| `nombre` | `varchar(100)` | No |  |  |
| `fecha_nacimiento` | `date` | Si | `NULL` |  |
| `genero` | `enum('Hombre','Mujer','NA')` | Si | `NA` |  |
| `telefono_movil` | `varchar(20)` | Si | `NULL` |  |
| `correo_electronico` | `varchar(100)` | Si | `NULL` |  |
| `residencia` | `varchar(255)` | Si | `NULL` |  |
| `ocupacion` | `varchar(50)` | Si | `NULL` |  |
| `escolaridad` | `varchar(100)` | Si | `NULL` |  |
| `estado_civil` | `enum('Soltero','Casado','Divorciado','Viudo','Union libre','Otro')` | Si | `NULL` |  |
| `tipo_sangre` | `varchar(10)` | Si | `NULL` |  |
| `referido_por` | `varchar(100)` | Si | `NULL` |  |
| `alergico` | `varchar(25)` | Si | `''` |  |
| `actualizado` | `date` | No | `curdate()` |  |
| `creado` | `date` | No | `curdate()` |  |
| `id_legado` | `int(11)` | Si | `NULL` | `Id opcional heredado/relacion` |
| `fecha_legado` | `date` | Si | `NULL` | `Fecha de legado` |
| `recordatorio` | `date` | Si | `NULL` | `Fecha del recordatorio (sin hora)` |
| `recordatorio_desc` | `text` | Si | `NULL` | `Descripcion del recordatorio` |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_perfil` |

## `personalizados`

### Columnas
| Columna | Tipo | Nulo | Predeterminado | Comentarios |
|---|---|---|---|---|
| `id_personalizado` (Primaria) | `int(11)` | No |  |  |
| `id_perfil` | `int(11)` | No |  |  |
| `id_consulta` | `int(11)` | No |  |  |
| `nombre` | `varchar(100)` | No |  |  |
| `descripcion` | `varchar(255)` | No |  |  |
| `creado` | `date` | No | `curdate()` |  |
| `actualizado` | `date` | No | `curdate()` |  |
| `estado` | `varchar(50)` | Si | `NULL` |  |

### Indices
| Indice | Unico | Columnas |
|---|---|---|
| `PRIMARY` | Si | `id_personalizado` |
| `idx_personalizados_perfil` | No | `id_perfil` |
| `idx_personalizados_consulta` | No | `id_consulta` |

## Llaves foraneas (reales)

| Tabla | Constraint | Columna | Referencia | ON UPDATE | ON DELETE |
|---|---|---|---|---|---|
| `antecedentes_familiares` | `fk_af_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `antecedentes_personales` | `fk_ap_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `antecedentes_personales_patologicos` | `fk_app_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `consultas` | `fk_consultas_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `exploracion_fisica` | `fk_exploracion_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `gineco_obstetricos` | `fk_gineco_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |
| `personalizados` | `fk_personalizados_consulta` | `id_consulta` | `consultas(id_consulta)` | CASCADE | CASCADE |
| `personalizados` | `fk_personalizados_perfil` | `id_perfil` | `perfil(id_perfil)` | CASCADE | CASCADE |

## Cambios clave vs documento anterior

- `antecedentes_personales` ahora incluye: `tiempo_inactivo_alc`, `tiempo_inactivo_tab`, `tiempo_inactivo_tox`, `alimentos_que_le_caen_mal`, `componentes_habituales_dieta`, `vacunas`, `desayuno`, `comida`, `cena`.
- `gineco_obstetricos` maneja `fecha_ultima_menstruacion`, `fecha_ultimo_parto`, `fecha_menopausia` como `varchar(100)` (no `date`).
- `exploracion_fisica`: `peso_ideal` es `varchar(100)`, existe `pam` (`varchar(20)`), no aparece `rtg`, y ahora existe `pulso` como columna independiente (`varchar(20)`).
- `consultas` agrega: `oreja`, `notas_evolucion`, `medicamentos`, `agua`, `laboratorios`, `presion`, `glucosa`, `pam`, `peso`, `ejercicio`, `desparacitacion`, `fum`, `respiratorio_desc`/`respiratorio_estado`, y `historia_clinica`.
- `perfil.alergico` es `varchar(25)`.
- `personalizados` agrega `estado` (`varchar(50)`, nullable).
