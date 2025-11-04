import styled, { css } from "styled-components";
import { Palette } from "../helpers/theme";

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1200;
`;

export const Container = styled.div`
  background: #ffffff;
  color: ${Palette.text};
  width: min(440px, 92vw);
  max-width: 520px;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: ${Palette.primary};
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${Palette.muted};
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: ${Palette.secondary};
  }
`;

export const Content = styled.section`
  display: grid;
  gap: 10px;
`;

export const Field = styled.div`
  display: grid;
  gap: 2px;
`;

export const Label = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${Palette.muted};
`;

export const Value = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${Palette.dark};
`;

export const ColorTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const ColorSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({ $hex }) => $hex || Palette.primary};
  border: 1px solid rgba(0, 0, 0, 0.15);
`;

export const Actions = styled.footer`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
`;

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-end;
  margin-top: 4px;
`;

export const ActionButton = styled.button`
  appearance: none;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
  min-width: 98px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${({ $variant }) => {
    switch ($variant) {
      case 'danger':
        return css`
          background: ${Palette.primary};
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(38, 102, 127, 0.25);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(38, 102, 127, 0.32);
          }
        `;
      case 'primary':
        return css`
          background: ${Palette.accent};
          color: #0b2a1d;
          border-color: rgba(11, 42, 29, 0.12);
          box-shadow: 0 6px 16px rgba(51, 160, 105, 0.25);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 18px rgba(51, 160, 105, 0.33);
          }
        `;
      case 'delay':
        return css`
          background: rgba(25, 118, 210, 0.12);
          color: #1f4b82;
          border-color: rgba(25, 118, 210, 0.35);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            background: rgba(25, 118, 210, 0.18);
            color: #0d2d51;
            box-shadow: 0 6px 14px rgba(25, 118, 210, 0.22);
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${Palette.secondary};
          border-color: rgba(38, 102, 127, 0.4);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            background: rgba(38, 102, 127, 0.08);
          }
        `;
      default:
        return css`
          background: ${Palette.accent};
          color: ${Palette.secondary};
          border-color: rgba(38, 102, 127, 0.4);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            background: ${Palette.primary};
            color: ${Palette.secondary};
            box-shadow: 0 6px 16px rgba(103, 192, 144, 0.25);
          }
        `;
    }
  }}
`;
