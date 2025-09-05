# 🗄️ Esquema de Base de Datos Clínica  

La base está compuesta por **7 tablas**.  
Cada sección del expediente clínico tiene su propia tabla y todas están ligadas a **`perfil`** mediante llaves foráneas.  

---

## 👤 perfil  
Tabla principal con los **datos personales** del paciente.  

| Campo              | Tipo                                       | Nulo | Extra              |
|--------------------|--------------------------------------------|------|--------------------|
| id_perfil          | int(11)                                    | NO   | PK, auto_increment |
| nombre             | varchar(100)                               | NO   |                    |
| fecha_nacimiento   | date                                       | SÍ   |                    |
| genero             | enum('Hombre','Mujer','NA')                | SÍ   | default 'NA'       |
| telefono_movil     | varchar(20)                                | SÍ   |                    |
| correo_electronico | varchar(100)                               | SÍ   |                    |
| residencia         | varchar(255)                               | SÍ   |                    |
| ocupacion          | varchar(50)                                | SÍ   |                    |
| escolaridad        | varchar(100)                               | SÍ   |                    |
| estado_civil       | enum('Soltero','Casado','Divorciado','Viudo','Union libre','Otro') | SÍ | |
| tipo_sangre        | varchar(10)                                | SÍ   |                    |
| referido_por       | varchar(100)                               | SÍ   |                    |
| actualizado        | timestamp                                  | SÍ   | auto-update        |

---

## 🧬 antecedentes_familiares  
**Varios registros por perfil.**  

| Campo                   | Tipo        | Nulo | Extra              |
|--------------------------|-------------|------|--------------------|
| id_antecedente_familiar | int(11)     | NO   | PK, auto_increment |
| id_perfil               | int(11)     | NO   | FK → perfil        |
| nombre                  | varchar(100)| NO   |                    |
| descripcion             | text        | SÍ   |                    |
| creado                  | timestamp   | NO   | default now        |
| actualizado             | timestamp   | NO   | auto-update        |

---

## 🍷🚬 antecedentes_personales  
**Hábitos y alimentación.**  
Un registro único por perfil.  

| Campo              | Tipo                    | Nulo |
|--------------------|-------------------------|------|
| id_ap              | int(11) PK              | NO   |
| id_perfil          | int(11) FK → perfil, **UNIQUE** | NO |
| bebidas_por_dia    | decimal(4,1)            | SÍ   |
| tiempo_activo_alc  | varchar(50)             | SÍ   |
| cigarrillos_por_dia| varchar(10)             | SÍ   |
| tiempo_activo_tab  | varchar(50)             | SÍ   |
| tipo_toxicomania   | varchar(100)            | SÍ   |
| tiempo_activo_tox  | varchar(50)             | SÍ   |
| calidad            | enum('Buena','Regular','Mala') | SÍ |
| descripcion        | text                    | SÍ   |
| hay_cambios        | enum('Si','No') default 'No' | SÍ |
| cambio_tipo        | varchar(120)            | SÍ   |
| cambio_causa       | varchar(120)            | SÍ   |
| cambio_tiempo      | varchar(60)             | SÍ   |
| creado             | timestamp               | NO   |
| actualizado        | timestamp               | NO   |

---

## 🏥 antecedentes_personales_patologicos  
**Patologías previas.**  
Un perfil puede tener **muchos antecedentes patológicos**.  

| Campo        | Tipo         | Nulo |
|--------------|--------------|------|
| id_app       | int(11) PK   | NO   |
| id_perfil    | int(11) FK → perfil | NO   |
| antecedente  | varchar(100) | NO   |
| descripcion  | text         | SÍ   |
| creado       | timestamp    | NO   |
| actualizado  | timestamp    | NO   |

---

## 🩺 padecimiento_actual_interrogatorio  
**Una sola fila por perfil**, con todos los aparatos y sistemas.  

| Campo              | Tipo   |
|--------------------|--------|
| id_pai             | int(11) PK |
| id_perfil          | int(11) FK, **UNIQUE** |
| padecimiento_actual| text   |
| sintomas_generales | text   |
| endocrino          | text   |
| organos_sentidos   | text   |
| gastrointestinal   | text   |
| cardiopulmonar     | text   |
| genitourinario     | text   |
| genital_femenino   | text   |
| sexualidad         | text   |
| dermatologico      | text   |
| neurologico        | text   |
| hematologico       | text   |
| reumatologico      | text   |
| psiquiatrico       | text   |
| medicamentos       | text   |
| creado             | timestamp |
| actualizado        | timestamp |

---

## ⚖️ exploracion_fisica  
**Una sola fila por perfil.**  
Contiene mediciones antropométricas, vitales y exploración general.  

| Campo                  | Tipo       |
|------------------------|------------|
| id_exploracion         | int(11) PK |
| id_perfil              | int(11) FK, **UNIQUE** |
| peso_actual            | decimal(5,2) |
| peso_anterior          | decimal(5,2) |
| peso_deseado           | decimal(5,2) |
| peso_ideal             | decimal(5,2) |
| talla_cm               | decimal(5,2) |
| imc                    | decimal(5,2) |
| rtg                    | decimal(5,2) |
| ta_mmhg                | varchar(15) |
| pulso                  | int(11)    |
| frecuencia_cardiaca    | int(11)    |
| frecuencia_respiratoria| int(11)    |
| temperatura_c          | decimal(4,1) |
| cadera_cm              | decimal(5,2) |
| cintura_cm             | decimal(5,2) |
| cabeza                 | text       |
| cuello                 | text       |
| torax                  | text       |
| abdomen                | text       |
| genitales              | text       |
| extremidades           | text       |
| creado                 | timestamp  |
| actualizado            | timestamp  |

---

## 🧾 diagnostico_tratamiento  
**Diagnóstico final y plan de acción.**  
Una fila por perfil.  

| Campo        | Tipo      |
|--------------|-----------|
| id_dt        | int(11) PK |
| id_perfil    | int(11) FK, **UNIQUE** |
| diagnostico  | text      |
| tratamiento  | text      |
| pronostico   | text      |
| notas        | text      |
| creado       | timestamp |
| actualizado  | timestamp |

---

## 🔗 Relaciones  

- `perfil (1) —— (N)` `antecedentes_familiares`  
- `perfil (1) —— (1)` `antecedentes_personales`  
- `perfil (1) —— (N)` `antecedentes_personales_patologicos`  
- `perfil (1) —— (1)` `padecimiento_actual_interrogatorio`  
- `perfil (1) —— (1)` `exploracion_fisica`  
- `perfil (1) —— (1)` `diagnostico_tratamiento`  
