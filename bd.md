# 📊 Documentación de la Base de Datos
Consta de 7 tablas: perfil, antecedentes_familiares, antecedentes_personales, antecedentes_personales_patologicos, gineco_obstetricos, exploracion_fisica y consultas

---

## 🧑 Tabla `perfil`
Contiene los datos generales de cada paciente.

| Columna            | Tipo                                                        | Null | Key | Default     | Extra          | Descripción                                |
|--------------------|-------------------------------------------------------------|------|-----|-------------|----------------|--------------------------------------------|
| id_perfil          | int(11)                                                     | NO   | PRI | NULL        | auto_increment | Identificador único del perfil             |
| nombre             | varchar(100)                                                | NO   |     | NULL        |                | Nombre completo del paciente               |
| fecha_nacimiento   | date                                                        | YES  |     | NULL        |                | Fecha de nacimiento                        |
| genero             | enum('Hombre','Mujer','NA')                                 | YES  |     | NA          |                | Género del paciente                        |
| telefono_movil     | varchar(20)                                                 | YES  |     | NULL        |                | Teléfono móvil                             |
| correo_electronico | varchar(100)                                                | YES  |     | NULL        |                | Correo electrónico                         |
| residencia         | varchar(255)                                                | YES  |     | NULL        |                | Domicilio o residencia                     |
| ocupacion          | varchar(50)                                                 | YES  |     | NULL        |                | Ocupación                                  |
| escolaridad        | varchar(100)                                                | YES  |     | NULL        |                | Nivel educativo                            |
| estado_civil       | enum('Soltero','Casado','Divorciado','Viudo','Union libre','Otro') | YES  |     | NULL        |                | Estado civil                               |
| tipo_sangre        | varchar(10)                                                 | YES  |     | NULL        |                | Grupo y tipo sanguíneo                     |
| referido_por       | varchar(100)                                                | YES  |     | NULL        |                | Fuente de referencia                       |
| alergico           | varchar(100)                                                | YES  |     | NULL        |                | A qué sustancias es alérgico el paciente   |
| actualizado        | date                                                        | NO   |     | curdate()   |                | Fecha de última modificación               |
| creado             | date                                                        | NO   |     | curdate()   |                | Fecha de creación                          |

---

## 👨‍👩 Tabla `antecedentes_familiares`
Almacena antecedentes médicos relevantes en la familia del paciente.

| Columna               | Tipo        | Null | Key | Default   | Extra          |
|-----------------------|-------------|------|-----|-----------|----------------|
| id_antecedente_familiar | int(11)   | NO   | PRI | NULL      | auto_increment |
| id_perfil             | int(11)     | NO   | MUL | NULL      |                |
| nombre                | varchar(100)| NO   |     | NULL      |                |
| descripcion           | text        | YES  |     | NULL      |                |
| creado                | date        | NO   |     | curdate() |                |
| actualizado           | date        | NO   |     | curdate() |                |

---

## 🚬 Tabla `antecedentes_personales`
Registra hábitos y estilo de vida del paciente.  
**Nota**: relación 1:1 con `perfil` (`id_perfil` es único).

| Columna           | Tipo              | Null | Key | Default   | Extra          |
|-------------------|-------------------|------|-----|-----------|----------------|
| id_ap             | int(11)           | NO   | PRI | NULL      | auto_increment |
| id_perfil         | int(11)           | NO   | UNI | NULL      |                |
| bebidas_por_dia   | decimal(4,1)      | YES  |     | NULL      |                |
| tiempo_activo_alc | varchar(50)       | YES  |     | NULL      |                |
| cigarrillos_por_dia| varchar(10)      | YES  |     | NULL      |                |
| tiempo_activo_tab | varchar(50)       | YES  |     | NULL      |                |
| tipo_toxicomania  | varchar(100)      | YES  |     | NULL      |                |
| tiempo_activo_tox | varchar(50)       | YES  |     | NULL      |                |
| calidad           | enum('Buena','Regular','Mala') | YES |     | NULL |        |
| descripcion       | text              | YES  |     | NULL      |                |
| hay_cambios       | enum('Si','No')   | YES  |     | No        |                |
| cambio_tipo       | varchar(120)      | YES  |     | NULL      |                |
| cambio_causa      | varchar(120)      | YES  |     | NULL      |                |
| cambio_tiempo     | varchar(60)       | YES  |     | NULL      |                |
| creado            | date              | NO   |     | curdate() |                |
| actualizado       | date              | NO   |     | curdate() |                |

