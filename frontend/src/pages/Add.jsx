// add.jsx
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
  CancelButton,
  Palette,  
  TwoColumnRow           // <— IMPORTAMOS la paleta para usar el color
} from './Add.styles';
import { url } from '../helpers/url';

// iconos
import { AiFillStar } from 'react-icons/ai';
import {
  FaVenusMars,
  FaEnvelope,
  FaPhoneAlt,
  FaHome,
  FaBirthdayCake,
  FaBriefcase,
  FaCalendarAlt,
  FaCar,
  FaRegLightbulb,
  FaMoneyCheckAlt,
  FaLock,
  FaStickyNote,
  FaUserCircle,
  
} from 'react-icons/fa';

/* ---------- Estado inicial ---------- */
const initialState = {
  nombre: '',
  genero: '',
  correo_electronico: '',
  telefono_movil: '',
  direccion_completa: '',
  fecha_nacimiento: '',
  ocupacion: '',
  ultima_fecha_contacto: '',
  autos: '',
  aspiraciones_suenos: '',
  potenciales_seguros: '',
  notas: '',
  calle: '',
  numero_int_ext: '',
  colonia: '',
  ciudad_municipio: '',
  codigo_postal: '',
};
const Add = () => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target: { name, value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // 🔹 Normaliza espacios en TODOS los strings
    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : v
      ])
    );

    console.log('🛰️  Payload que viaja 👉', payload); // 👁️ Para verificar en consola

    try {
      const res = await fetch(`${url}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Cliente agregado correctamente');
        setFormData(initialState);
      } else {
        alert('Ocurrió un error al agregar el cliente');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al intentar agregar el cliente');
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
                placeholder="Nombre completo"
                />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="genero">
                <FaVenusMars style={{ marginRight: '0.5rem' }} />
                Género
                <Required />
              </Label>
              <Select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
              >
                <option value="">-- Selecciona --</option>
                <option value="Hombre">Masculino</option>
                <option value="Mujer">Femenino</option>
              </Select>
            </FieldGroup>
          </TwoColumnRow>
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
              placeholder="mail@ejemplo.com"
              />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="telefono_movil">
              <FaPhoneAlt style={{ marginRight: '0.5rem' }} />
              Teléfono móvil
              <Required />
            </Label>
            <Input
              id="telefono_movil"
              type="tel"
              name="telefono_movil"
              value={formData.telefono_movil}
              onChange={handleChange}
              required
              placeholder="Empieza con 52 para México"
              />
          </FieldGroup>
          </TwoColumnRow>
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
              <Label htmlFor="ultima_fecha_contacto">
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Última fecha de contacto
              </Label>
              <Input
                id="ultima_fecha_contacto"
                type="date"
                name="ultima_fecha_contacto"
                value={formData.ultima_fecha_contacto}
                onChange={handleChange}
              />
            </FieldGroup>
          </TwoColumnRow>
          {/* Campo de aseguradora eliminado del formulario de perfil */}
          <TwoColumnRow>
            {/* Calle */}
            <FieldGroup>
              <Label htmlFor="calle">
                <FaHome style={{ marginRight: '0.5rem' }} />
                Calle
              </Label>
              <Input
                id="calle"
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                placeholder="Nombre de la calle"
              />
            </FieldGroup>

            {/* Número interior y exterior */}
            <FieldGroup>
              <Label htmlFor="numero_int_ext">
                <FaLock style={{ marginRight: '0.5rem' }} />
                Núm. interior/exterior
              </Label>
              <Input
                id="numero_int_ext"
                name="numero_int_ext"
                value={formData.numero_int_ext}
                onChange={handleChange}
                placeholder="123 Int. 4 / 567 Ext."
              />
            </FieldGroup>
          </TwoColumnRow>

          <TwoColumnRow>
            {/* Colonia */}
            <FieldGroup>
              <Label htmlFor="colonia">
                🏘️ Colonia
              </Label>
              <Input
                id="colonia"
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                placeholder="Nombre de la colonia"
              />
            </FieldGroup>

            {/* Ciudad / Municipio */}
            <FieldGroup>
              <Label htmlFor="ciudad_municipio">
                🌆 Ciudad / Municipio
              </Label>
              <Input
                id="ciudad_municipio"
                name="ciudad_municipio"
                value={formData.ciudad_municipio}
                onChange={handleChange}
                placeholder="Ciudad o municipio"
              />
            </FieldGroup>
          </TwoColumnRow>
          
          <TwoColumnRow>
            <FieldGroup>
              <Label htmlFor="codigo_postal">
                📫 Código Postal
              </Label>
              <Input
                id="codigo_postal"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                placeholder="p.ej. 74160"
              />
            </FieldGroup>
          </TwoColumnRow>
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
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="autos">
              <FaCar style={{ marginRight: '0.5rem' }} />
              Datos de vehiculo
            </Label>
            <TextArea
              id="autos"
              name="autos"
              value={formData.autos}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="aspiraciones_suenos">
              <FaRegLightbulb style={{ marginRight: '0.5rem' }} />
              Aspiraciones / Sueños
            </Label>
            <TextArea
              id="aspiraciones_suenos"
              name="aspiraciones_suenos"
              value={formData.aspiraciones_suenos}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="potenciales_seguros">
              <FaMoneyCheckAlt style={{ marginRight: '0.5rem' }} />
              Seguros probables
            </Label>
            <TextArea
              id="potenciales_seguros"
              name="potenciales_seguros"
              value={formData.potenciales_seguros}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="notas">
              <FaStickyNote style={{ marginRight: '0.5rem' }} />
              Notas
            </Label>
            <TextArea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
            />
          </FieldGroup>

          {/* Botonera */}
          <ButtonRow>
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Grabando..' : 'Grabar en base de datos 💾'}
            </SubmitButton>
          </ButtonRow>
        </Form>
      </FormCard>
    </AddContainer>
    </>
  );
};

export default Add;
