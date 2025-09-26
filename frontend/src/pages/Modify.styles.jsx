import styled from 'styled-components';

export const EstadoChecklist = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fafafa;
`;

export const EstadoOptionLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #e1e5ea;
  background: #ffffff;
  color: #2f3b4a;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;

  &:hover {
    border-color: #cfd6de;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(1px);
  }

  span {
    font-size: 0.95rem;
    line-height: 1.1;
  }
`;

export const EstadoCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #2aa198; /* minimal green/teal */
`;

