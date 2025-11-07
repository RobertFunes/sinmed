// add.styles.jsx
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

/* Campos de texto */
export const Input = styled.input`
  ${inputStyles}
`;

/* Área de texto */
export const TextArea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 60px;
`;

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
