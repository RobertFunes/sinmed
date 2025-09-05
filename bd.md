# 📊 Documentación de la Base de Datos

Este esquema está diseñado para registrar perfiles de pacientes y toda su información clínica asociada.  
Consta de **7 tablas**: `perfil`, `antecedentes_familiares`, `antecedentes_personales`, `antecedentes_personales_patologicos`, `diagnostico_tratamiento`, `exploracion_fisica` y `padecimiento_actual_interrogatorio`.

---

## 🧑 Tabla `perfil`
Contiene los datos generales de cada paciente.

| Columna           | Tipo                                                        | Null | Key | Default     | Extra          | Descripción                                |
|-------------------|-------------------------------------------------------------|------|-----|-------------|----------------|--------------------------------------------|
| id_perfil         | int(11)                                                     | NO   | PRI | NULL        | auto_increment | Identificador único del perfil             |
| nombre            | varchar(100)                                                | NO   |     | NULL        |                | Nombre completo del paciente               |
| fecha_nacimiento  | date                                                        | YES  |     | NULL        |                | Fecha de nacimiento                        |
| genero            | enum('Hombre','Mujer','NA')                                | YES  |     | NA          |                | Género del paciente                        |
| telefono_movil    | varchar(20)                                                 | YES  |     | NULL        |                | Teléfono móvil                             |
| correo_electronico| varchar(100)                                                | YES  |     | NULL        |                | Correo electrónico                         |
| residencia        | varchar(255)                                                | YES  |     | NULL        |                | Domicilio o residencia                     |
| ocupacion         | varchar(50)                                                 | YES  |     | NULL        |                | Ocupación                                  |
| escolaridad       | varchar(100)                                                | YES  |     | NULL        |                | Nivel educativo                            |
| estado_civil      | enum('Soltero','Casado','Divorciado','Viudo','Union libre','Otro') | YES  |     | NULL        |                | Estado civil                               |
| tipo_sangre       | varchar(10)                                                 | YES  |     | NULL        |                | Grupo y tipo sanguíneo                     |
| referido_por      | varchar(100)                                                | YES  |     | NULL        |                | Fuente de referencia                       |
| actualizado       | date                                                        | NO   |     | curdate()   |                | Fecha de última modificación               |
| creado            | date                                                        | NO   |     | curdate()   |                | Fecha de creación                          |

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

## 💊 Tabla `diagnostico_tratamiento`
Guarda diagnósticos médicos, tratamientos y pronósticos.

| Columna     | Tipo    | Null | Key | Default   | Extra          |
|-------------|---------|------|-----|-----------|----------------|
| id_dt       | int(11) | NO   | PRI | NULL      | auto_increment |
| id_perfil   | int(11) | NO   | MUL | NULL      |                |
| diagnostico | text    | YES  |     | NULL      |                |
| tratamiento | text    | YES  |     | NULL      |                |
| pronostico  | text    | YES  |     | NULL      |                |
| notas       | text    | YES  |     | NULL      |                |
| creado      | date    | NO   |     | curdate() |                |
| actualizado | date    | NO   |     | curdate() |                |

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
| pulso                | int(11)     | YES  |     | NULL      |                |
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

---

## 🧠 Tabla `padecimiento_actual_interrogatorio`
Información sobre el padecimiento actual y síntomas por sistemas.

| Columna           | Tipo | Null | Key | Default   | Extra          |
|-------------------|------|------|-----|-----------|----------------|
| id_pai            | int(11) | NO | PRI | NULL      | auto_increment |
| id_perfil         | int(11) | NO | MUL | NULL      |                |
| padecimiento_actual | text | YES |     | NULL      |                |
| sintomas_generales  | text | YES |     | NULL      |                |
| endocrino           | text | YES |     | NULL      |                |
| organos_sentidos    | text | YES |     | NULL      |                |
| gastrointestinal    | text | YES |     | NULL      |                |
| cardiopulmonar      | text | YES |     | NULL      |                |
| genitourinario      | text | YES |     | NULL      |                |
| genital_femenino    | text | YES |     | NULL      |                |
| sexualidad          | text | YES |     | NULL      |                |
| dermatologico       | text | YES |     | NULL      |                |
| neurologico         | text | YES |     | NULL      |                |
| hematologico        | text | YES |     | NULL      |                |
| reumatologico       | text | YES |     | NULL      |                |
| psiquiatrico        | text | YES |     | NULL      |                |
| medicamentos        | text | YES |     | NULL      |                |
| creado              | date | NO  |     | curdate() |                |
| actualizado         | date | NO  |     | curdate() |                |

---

# 🔗 Relaciones

- `perfil` es la tabla **principal**.  
- Todas las demás tablas tienen `id_perfil` como **clave foránea** (aunque no se ve explícitamente con `FOREIGN KEY`, la relación lógica existe).  
- **antecedentes_personales** es **1:1** con `perfil`.  
- Las demás (`familiares`, `patológicos`, `exploracion_fisica`, `diagnostico_tratamiento`, `padecimiento_actual_interrogatorio`) son **1:N**: un perfil puede tener varios registros.  

---

# 📅 Manejo de fechas

- Todas las tablas tienen campos `creado` y `actualizado` de tipo **DATE** con `DEFAULT curdate()`.  
- Los triggers implementados hacen que `actualizado` se ponga en la fecha del día automáticamente en cada `UPDATE`.  
- No se almacenan horas, evitando problemas de UTC o husos horarios.
