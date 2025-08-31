// src/components/Policies.styles.jsx
import styled from 'styled-components';

const darkGray  = '#393e46';
const inkSoft   = '#2b2b2b';
const divider   = 'rgba(0, 173, 181, 0.15)';

export const Contracts = styled.div`
  font-family: 'Nunito', sans-serif;
  background-size: 320px 320px;
  margin: 0 auto;
  padding: 48px 48px 64px;
  display: flex;
  flex-direction: column;
`;

export const Section = styled.section`
  background: rgba(255,255,255,0.74);
  border: 1px solid ${divider};
  border-radius: 0 0 14px 14px;
  padding: 28px 28px;
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
  border-bottom: 1px solid ${divider};
  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

export const Label = styled.span`
  color: ${darkGray};
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.3;
`;

export const Value = styled.span`
  white-space: pre-line;
  color: ${inkSoft};
  background: #ffffff;
  border: 1px solid ${divider};
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.5;
`;
