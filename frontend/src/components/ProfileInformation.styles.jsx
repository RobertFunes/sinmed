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

export const TwoRow = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 14px;
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
  white-space: pre-line;
  color: ${Palette.text};
  background: ${Palette.background};
  border: 1px solid ${Palette.border};
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
`;
