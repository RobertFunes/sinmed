// src/components/ProfileInformation.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme.js';

export const Section = styled.section`
  background: ${(p) => (p.$alergico ? '#000' : 'rgba(255, 255, 255, 0.8)')};
  //aqui me gustaria que sea negro si tiene alergias
  border: 1px solid ${Palette.border};

  padding: 28px 28px;
  h3{
    font-size: 1.9rem;
    color: ${Palette.title};
  }
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 18px;
`;

export const Group = styled.div`
  border: 1px solid ${Palette.border};
  border-radius: 12px;
  padding: 18px;
  background: ${Palette.background};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const GroupTitle = styled.h4`
  margin: 0;
  color: ${Palette.secondary};
  font-size: 1.1rem;
`;

export const TwoRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
`;

// Dos columnas balanceadas para filas de información
export const TwoColumnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 25% 75%;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

export const Label = styled.span`
  color: ${Palette.muted};
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.3;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

export const Value = styled.span`
  white-space: pre-wrap;
  max-width: 85%;
  color: ${Palette.text};
  background: ${Palette.background};
  border: 1px solid ${Palette.border};
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: anywhere;
  overflow: visible;
  text-overflow: unset;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
`;

// Botonera fija abajo a la derecha
export const FloatingActions = styled.div`
  position: fixed;
  right: 50px;
  bottom: 50px;
  display: flex;
  gap: 20px;
  z-index: 1000;
  
  button {
    padding: 20px 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;
