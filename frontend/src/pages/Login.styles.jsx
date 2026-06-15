// src/components/Login.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme';

export const Container = styled.div`
  box-sizing: border-box;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 2rem;
  background:
    linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.1)),
    url('/bg3.png');
  background-repeat: repeat;
`;

export const Form = styled.form`
  box-sizing: border-box;
  width: 100%;
  max-width: 430px;
  min-height: 0;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 0 2rem 2rem;
  border: 1px solid ${Palette.border}44;
  border-radius: 8px;
  background: rgba(240, 240, 240, 0.82);
  box-shadow: 0 0 12px 20px rgb(0 0 0 / 15%);
`;

export const Header = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.65rem;
  margin: 0 -2rem 2rem;
  padding: 2rem 2rem 1.75rem;
  text-align: center;
  color: ${Palette.background};
  background-color: ${Palette.muted};
  border-radius: 8px 8px 0 0;
`;

export const BrandMark = styled.div`
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: ${Palette.background};
  color: ${Palette.primary};
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.16);

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const Title = styled.h2`
  margin: 0;
  color: ${Palette.background};
  font-size: 1.85rem;
  line-height: 1.1;
  font-weight: 800;
  font-family: 'Nunito', sans-serif;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: ${Palette.background};
  font-size: 0.94rem;
  opacity: 0.92;
`;

export const Field = styled.div`
  margin-bottom: 1.05rem;
  text-align: left;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.42rem;
  color: ${Palette.secondary};
  font-size: 0.86rem;
  font-weight: 700;
`;

export const InputShell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const FieldIcon = styled.span`
  position: absolute;
  left: 0.85rem;
  display: grid;
  place-items: center;
  color: ${Palette.secondary};
  pointer-events: none;

  svg {
    width: 0.95rem;
    height: 0.95rem;
  }
`;

export const Input = styled.input`
  width: 100%;
  min-height: 48px;
  padding: ${({ $hasReveal }) => ($hasReveal ? '0.72rem 3.1rem 0.72rem 2.55rem' : '0.72rem 0.9rem 0.72rem 2.55rem')};
  border: 1px solid ${Palette.border};
  border-radius: 4px;
  background: ${Palette.background};
  color: ${Palette.text};
  font-size: 1rem;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;

  &::placeholder {
    color: ${Palette.secondary};
  }

  &:focus {
    outline: 4px solid ${Palette.primary};
    border-color: transparent;
    background: #ffffff;
    box-shadow: none;
  }
`;

export const RevealButton = styled.button`
  position: absolute;
  right: 0.56rem;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: ${Palette.secondary};
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover {
    background: ${Palette.accent}33;
    color: ${Palette.primary};
  }

  &:active {
    transform: scale(0.94);
  }
`;

export const Button = styled.button`
  width: 100%;
  min-height: 48px;
  padding: 0.75rem;
  margin-top: 0.55rem;
  background: ${Palette.primary};
  color: ${Palette.background};
  font-size: 1rem;
  font-weight: 800;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 12px 24px ${Palette.primary}33;

  &:hover:enabled {
    background: ${Palette.dark};
    box-shadow: 0 14px 28px ${Palette.dark}44;
  }

  &:active:enabled {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

export const ErrorText = styled.p`
  padding: 0.72rem 0.85rem;
  border: 1px solid ${Palette.primary}44;
  border-radius: 8px;
  background: ${Palette.primary}12;
  color: ${Palette.primary};
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 0.9rem;
`;
