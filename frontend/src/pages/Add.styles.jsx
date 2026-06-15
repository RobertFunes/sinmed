// add.styles.jsx
import { forwardRef } from 'react';
import styled from 'styled-components';

/* 🎨 Paleta centralizada para poder reutilizarla fácilmente */
import { Palette } from '../helpers/theme';

/* ---------- CONTENEDORES PRINCIPALES ---------- */

/* Envuelve toda la vista “Add” */
export const AddContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background-image: url('/bg3.png');
  background-repeat: repeat;
`;

/* Tarjeta que contiene el formulario */
export const FormCard = styled.div`
  width: 100%;
  background: rgba(240, 240, 240, 0.75); /* 85% opaco, 15% transparente */


  box-shadow: 0 0 12px 20px rgb(0 0 0 / 15%);
  border-radius: 8px;
  padding-bottom: 2rem;
`;

/* ---------- TIPOGRAFÍA Y CABECERAS ---------- */

export const Title = styled.h1`
  margin: 0;
  padding: 2.5rem;
  font-size: 2.5rem;
  text-align: center;
  color: ${Palette.background};
  background-color: ${Palette.muted};
  font-family: 'Nunito', sans-serif;
  border-radius: 8px 8px 0 0;
  span {
    color: ${Palette.primary};
  }
`;

/* ---------- ESTRUCTURA DEL FORMULARIO ---------- */

export const Form = styled.form`
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0 2rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

/* Etiquetas */
export const Label = styled.label`
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: ${Palette.secondary};
`;

/* Mixin con estilos compartidos para inputs/selects/textarea */
const inputStyles = `
  
  padding: 0.75rem 1rem;
  border: 1px solid ${Palette.darkGray};
  background: #fff;
  color: ${Palette.text};
  border-radius: 4px;
  font-size: 1rem;
  transition: outline 0.15s ease-in-out;

  &:focus {
    outline: 4px solid ${Palette.primary};
    border-color: transparent;
  }

  &::placeholder {
    color: ${Palette.secondary};
  }
`;

const VARCHAR_LIMITS = {
  nombre: 100,
  telefono: 20,
  telefono_movil: 20,
  correo_electronico: 100,
  residencia: 255,
  ocupacion: 50,
  escolaridad: 100,
  tipo_sangre: 10,
  referido_por: 100,
  alergico: 25,
  antecedente: 100,
  cigarrillos_por_dia: 10,
  tiempo_activo_alc: 50,
  tiempo_inactivo_alc: 50,
  tiempo_activo_tab: 50,
  tiempo_inactivo_tab: 50,
  tipo_toxicomania: 100,
  tiempo_activo_tox: 50,
  tiempo_inactivo_tox: 50,
  cambio_tipo: 120,
  cambio_causa: 120,
  cambio_tiempo: 60,
  peso_ideal: 100,
  ta_mmhg: 15,
  pulso: 20,
  pam: 25,
  cantidad: 50,
  dolor: 50,
  fecha_ultima_menstruacion: 100,
  fecha_ultimo_parto: 100,
  fecha_menopausia: 100,
  tipo_anticonceptivo: 100,
  gineco_cantidad: 50,
  gineco_dolor: 50,
  gineco_fecha_ultima_menstruacion: 100,
  gineco_fecha_ultimo_parto: 100,
  gineco_fecha_menopausia: 100,
  gineco_tipo_anticonceptivo: 100,
  oreja: 20,
  notas_evolucion: 1000,
  sintomas_generales_estado: 15,
  endocrino_estado: 15,
  organos_sentidos_estado: 15,
  gastrointestinal_estado: 15,
  respiratorio_estado: 15,
  cardiopulmonar_estado: 15,
  genitourinario_estado: 15,
  genital_femenino_estado: 15,
  sexualidad_estado: 15,
  dermatologico_estado: 15,
  neurologico_estado: 15,
  hematologico_estado: 15,
  reumatologico_estado: 15,
  psiquiatrico_estado: 15,
  medicamentos_estado: 15,
  medicamentos: 500,
  agua: 50,
  presion: 4000,
  glucosa: 500,
  peso: 100,
  ejercicio: 255,
  desparacitacion: 255,
  fum: 500,
  estado: 50,
  color: 50,
};

