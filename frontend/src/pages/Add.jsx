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
  Select,
  ButtonRow,
  SubmitButton,
  Palette,
  TwoColumnRow,
} from './Add.styles';
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
} from 'react-icons/fa';

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
};

const Add = () => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

              {/* Correo y Residencia */}
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
                  <Label htmlFor="residencia">
                    <FaHome style={{ marginRight: '0.5rem' }} />
                    Residencia
                  </Label>
                  <Input
                    id="residencia"
                    name="residencia"
                    value={formData.residencia}
                    onChange={handleChange}
                    maxLength={255}
                    placeholder="Ciudad, colonia y/o dirección"
                  />
                </FieldGroup>
              </TwoColumnRow>

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