---
## 🌸 Tabla `gineco_obstetricos`
Registra antecedentes ginecológicos y obstétricos del perfil.  
**Nota**: relación 1:1 con `perfil` (`id_perfil` es único).

| Columna                  | Tipo                         | Null | Key | Default   | Extra          | Descripción                                         |
|--------------------------|------------------------------|------|-----|-----------|----------------|-----------------------------------------------------|
| id                | int(11)                      | NO   | PRI | NULL      | auto_increment | Identificador único del registro                    |
| id_perfil                | int(11)                      | NO   | UNI | NULL      |                | Clave foránea a `perfil.id_perfil`                 |
| edad_primera_menstruacion| tinyint(4)                   | YES  |     | NULL      |                | Edad de la primera menstruación                     |
| ciclo_dias               | tinyint(4)                   | YES  |     | NULL      |                | Duración promedio del ciclo (en días)               |
| cantidad                 | varchar(50)                  | YES  |     | NULL      |                | Cantidad o volumen de sangrado                      |
| dolor                    | varchar(50)                  | YES  |     | NULL      |                | Presencia e intensidad de dolor menstrual           |
| fecha_ultima_menstruacion| date                          | YES  |     | NULL      |                | Fecha de la última menstruación                     |
| vida_sexual_activa       | enum('Si','No')              | YES  |     | NULL      |                | Si mantiene vida sexual activa                      |
| anticoncepcion           | enum('Si','No')              | YES  |     | NULL      |                | Si usa métodos anticonceptivos                      |
| tipo_anticonceptivo      | varchar(100)                 | YES  |     | NULL      |                | Tipo de método anticonceptivo                       |
| gestas                   | tinyint(4)                   | YES  |     | NULL      |                | Número de embarazos                                 |
| partos                   | tinyint(4)                   | YES  |     | NULL      |                | Número de partos                                    |
| cesareas                 | tinyint(4)                   | YES  |     | NULL      |                | Número de cesáreas                                  |
| abortos                  | tinyint(4)                   | YES  |     | NULL      |                | Número de abortos                                   |
| fecha_ultimo_parto       | date                          | YES  |     | NULL      |                | Fecha del último parto                               |
| fecha_menopausia         | date                          | YES  |     | NULL      |                | Fecha de inicio de menopausia (si aplica)           |


## 🩺 Tabla `antecedentes_personales_patologicos`
Antecedentes de enfermedades, cirugías o condiciones previas.

| Columna     | Tipo        | Null | Key | Default   | Extra          |
|-------------|-------------|------|-----|-----------|----------------|
| id_app      | int(11)     | NO   | PRI | NULL      | auto_increment |
| id_perfil   | int(11)     | NO   | MUL | NULL      |                |
| antecedente | varchar(100)| NO   |     | NULL      |                |
| descripcion | text        | YES  |     | NULL      |                |
| creado      | date        | NO   |     | curdate() |                |
| actualizado | date        | NO   |     | curdate() |                |

---


## ⚖️ Tabla `exploracion_fisica`
Resultados de exploraciones físicas del paciente.

| Columna              | Tipo        | Null | Key | Default   | Extra          |
|----------------------|-------------|------|-----|-----------|----------------|
| id_exploracion       | int(11)     | NO   | PRI | NULL      | auto_increment |
| id_perfil            | int(11)     | NO   | MUL | NULL      |                |
| peso_actual          | decimal(5,2)| YES  |     | NULL      |                |
| peso_anterior        | decimal(5,2)| YES  |     | NULL      |                |
| peso_deseado         | decimal(5,2)| YES  |     | NULL      |                |
| peso_ideal           | decimal(5,2)| YES  |     | NULL      |                |
| talla_cm             | decimal(5,2)| YES  |     | NULL      |                |
| imc                  | decimal(5,2)| YES  |     | NULL      |                |
| rtg                  | decimal(5,2)| YES  |     | NULL      |                |
| ta_mmhg              | varchar(15) | YES  |     | NULL      |                |
| frecuencia_cardiaca  | int(11)     | YES  |     | NULL      |                |
| frecuencia_respiratoria| int(11)   | YES  |     | NULL      |                |
| temperatura_c        | decimal(4,1)| YES  |     | NULL      |                |
| cadera_cm            | decimal(5,2)| YES  |     | NULL      |                |
| cintura_cm           | decimal(5,2)| YES  |     | NULL      |                |
| cabeza               | text        | YES  |     | NULL      |                |
| cuello               | text        | YES  |     | NULL      |                |
| torax                | text        | YES  |     | NULL      |                |
| abdomen              | text        | YES  |     | NULL      |                |
| genitales            | text        | YES  |     | NULL      |                |
| extremidades         | text        | YES  |     | NULL      |                |
| creado               | date        | NO   |     | curdate() |                |
| actualizado          | date        | NO   |     | curdate() |                |