const resolveInputLimit = ({ maxLength, name, id }) => {
  const explicit = Number(maxLength);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  const fieldName = String(name || id || '').trim();
  if (!fieldName) return undefined;

  return VARCHAR_LIMITS[fieldName];
};

export const InputLimitWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const CharacterLimitRing = styled.span`
  --size: 1.35rem;
  position: absolute;
  right: 0.75rem;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background:
    radial-gradient(circle at center, #fff 53%, transparent 55%),
    conic-gradient(
      ${({ $isFull, $isNearLimit }) => ($isFull ? '#d32f2f' : $isNearLimit ? '#f57c00' : Palette.primary)}
        ${({ $progress }) => `${$progress * 360}deg`},
      ${Palette.lightGray} 0deg
    );
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  pointer-events: none;
  transition: background 0.15s ease-in-out;

  &::after {
    content: ${({ $remaining, $isNearLimit }) => ($isNearLimit ? `'${$remaining}'` : "''")};
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 0.58rem;
    font-weight: 700;
    color: ${({ $isFull, $isNearLimit }) => ($isFull ? '#d32f2f' : $isNearLimit ? '#7a4a00' : Palette.secondary)};
  }
`;

export const TextAreaLimitWrapper = styled(InputLimitWrapper)`
  align-items: flex-start;
`;

/* Campos de texto */
const StyledInput = styled.input`
  ${inputStyles}
  width: 100%;
  ${({ $hasCharLimit }) => ($hasCharLimit ? 'padding-right: 2.75rem;' : '')}
`;

const getLimitState = ({ maxLength, name, id, value, defaultValue }) => {
  const resolvedMaxLength = resolveInputLimit({ maxLength, name, id });
  const numericMaxLength = Number(resolvedMaxLength);
  const rawValue = value ?? defaultValue ?? '';
  const currentLength = String(rawValue).length;
  const remaining = Math.max(numericMaxLength - currentLength, 0);
  const progress = Math.min(currentLength / numericMaxLength, 1);

  return {
    currentLength,
    hasCharacterLimit: Number.isFinite(numericMaxLength) && numericMaxLength > 0,
    isFull: remaining === 0,
    isNearLimit: progress >= 0.8,
    progress,
    remaining,
    resolvedMaxLength,
  };
};

const clampInputEventValue = (event, maxLength) => {
  const value = event?.target?.value;
  if (typeof value !== 'string' || !Number.isFinite(maxLength) || maxLength <= 0) return;
  if (value.length > maxLength) {
    event.target.value = value.slice(0, maxLength);
  }
};

export const Input = forwardRef(function Input(
  { maxLength, value, defaultValue, type, name, id, disabled, readOnly, onChange, ...props },
  ref
) {
  const {
    hasCharacterLimit,
    isFull,
    isNearLimit,
    progress,
    remaining,
    resolvedMaxLength,
  } = getLimitState({ maxLength, name, id, value, defaultValue });
  const shouldShowCharacterLimit = hasCharacterLimit && !disabled && !readOnly && type !== 'hidden';
  const handleChange = (event) => {
    clampInputEventValue(event, Number(resolvedMaxLength));
    onChange?.(event);
  };

  if (!shouldShowCharacterLimit) {
    return (
      <StyledInput
        ref={ref}
        type={type}
        name={name}
        id={id}
        maxLength={resolvedMaxLength}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        {...props}
      />
    );
  }

  return (
    <InputLimitWrapper>
      <StyledInput
        ref={ref}
        type={type}
        name={name}
        id={id}
        maxLength={resolvedMaxLength}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        $hasCharLimit
        {...props}
      />
      <CharacterLimitRing
        aria-hidden="true"
        $progress={progress}
        $remaining={remaining}
        $isNearLimit={isNearLimit}
        $isFull={isFull}
      />
    </InputLimitWrapper>
  );
});

/* Área de texto */
const StyledTextArea = styled.textarea`
  ${inputStyles}
  width: 100%;
  resize: vertical;
  min-height: 60px;
  ${({ $hasCharLimit }) => ($hasCharLimit ? 'padding-right: 2.75rem;' : '')}
`;

