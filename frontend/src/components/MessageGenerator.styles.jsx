// src/components/MessageGenerator.styles.jsx
import styled, { keyframes } from 'styled-components';

/* 🎨 Paleta minimalista */
const colors = {
  primary: '#00ADB5',
  bg: '#FFFFFF',
  text: '#222831',
  subtleText: '#5B616A',
  border: '#E6E8EB',
  soft: '#F7F8FA',
};

/* ✨ Animación para el spinner */
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/* 📦 Layout principal */
export const Container = styled.div`
  max-width: 1840px;
  margin: 40px auto;
  padding: 24px;
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.04);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  .buttons{
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
  }
`;
export const ModeSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
`;

export const ModeCheckbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: ${colors.primary};
  }
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

export const ModeSlider = styled.span`
  position: absolute;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background: ${colors.border};
  border-radius: 34px;
  transition: .3s;

  &:before {
    content: "";
    position: absolute;
    height: 22px; width: 22px;
    left: 3px; bottom: 3px;
    background: ${colors.bg};
    border-radius: 50%;
    transition: .3s;
  }
`;
/* 💬 Burbuja tipo WhatsApp */
export const WhatsappBubble = styled.div`
  position: relative;
  background: ${colors.soft};
  color: ${colors.text};
  padding: 12px 14px;
  border-radius: 12px 12px 12px 0;
  line-height: 1.4;

  &::after {
    content: '';
    position: absolute;
    left: -8px;
    bottom: 0;
    width: 0;
    height: 0;
    border-top: 8px solid ${colors.soft};
    border-right: 8px solid transparent;
  }
`;

/* 🏷️ Filas de campo */
export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
  align-items: flex-start;
  img{
    align-self: center;
    max-width: 100%;
    border-radius: 8px;
    margin-top: 16px;
  }
`;

/* 🔖 Etiquetas */
export const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.subtleText};
`;

/* 📝 Inputs genéricos */
const baseInput = `
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: ${colors.bg};
  color: ${colors.text};
  outline: none;
  font-size: 0.95rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
  &:focus {
    border-color: ${colors.primary};
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

/* 🚀 Botón principal */

export const Button = styled.button`
  background: ${colors.primary};
  color: #fff;
  border: 1px solid ${colors.primary};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.2s ease, box-shadow 0.15s ease;
  max-width: 300px;
  &:hover { filter: brightness(0.96); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

/* ⚙️ Área de resultado */
export const ResultArea = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  background: ${colors.soft};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  color: ${colors.text};
  p { margin: 8px 0 0; white-space: pre-wrap; }
`;

/* ⏳ Spinner / estados */
export const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-weight: 600;
  color: ${colors.subtleText};

  &::before {
    content: '';
    width: 1.2rem;
    height: 1.2rem;
    border: 3px solid ${colors.primary};
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spin} 0.8s linear infinite;
  }
`;

/* 🚨 Mensaje de error */
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
