import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const Page = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url('/bg5.png');
  background-repeat: repeat;
  background-position: top left;
  min-height: 80vh;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2px;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${Palette.secondary};
`;

export const Form = styled.form`
  margin-top: 26px;
  max-width: 1720px;
  width: 70%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
`;

export const Field = styled.label`
  display: grid;
  gap: 6px;
  color: ${Palette.secondary};
  font-weight: 600;
  font-size: 1.2rem;
`;

export const Input = styled.input`
  background-color: ${Palette.background};
  color: ${Palette.dark};
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${Palette.primary};
  font-size: 1rem;

  /* Quitar decoraciones raras en algunos navegadores */
  &::-webkit-inner-spin-button,
  &::-webkit-clear-button {
    display: none;
  }

  /* El icono del calendario/reloj */
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    /* Intento de tintado al color del tema (Chromium/WebKit)
       Nota: no hay soporte estandar para fijar el color exacto del icono nativo;
       usamos un filtro aproximado hacia un rojo vino similar a Palette.primary. */
    color: ${Palette.primary};
    opacity: 0.95;
    filter: invert(16%) sepia(18%) saturate(4000%) hue-rotate(350deg) brightness(92%) contrast(96%);
  }

  &::-webkit-calendar-picker-indicator:hover {
    filter: invert(16%) sepia(18%) saturate(4200%) hue-rotate(350deg) brightness(100%) contrast(100%);
  }

  /* Para Firefox (más limitado) */
  &::-moz-focus-inner {
    border: 0;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 4px;
`;

export const PrimaryButton = styled.button`
  background: ${Palette.dark};
  color: ${Palette.background};
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
`;

export const GhostButton = styled.button`
  background: transparent;
  color: ${Palette.primary};
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid ${Palette.primary};
  font-weight: 600;
  background-color: ${Palette.background};
  cursor: pointer;
`;

export const NewButtonLink = styled.a`
  text-decoration: none;
  background: ${Palette.primary};
  color: ${Palette.secondary};
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
`;
