import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import {
  FaUser,
  FaBirthdayCake,
  FaPhone,
  FaUserPlus,
  FaGraduationCap,
  FaTint,
  FaIdBadge,
  FaCalendarAlt,
  FaBell,
  FaStickyNote,
} from 'react-icons/fa';
import { MdEmail, MdHome, MdWork } from 'react-icons/md';
import { Palette } from '../../helpers/theme';
import {
  Summary,
  TwoColumnRow,
  FieldGroup,
  Label,
  Input,
  TextArea,
  Select,
} from '../../pages/Add.styles';

const Required = () => (
  <AiFillStar
    style={{
      marginLeft: '0.25rem',
      verticalAlign: 'middle',
      color: Palette.primary,
      fontSize: '2.2rem',
    }}
    title="Obligatorio"
  />
);

const DatosPersonalesSection = ({ formData, onChange, isOpen, onToggle, nombreRef }) => {
  return (
    <details open={isOpen} onToggle={onToggle}>
      <Summary>
        Datos personales
      </Summary>

      {/* Nombre (requerido) y Género */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="nombre">
            <FaUser style={{ marginRight: '0.5rem' }} />
            Nombre
            <Required />
          </Label>
          <Input
            id="nombre"
            name="nombre"
            ref={nombreRef}
            value={formData.nombre}
            onChange={onChange}
            required
            maxLength={100}
            placeholder="Nombre completo"
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="genero">
            {/* icon removed */}
            Género
          </Label>
          <Select
            id="genero"
            name="genero"
            value={formData.genero}
            onChange={onChange}
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
            onChange={onChange}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="telefono_movil">
            <FaPhone style={{ marginRight: '0.5rem' }} />
            Teléfono móvil
          </Label>
          <Input
            id="telefono_movil"
            type="tel"
            name="telefono_movil"
            value={formData.telefono_movil}
            onChange={onChange}
            maxLength={20}
            placeholder="52XXXXXXXXXX"
          />
        </FieldGroup>
      </TwoColumnRow>

      {/* Correo y Referido por */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="correo_electronico">
            <MdEmail style={{ marginRight: '0.5rem' }} />
            Correo electrónico
          </Label>
          <Input
            id="correo_electronico"
            type="email"
            name="correo_electronico"
            value={formData.correo_electronico}
            onChange={onChange}
            maxLength={100}
            placeholder="mail@ejemplo.com"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="referido_por">
            <FaUserPlus style={{ marginRight: '0.5rem' }} />
            Referido por
          </Label>
          <Input
            id="referido_por"
            name="referido_por"
            value={formData.referido_por}
            onChange={onChange}
            maxLength={100}
            placeholder="Persona o canal de referencia"
          />
        </FieldGroup>
      </TwoColumnRow>

      {/* Dirección Completa (full width) */}
      <FieldGroup>
        <Label htmlFor="residencia">
          <MdHome style={{ marginRight: '0.5rem' }} />
          Dirección Completa
        </Label>
        <TextArea
          id="residencia"
          name="residencia"
          value={formData.residencia}
          onChange={onChange}
          maxLength={255}
          rows={4}
          placeholder="Calle, número, colonia, ciudad, CP"
        />
      </FieldGroup>

      {/* Ocupación y Escolaridad */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="ocupacion">
            <MdWork style={{ marginRight: '0.5rem' }} />
            Ocupación
          </Label>
          <Input
            id="ocupacion"
            name="ocupacion"
            value={formData.ocupacion}
            onChange={onChange}
            maxLength={50}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="escolaridad">
            <FaGraduationCap style={{ marginRight: '0.5rem' }} />
            Escolaridad
          </Label>
          <Input
            id="escolaridad"
            name="escolaridad"
            value={formData.escolaridad}
            onChange={onChange}
            maxLength={100}
          />
        </FieldGroup>
      </TwoColumnRow>

      {/* Estado civil y Tipo de sangre */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="estado_civil">Estado civil</Label>
          <Select id="estado_civil" name="estado_civil" value={formData.estado_civil} onChange={onChange}>
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
            <FaTint style={{ marginRight: '0.5rem' }} />
            Tipo de sangre
          </Label>
          <Input id="tipo_sangre" name="tipo_sangre" value={formData.tipo_sangre} onChange={onChange} maxLength={10} placeholder="Ej. O+, A-" />
        </FieldGroup>
      </TwoColumnRow>

      {/* Datos de legado */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="id_legado">
            <FaIdBadge style={{ marginRight: '0.5rem' }} />
            ID legado
          </Label>
          <Input
            id="id_legado"
            name="id_legado"
            type="number"
            min="0"
            value={formData.id_legado}
            onChange={onChange}
            placeholder="Ej. 12345"
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="fecha_legado">
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
            Fecha legado
          </Label>
          <Input
            id="fecha_legado"
            name="fecha_legado"
            type="date"
            value={formData.fecha_legado}
            onChange={onChange}
          />
        </FieldGroup>
      </TwoColumnRow>

      {/* Recordatorio del perfil */}
      <TwoColumnRow>
        <FieldGroup>
          <Label htmlFor="recordatorio">
            <FaBell style={{ marginRight: '0.5rem' }} />
            Recordatorio (perfil)
          </Label>
          <Input
            id="recordatorio"
            name="recordatorio"
            type="date"
            value={formData.recordatorio}
            onChange={onChange}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="recordatorio_desc">
            <FaStickyNote style={{ marginRight: '0.5rem' }} />
            Descripción del recordatorio
          </Label>
          <TextArea
            id="recordatorio_desc"
            name="recordatorio_desc"
            value={formData.recordatorio_desc}
            onChange={onChange}
            rows={3}
            maxLength={255}
            placeholder="Notas adicionales del recordatorio"
          />
        </FieldGroup>
      </TwoColumnRow>
    </details>
  );
};

export default DatosPersonalesSection;
