// src/components/MessageGenerator.styles.jsx
import styled from 'styled-components';

/* Paleta */
import { Palette } from '../helpers/theme';

/* Layout principal */
export const Container = styled.div`
  max-width: 1840px;
  margin: 40px auto;
  padding: 24px;
  background: linear-gradient(180deg, ${Palette.background}, ${Palette.background});
  border: 1px solid ${Palette.border}55;
  border-radius: 16px;
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.65) inset;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  .buttons{
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
  }

  .divider {
    border: 0;
    height: 1px;
    margin: 20px 0;
    background: linear-gradient(90deg, transparent, ${Palette.border}55, transparent);
  }

  .section {
    border-radius: 14px;
    border: 1px solid ${Palette.border}33;
    padding: 14px 14px 6px;
    background: linear-gradient(135deg, ${Palette.secondary}0f, ${Palette.accent}10);
  }

  .sectionHeader {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 10px;
  }

  .sectionTitle {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.15rem;
    font-weight: 800;
    color: ${Palette.title};

    svg {
      color: ${Palette.secondary};
    }
  }

`;
export const InfoBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  color: ${Palette.dark};
  background: linear-gradient(135deg, ${Palette.accent}22, ${Palette.secondary}1c);
  border: 1px solid ${Palette.accent}44;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.9rem;
  width: fit-content;
  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.5) inset;
`;

export const SummaryButtonsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
`;
/* Filas de campo */
export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  align-items: flex-start;
  img{
    max-height: 600px;
    align-self: center;
    max-width: 100%;
    border-radius: 8px;
    margin-top: 16px;
  }
`;

/* Etiquetas */
export const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Palette.muted};

  svg {
    color: ${Palette.secondary};
  }
`;

/* Inputs genéricos */
const baseInput = `
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${Palette.border};
  border-radius: 8px;
  background: ${Palette.background};
  color: ${Palette.text};
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
  &:focus {
    border-color: ${Palette.primary};
    box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.18);
  }
`;

export const Input = styled.input`${baseInput}`;
export const Select = styled.select`
  ${baseInput}
`;
export const TextArea = styled.textarea`
  ${baseInput}
  resize: vertical;
  min-height: 180px;
`;

/* Botón principal */

export const Button = styled.button`
  background: ${Palette.primary};
  color: #fff;
  border: 1px solid ${Palette.primary};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  transition: transform 0.1s ease, filter 0.2s ease, box-shadow 0.15s ease;
  max-width: 300px;
  &:hover { filter: brightness(0.96); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }

  &.primary {
    max-width: none;
    min-width: 220px;
    box-shadow:
      0 14px 34px ${Palette.primary}33,
      0 0 0 1px ${Palette.primary}33;
  }

  &.chip {
    max-width: none;
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    background: ${Palette.background};
    color: ${Palette.title};
    border: 1px solid ${Palette.border}44;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);

    &:hover {
      background: ${Palette.accent}12;
      filter: none;
    }
  }
`;

/* Área de resultado */
export const ResultArea = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  background: ${Palette.background};
  border: 1px solid ${Palette.border};
  border-radius: 10px;
  color: ${Palette.text};

  strong {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
  }
  p { margin: 8px 0 0; white-space: pre-wrap; }
`;

/* Spinner / estados */


/* Mensaje de error */
export const ErrorMsg = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  background: #FFF3F3;
  border: 1px solid #FFD7D7;
  border-radius: 8px;
  color: #7A0000;
  font-weight: 600;
  white-space: pre-wrap;
`;
export const WhatsAppButton = styled(Button)`
  background: #25D366;                 /* verde WhatsApp */
  border-color: #25D366;
  margin: 18px auto 0;                 /* centrado horizontal */
  display: flex; align-items: center;  /* icono + texto alineados */
  gap: 8px;
  &:hover { filter: brightness(0.92); }
`;