## 📝 Tabla `consultas`
Registra cada consulta médica realizada a un paciente, con diagnóstico, tratamiento y síntomas por sistemas.

| Columna                  | Tipo        | Null | Key | Default   | Extra          | Descripción                                                           |
|--------------------------|------------|------|-----|-----------|----------------|------------------------------------------------------------------------|
| id_consulta             | int(11)     | NO   | PRI | NULL      | auto_increment | Identificador único de la consulta                                     |
| id_perfil               | int(11)     | NO   | MUL | NULL      |                | Clave foránea a `perfil.id_perfil`                                    |
| fecha_consulta          | date        | NO   |     | NULL      |                | Fecha en la que se realizó la consulta                                 |
| padecimiento_actual     | text        | YES  |     | NULL      |                | Descripción del padecimiento o motivo de la consulta                   |
| diagnostico             | text        | YES  |     | NULL      |                | Diagnóstico médico principal                                           |
| tratamiento             | text        | YES  |     | NULL      |                | Tratamiento prescrito                                                  |
| notas                   | text        | YES  |     | NULL      |                | Notas adicionales                                                     |
| sintomas_generales_desc | text        | YES  |     | NULL      |                | Descripción de síntomas generales                                      |
| sintomas_generales_estado| varchar(15)| YES  |     | NULL      |                | Estado de síntomas generales (por ejemplo: Normal, Alterado)           |
| endocrino_desc          | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema endocrino                          |
| endocrino_estado        | varchar(15) | YES  |     | NULL      |                | Estado del sistema endocrino                                           |
| organos_sentidos_desc   | text        | YES  |     | NULL      |                | Descripción de hallazgos en órganos de los sentidos                    |
| organos_sentidos_estado | varchar(15) | YES  |     | NULL      |                | Estado de órganos de los sentidos                                      |
| gastrointestinal_desc   | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema gastrointestinal                   |
| gastrointestinal_estado | varchar(15) | YES  |     | NULL      |                | Estado del sistema gastrointestinal                                    |
| cardiopulmonar_desc     | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema cardiopulmonar                     |
| cardiopulmonar_estado   | varchar(15) | YES  |     | NULL      |                | Estado del sistema cardiopulmonar                                     |
| genitourinario_desc     | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema genitourinario                     |
| genitourinario_estado   | varchar(15) | YES  |     | NULL      |                | Estado del sistema genitourinario                                      |
| genital_femenino_desc   | text        | YES  |     | NULL      |                | Descripción de hallazgos en genitales femeninos                        |
| genital_femenino_estado | varchar(15) | YES  |     | NULL      |                | Estado de genitales femeninos                                          |
| sexualidad_desc         | text        | YES  |     | NULL      |                | Descripción de hallazgos en sexualidad                                 |
| sexualidad_estado       | varchar(15) | YES  |     | NULL      |                | Estado de sexualidad                                                   |
| dermatologico_desc      | text        | YES  |     | NULL      |                | Descripción de hallazgos en piel y anexos                              |
| dermatologico_estado    | varchar(15) | YES  |     | NULL      |                | Estado dermatológico                                                   |
| neurologico_desc        | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema neurológico                         |
| neurologico_estado      | varchar(15) | YES  |     | NULL      |                | Estado del sistema neurológico                                         |
| hematologico_desc       | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema hematológico                        |
| hematologico_estado     | varchar(15) | YES  |     | NULL      |                | Estado del sistema hematológico                                        |
| reumatologico_desc      | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema reumatológico                       |
| reumatologico_estado    | varchar(15) | YES  |     | NULL      |                | Estado del sistema reumatológico                                       |
| psiquiatrico_desc       | text        | YES  |     | NULL      |                | Descripción de hallazgos en sistema psiquiátrico                        |
| psiquiatrico_estado     | varchar(15) | YES  |     | NULL      |                | Estado del sistema psiquiátrico                                        |
| medicamentos_desc       | text        | YES  |     | NULL      |                | Descripción de medicamentos en uso o administrados                      |
| medicamentos_estado     | varchar(15) | YES  |     | NULL      |                | Estado o control de medicamentos                                       |
| recordatorio            | date        | YES  |     | NULL      |                | Fecha de recordatorio para seguimiento o próxima revisión               |

