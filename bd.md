# 📂 Esquema de Base de Datos

## 🧑 Tabla `clientes`

Contiene la información personal y de contexto de cada cliente.

| Campo                   | Tipo                   | Null | Key | Extra           | Descripción                                  |
| ----------------------- | ---------------------- | ---- | --- | --------------- | -------------------------------------------- |
| id\_cliente             | int(11)                | NO   | PRI | auto\_increment | Identificador único del cliente              |
| nombre                  | varchar(100)           | NO   |     |                 | Nombre completo del cliente                  |
| fecha\_nacimiento       | date                   | NO   |     |                 | Fecha de nacimiento                          |
| genero                  | enum('Hombre','Mujer') | NO   |     |                 | Género                                       |
| direccion\_completa     | varchar(255)           | SÍ   |     |                 | Dirección completa                           |
| calle                   | varchar(100)           | SÍ   |     |                 | Calle                                        |
| numero\_int\_ext        | varchar(20)            | SÍ   |     |                 | Número interior/exterior                     |
| colonia                 | varchar(100)           | SÍ   |     |                 | Colonia o barrio                             |
| ciudad\_municipio       | varchar(100)           | SÍ   |     |                 | Ciudad/Municipio                             |
| codigo\_postal          | varchar(10)            | SÍ   |     |                 | Código postal                                |
| telefono\_movil         | varchar(20)            | SÍ   |     |                 | Teléfono móvil                               |
| correo\_electronico     | varchar(100)           | SÍ   |     |                 | Correo electrónico                           |
| ocupacion               | varchar(50)            | SÍ   |     |                 | Ocupación                                    |
| seguros\_contratados    | text                   | SÍ   |     |                 | Lista o descripción de seguros contratados   |
| potenciales\_seguros    | text                   | SÍ   |     |                 | Seguros que podrían interesar                |
| dependientes            | text                   | SÍ   |     |                 | Dependientes económicos                      |
| autos                   | text                   | SÍ   |     |                 | Información de automóviles                   |
| tipo\_poliza            | varchar(50)            | SÍ   |     |                 | Tipo de póliza (duplicado con tabla polizas) |
| aseguradora             | varchar(50)            | SÍ   |     |                 | Aseguradora (duplicado)                      |
| numero\_poliza          | varchar(100)           | SÍ   |     |                 | Número de póliza (duplicado)                 |
| categoria\_poliza       | varchar(50)            | SÍ   |     |                 | Categoría de póliza (duplicado)              |
| subcategoria\_poliza    | varchar(50)            | SÍ   |     |                 | Subcategoría de póliza (duplicado)           |
| detalle\_poliza         | varchar(50)            | SÍ   |     |                 | Detalle de póliza (duplicado)                |
| fecha\_inicio\_poliza   | date                   | SÍ   |     |                 | Fecha inicio (duplicado)                     |
| fecha\_termino\_poliza  | date                   | SÍ   |     |                 | Fecha fin (duplicado)                        |
| aspiraciones\_suenos    | text                   | SÍ   |     |                 | Metas/aspiraciones del cliente               |
| notas                   | text                   | SÍ   |     |                 | Notas varias                                 |
| ultima\_fecha\_contacto | date                   | SÍ   |     |                 | Última fecha de contacto                     |

---

## 📑 Tabla `polizas`

Registra las pólizas de seguros formalmente.

| Campo                  | Tipo                   | Null | Key | Extra                        | Descripción                          |
| ---------------------- | ---------------------- | ---- | --- | ---------------------------- | ------------------------------------ |
| id\_poliza             | int(11)                | NO   | PRI | auto\_increment              | Identificador único de póliza        |
| aseguradora            | varchar(50)            | SÍ   | MUL |                              | Nombre de la aseguradora             |
| numero\_poliza         | varchar(100)           | NO   | UNI |                              | Número único de póliza               |
| categoria\_poliza      | varchar(50)            | SÍ   |     |                              | Categoría (ej. vida, gastos médicos) |
| subcategoria\_poliza   | varchar(50)            | SÍ   |     |                              | Subcategoría                         |
| detalle\_poliza        | varchar(100)           | SÍ   |     |                              | Detalles adicionales                 |
| notas                  | varchar(500)           | SÍ   |     |                              | Observaciones                        |
| fecha\_inicio\_poliza  | date                   | SÍ   |     |                              | Fecha de inicio                      |
| fecha\_termino\_poliza | date                   | SÍ   |     |                              | Fecha de vencimiento                 |
| titular\_id\_cliente   | int(11)                | NO   | MUL |                              | Cliente titular de la póliza         |
| created\_at            | timestamp              | NO   |     | current\_timestamp           | Fecha de creación                    |
| updated\_at            | timestamp              | NO   |     | on update current\_timestamp | Última actualización                 |
| forma\_pago            | varchar(50)            | SÍ   |     |                              | Forma de pago                        |
| periodicidad\_pago     | varchar(20)            | SÍ   |     |                              | Periodicidad del pago                |
| prima                  | decimal(12,2) unsigned | SÍ   |     |                              | Prima (costo del seguro)             |

---

## 👥 Tabla `poliza_participante`

Define los clientes vinculados a una póliza como asegurados o beneficiarios.

| Campo                    | Tipo                             | Null | Key | Extra                        | Descripción                                     |
| ------------------------ | -------------------------------- | ---- | --- | ---------------------------- | ----------------------------------------------- |
| id\_poliza\_participante | bigint(20) unsigned              | NO   | PRI | auto\_increment              | Identificador único                             |
| poliza\_id               | int(11)                          | NO   | MUL |                              | Relación con `polizas.id_poliza`                |
| cliente\_id              | int(11)                          | NO   | MUL |                              | Relación con `clientes.id_cliente`              |
| rol                      | enum('asegurado','beneficiario') | NO   | MUL |                              | Rol del cliente dentro de la póliza             |
| porcentaje               | decimal(5,2)                     | SÍ   |     |                              | Porcentaje de participación (ej. beneficiarios) |
| created\_at              | timestamp                        | NO   |     | current\_timestamp           | Fecha de creación                               |
| updated\_at              | timestamp                        | NO   |     | on update current\_timestamp | Última actualización                            |

---

# 🔗 Relaciones entre tablas

* **`clientes` ↔ `polizas`**
  Relación **uno a muchos**:

  * Un cliente puede ser titular de varias pólizas (`polizas.titular_id_cliente` referencia a `clientes.id_cliente`).
  * Una póliza tiene exactamente un titular.

* **`polizas` ↔ `poliza_participante`**
  Relación **uno a muchos**:

  * Una póliza puede tener varios participantes.
  * Cada participante puede ser asegurado o beneficiario.

* **`clientes` ↔ `poliza_participante`**
  Relación **muchos a muchos** (implementada vía tabla intermedia):

  * Un cliente puede participar en varias pólizas.
  * Una póliza puede tener múltiples clientes como asegurados o beneficiarios.
