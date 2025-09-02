// add.styles.jsx
import styled from 'styled-components';

/* 🎨 Paleta centralizada para poder reutilizarla fácilmente */
export const Palette = {
  cyan: '#00ADB5',        // Botones primarios, acentos
  lightGray: '#EEEEEE',   // Fondos de contenedores
  darkGray: '#393E46',    // Sombras y detalles
  black: '#222831',       // Texto principal
  almostWhite: '#F0F0F0', // Fondos claros con transparencia
};

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
  max-width: 90%;
  background: rgba(240, 240, 240, 0.75); /* 85% opaco, 15% transparente */

  border: 1px solid ${Palette.lightGray};
  box-shadow: 0 4px 12px rgba(254, 254, 255, 0.15); /* sombra sutil en gris oscuro */
  border-radius: 8px;
  padding-bottom: 2rem;
`;

/* ---------- TIPOGRAFÍA Y CABECERAS ---------- */

export const Title = styled.h1`
  margin: 0;
  padding: 2.5rem;
  font-size: 2.5rem;
  text-align: center;
  color: ${Palette.almostWhite};
  background-color: ${Palette.black};
  font-family: 'Nunito', sans-serif;
  border-radius: 8px 8px 0 0;
  span {
    color: ${Palette.cyan};
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
  margin-bottom: 0.55rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: ${Palette.black};
`;

/* Mixin con estilos compartidos para inputs/selects/textarea */
const inputStyles = `
  
  padding: 0.75rem 1rem;
  border: 1px solid ${Palette.darkGray};
  background: #fff;
  color: ${Palette.black};
  border-radius: 4px;
  font-size: 1rem;
  transition: outline 0.15s ease-in-out;

  &:focus {
    outline: 2px solid ${Palette.cyan};
    border-color: transparent;
  }

  &::placeholder {
    color: ${Palette.darkGray};
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
  min-height: 120px;
`;

/* Select personalizado */
export const Select = styled.select`
  ${inputStyles}
  appearance: none;
  background: #fff
    url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='${encodeURIComponent(Palette.darkGray)}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7L10 12L15 7'/%3E%3C/svg%3E")
    no-repeat right 1rem center;
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
  background: ${Palette.cyan};
  color: #ffffff;
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
    background: ${Palette.lightGray};
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
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
`;
export const FullWidthSelect = styled(Select)`
  width: 100%;
`;