## 🎨 Tabla `personalizados`
Permite registrar campos personalizados definidos por paciente y ligados a una consulta específica.  
**Notas**:  
- Relación N:1 con `perfil` (`id_perfil`).  
- Relación N:1 con `consultas` (`id_consulta`).  
- Si se elimina el perfil o la consulta, los registros personalizados asociados también se eliminan (`ON DELETE CASCADE`).  

| Columna          | Tipo        | Null | Key | Default   | Extra          | Descripción                                               |
|------------------|-------------|------|-----|-----------|----------------|-----------------------------------------------------------|
| id_personalizado | int(11)     | NO   | PRI | NULL      | auto_increment | Identificador único del registro personalizado            |
| id_perfil        | int(11)     | NO   | MUL | NULL      |                | Clave foránea a `perfil.id_perfil`                        |
| id_consulta      | int(11)     | NO   | MUL | NULL      |                | Clave foránea a `consultas.id_consulta`                   |
| nombre           | varchar(100)| NO   |     | NULL      |                | Nombre del campo o etiqueta personalizada                 |
| descripcion      | varchar(255)| NO   |     | NULL      |                | Valor o detalle del campo personalizado                   |
| creado           | date        | NO   |     | curdate() |                | Fecha de creación del registro                            |
| actualizado      | date        | NO   |     | curdate() |                | Fecha de última actualización                             |

### 🔗 Relaciones
- Cada fila en `personalizados` **debe** estar asociada a un `perfil` y a una `consulta`.  
- `ON DELETE CASCADE` asegura que al eliminar un perfil o una consulta, los personalizados dependientes desaparezcan.  
- Esto permite que los médicos agreguen información flexible (campos adicionales) por consulta sin alterar el modelo fijo de las otras tablas.


- Tabla raíz: `perfil` (`id_perfil` PK). Todas las demás tablas clínicas cuelgan de este ID.
- Relaciones 1:1 con `perfil` (una fila por perfil, `id_perfil` único):
  - `antecedentes_personales`
  - `gineco_obstetricos`
  - `exploracion_fisica`
  
  - Implementación: el backend usa UPSERT (`INSERT ... ON DUPLICATE KEY UPDATE`) sobre `id_perfil`, lo que implica un índice UNIQUE en `id_perfil` en estas tablas.
- Relaciones 1:N con `perfil` (múltiples filas por perfil):
  - `antecedentes_familiares`
  - `antecedentes_personales_patologicos`
  - `consultas`
  - Implementación: el backend inserta una fila por cada elemento del arreglo recibido, con `id_perfil` como FK.

Diagrama (cardinalidad):

  perfil (1) ─── (1) antecedentes_personales
        │
        ├──── (1) gineco_obstetricos
        │
        ├──── (1) exploracion_fisica
        │
        ├──── (N) consultas
        │
        ├──── (N) antecedentes_familiares
        │
        └──── (N) antecedentes_personales_patologicos

Notas de mapeo según add():
- El endpoint de alta primero crea el `perfil` y obtiene `id_perfil`; luego pobla las tablas relacionadas usando ese ID.
- En `exploracion_fisica`, el arreglo `inspeccion_general[]` se desnormaliza a columnas de texto: `cabeza`, `cuello`, `torax`, `abdomen`, `genitales`, `extremidades`.
- En `consultas`, además de `fecha_consulta`, `recordatorio`, `padecimiento_actual`, `diagnostico`, `tratamiento`, `notas`, el arreglo `interrogatorio_aparatos[]` se desnormaliza a columnas `*_desc` (por ejemplo: `sintomas_generales_desc`, `endocrino_desc`, `gastrointestinal_desc`, etc.).
- Los strings vacíos se normalizan como `NULL`; las fechas se recortan a `YYYY-MM-DD`.
- Recomendación de integridad referencial: definir `FOREIGN KEY (id_perfil) REFERENCES perfil(id_perfil)` en todas las tablas hijas; para las tablas 1:1, además `UNIQUE (id_perfil)`. Opcionalmente `ON DELETE CASCADE` para limpiar dependencias al borrar un perfil.
