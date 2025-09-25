// src/components/ProfileInformation.styles.jsx
import styled from 'styled-components';
import { Palette } from '../helpers/theme.js';

export const Section = styled.section`
  background: ${Palette.background};
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
  background: ${Palette.accent};
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
  grid-template-columns: 240px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid ${Palette.border};
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
`;

export const Value = styled.span`
  white-space: pre-wrap;
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
