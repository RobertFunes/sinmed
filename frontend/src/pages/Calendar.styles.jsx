// src/pages/Calendar.styles.jsx
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Palette } from '../helpers/theme';

export const Page = styled.div`
  padding: 24px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${Palette.secondary};
`;

export const NewButtonLink = styled(Link)`
  text-decoration: none;
  background: ${Palette.primary};
  color: ${Palette.secondary};
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
`;

export const CalendarContainer = styled.div`
  .rbc-toolbar{
    background-color: ${Palette.primary};
    padding: 8px;
  }
  .rbc-btn-group button{
    background-color: ${Palette.background};
  }
  .rbc-time-header-cell{
    height: 40px;
  }
  .rbc-allday-cell{
    display: none;
  }
  .rbc-day-slot.rbc-time-column.rbc-now.rbc-today{
    background-color: ${Palette.muted};
  }
  .rbc-today{
    background-color: ${Palette.muted};
  }
`;