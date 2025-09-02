// src/pages/Modify.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  AddContainer, FormCard, Title, Form, FieldGroup, Label, Input,
  TextArea, Select, ButtonRow, SubmitButton, CancelButton,
  TwoColumnRow,
} from './Add.styles';
import { Palette } from '../helpers/theme';
import { url } from '../helpers/url';

// íconos
import {
  FaUserCircle, FaVenusMars, FaEnvelope, FaPhoneAlt, FaHome,
  FaBirthdayCake, FaBriefcase, FaCalendarAlt, FaCar, FaRegLightbulb,
  FaMoneyCheckAlt, FaLock, FaStickyNote, FaEdit
} from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';

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

/* ---------- Catálogos ---------- */

export default function Modify() {
  const { id } = useParams();
  const [formData,   setFormData]   = useState(initialState);
  const [loading,    setLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Cargar datos existentes ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${url}/api/profile/${id}`, { credentials:'include' });
        if (!res.ok) throw new Error('No se pudo cargar el perfil');
        const data = await res.json();
        const rest = { ...data };
        delete rest.numero_poliza;
        delete rest.fecha_inicio_poliza;
        delete rest.fecha_termino_poliza;
        delete rest.categoria_poliza;
        delete rest.subcategoria_poliza;
        delete rest.detalle_poliza;
        delete rest.tipo_poliza;
        delete rest.seguros_contratados;
        delete rest.dependientes;
        setFormData({
          ...initialState,
          ...rest,
          fecha_nacimiento:      data.fecha_nacimiento?.slice(0,10)      ?? '',
          ultima_fecha_contacto: data.ultima_fecha_contacto?.slice(0,10) ?? '',
        });
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- Handlers ---------- */
  const handleChange = ({ target:{ name,value } }) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = Object.fromEntries(
      Object.entries(formData).map(([k,v]) => [k, typeof v==='string' ? v.trim() : v])
    );

    // recorta fechas ISO
    ['fecha_nacimiento','ultima_fecha_contacto',
     'fecha_inicio_poliza','fecha_termino_poliza']
     .forEach(f => { if (payload[f]) payload[f] = payload[f].slice(0,10); });

    try {
      const res = await fetch(`${url}/api/profile/${id}`, {
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        credentials:'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) alert('Cambios guardados ✅');
      else       alert('Error al guardar ❌');
    } catch (err) {
      console.error(err);
      alert('Error de red 🌐');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => setFormData(initialState);

  const Required = () => (
    <AiFillStar style={{marginLeft:'0.25rem',verticalAlign:'middle',
      color:Palette.cyan,fontSize:'2.2rem'}} title="Obligatorio" />
  );

  if (loading) return <p style={{textAlign:'center'}}>Cargando… ⏳</p>;

  /* ---------- UI ---------- */
  return (
    <>
      <Header />
      <AddContainer>
        <FormCard>
          <Title><span>Modificar</span> perfil de {formData.nombre}</Title>

          <Form onSubmit={handleSubmit}>
            {/* 1ª fila */}
            <TwoColumnRow>
              <FieldGroup>
                <Label htmlFor="nombre"><FaUserCircle/> Nombre<Required/></Label>
                <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required/>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="genero"><FaVenusMars/> Género<Required/></Label>
                <Select id="genero" name="genero" value={formData.genero} onChange={handleChange} required>
                  <option value="">-- Selecciona --</option>
                  <option value="Hombre">Masculino</option>
                  <option value="Mujer">Femenino</option>
                </Select>
              </FieldGroup>
            </TwoColumnRow>

            {/* 2ª fila contacto */}
            <TwoColumnRow>
              <FieldGroup>
                <Label htmlFor="correo_electronico"><FaEnvelope/> Correo</Label>
                <Input id="correo_electronico" type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange}/>
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="telefono_movil"><FaPhoneAlt/> Teléfono<Required/></Label>
                <Input id="telefono_movil" type="tel" name="telefono_movil" value={formData.telefono_movil} onChange={handleChange} required/>
              </FieldGroup>
            </TwoColumnRow>

            {/* Dirección fragmentada */}
            <TwoColumnRow>
              <FieldGroup>
                <Label htmlFor="calle"><FaHome/> Calle</Label>
                <Input id="calle" name="calle" value={formData.calle} onChange={handleChange}/>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="numero_int_ext"><FaLock/> Núm. int/ext</Label>
                <Input id="numero_int_ext" name="numero_int_ext" value={formData.numero_int_ext} onChange={handleChange}/>
              </FieldGroup>
            </TwoColumnRow>

            <TwoColumnRow>
              <FieldGroup>
                <Label htmlFor="colonia">🏘️ Colonia</Label>
                <Input id="colonia" name="colonia" value={formData.colonia} onChange={handleChange}/>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="ciudad_municipio">🏙️ Ciudad/Municipio</Label>
                <Input id="ciudad_municipio" name="ciudad_municipio" value={formData.ciudad_municipio} onChange={handleChange}/>
              </FieldGroup>
            </TwoColumnRow>

            <FieldGroup>
              <Label htmlFor="codigo_postal">📮 C.P.</Label>
              <Input id="codigo_postal" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange}/>
            </FieldGroup>
            {/* Fechas */}
            <TwoColumnRow>
              <FieldGroup>
                <Label htmlFor="fecha_nacimiento"><FaBirthdayCake/> Nacimiento</Label>
                <Input id="fecha_nacimiento" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange}/>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="ultima_fecha_contacto"><FaCalendarAlt/> Último contacto</Label>
                <Input id="ultima_fecha_contacto" type="date" name="ultima_fecha_contacto" value={formData.ultima_fecha_contacto} onChange={handleChange}/>
              </FieldGroup>
            </TwoColumnRow>

            {/* Campo de aseguradora eliminado del formulario de perfil */}

            {/* Ocupación y notas */}
            <FieldGroup>
              <Label htmlFor="ocupacion"><FaBriefcase/> Ocupación</Label>
              <Input id="ocupacion" name="ocupacion" value={formData.ocupacion} onChange={handleChange}/>
            </FieldGroup>

            {/* TextAreas grandes */}
            {[
              ['autos',              'Autos',              <FaCar/>],
              ['aspiraciones_suenos','Aspiraciones / Sueños',<FaRegLightbulb/>],
              ['potenciales_seguros','Potenciales seguros',<FaMoneyCheckAlt/>],
              ['notas',              'Notas',              <FaStickyNote/>]
            ].map(([field,label,icon]) => (
              <FieldGroup key={field}>
                <Label htmlFor={field}>{icon} {label}</Label>
                <TextArea id={field} name={field} value={formData[field]} onChange={handleChange}/>
              </FieldGroup>
            ))}

            {/* Botones */}
            <ButtonRow>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Guardar cambios ✅'}
              </SubmitButton>
              <CancelButton type="button" onClick={handleCancel}>Restablecer</CancelButton>
            </ButtonRow>
          </Form>
        </FormCard>
      </AddContainer>
    </>
  );
}
