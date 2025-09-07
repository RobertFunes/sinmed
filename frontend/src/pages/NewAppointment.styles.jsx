import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const Page = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${Palette.primary};
`;

export const Form = styled.form`
  margin-top: 16px;
  width: 520px;
  display: grid;
  gap: 14px;
`;

export const Field = styled.label`
  display: grid;
  gap: 6px;
  color: ${Palette.primary};
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
    filter: invert(1); /* Ajusta el valor: 0 = negro, 1 = blanco */
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
  background: ${Palette.primary};
  color: ${Palette.secondary};
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