export const TextArea = forwardRef(function TextArea(
  { maxLength, value, defaultValue, name, id, disabled, readOnly, onChange, ...props },
  ref
) {
  const {
    hasCharacterLimit,
    isFull,
    isNearLimit,
    progress,
    remaining,
    resolvedMaxLength,
  } = getLimitState({ maxLength, name, id, value, defaultValue });
  const shouldShowCharacterLimit = hasCharacterLimit && !disabled && !readOnly;
  const handleChange = (event) => {
    clampInputEventValue(event, Number(resolvedMaxLength));
    onChange?.(event);
  };

  if (!shouldShowCharacterLimit) {
    return (
      <StyledTextArea
        ref={ref}
        name={name}
        id={id}
        maxLength={resolvedMaxLength}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        {...props}
      />
    );
  }

  return (
    <TextAreaLimitWrapper>
      <StyledTextArea
        ref={ref}
        name={name}
        id={id}
        maxLength={resolvedMaxLength}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        onChange={handleChange}
        $hasCharLimit
        {...props}
      />
      <CharacterLimitRing
        aria-hidden="true"
        $progress={progress}
        $remaining={remaining}
        $isNearLimit={isNearLimit}
        $isFull={isFull}
      />
    </TextAreaLimitWrapper>
  );
});

/* Select personalizado */
export const Select = styled.select`
  ${inputStyles}
  appearance: none;
  
`;

/* ---------- BOTONERA ---------- */

export const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

/* Botón principal “Guardar / Añadir” */
export const SubmitButton = styled.button`
  width: 25vw;
  padding: 0.75rem 1.5rem;
  background: ${Palette.primary};
  color: ${Palette.secondary};
  font-weight: 600;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${Palette.darkGray};
  }

  &:disabled {
    background: ${Palette.dark};
    cursor: not-allowed;
  }
`;

/* Botón secundario “Cancelar” */
export const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${Palette.black};
  font-weight: 600;
  border: 1px solid ${Palette.darkGray};
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${Palette.lightGray};
  }
`;
export const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => `repeat(${Number($cols) || 2}, 1fr)`};
  gap: 1.25rem;
  align-items: end;
`;
export const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.25rem;
`;
export const FullWidthSelect = styled(Select)`
  width: 100%;
`;

// Resumen de las secciones dentro de <details>
export const Summary = styled.summary`
  cursor: pointer;
  color: ${Palette.primary};
  background-color: ${Palette.muted};
  max-width: 350px;
  font-weight: 700;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
`;

/* ---------- TARJETAS DE LISTA DINÁMICAS ---------- */

/* Contenedor de cada ítem agregado (familiares, hábitos, patológicos, inspección, sistemas) */
export const ItemCard = styled.div`
  border: 4px solid ${Palette.secondary};
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  margin-top: 2rem;
  background: ${Palette.background  };
  strong{
    color: ${Palette.primary};
  }
`;

/* Contenedor para separar la lista del selector superior */
export const ListContainer = styled.div`
  margin-top: 0.75rem;
`;

/* Fila de acciones al final de cada tarjeta (botón eliminar) */
export const ItemActions = styled.div`
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-start;
`;

/* Botón de eliminar dentro de las tarjetas */
export const DangerButton = styled.button`
  background: ${Palette.primary};
  border: 1px solid ${Palette.secondary};
  border-radius: 4px;
  padding: 0.45rem 0.45rem;
  cursor: pointer;
  color: inherit;
  margin-left:25px;
`;

/* Texto al lado del icono dentro de botones */
export const ButtonLabel = styled.span`
  margin-left: 8px;
`;

/* ---------- ALÉRGICO TOGGLE (SÍ/NO) ---------- */
export const AlergicoContainer = styled.div`
margin-top: 20px;
  border: 1px solid ${Palette.darkGray};
  width: 20%;
  border-radius: 10px;
  background: #ffffff;
  padding: 0.9rem 1.1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  text-align: center;
  label {
    text-align: center;
    justify-content: center;
  }
`;

export const AlergicoOptions = styled.div`
  display: inline-flex;
  gap: 1rem;
  align-items: center;
  padding-top: 0.25rem;
`;

export const AlergicoOption = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ $selected }) => ($selected ? Palette.primary : Palette.darkGray)};
  background: ${({ $selected }) => ($selected ? Palette.primary : '#fff')};
  color: ${({ $selected }) => ($selected ? Palette.background : Palette.text)};
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease-in-out;

  input[type='checkbox'] {
    accent-color: ${Palette.primary};
    width: 1.05rem;
    height: 1.05rem;
  }

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
`;
