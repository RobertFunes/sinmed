import styled, { keyframes } from 'styled-components';

/* 🎨 Paleta corporativa */
const colors = {
  cyan  : '#00ADB5',
  light : '#EEEEEE',
  dark  : '#222831',
  shadow: '#393E46',
  white : '#F0F0F0',
};

/* ✨ Animaciones */
const fadeIn   = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn    = keyframes`
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
`;
const dangerPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(214, 40, 40, 0.45); }
  50% { box-shadow: 0 0 0 7px rgba(214, 40, 40, 0); }
`;

/* 🌑 Fondeo oscuro translúcido */
const Backdrop = styled.div`
  position: fixed; inset: 0;
  background: rgba(34, 40, 49, 0.75); /* dark con opacidad */
  display: flex; align-items: center; justify-content: center;
  animation: ${fadeIn} 0.25s ease-out;
  z-index: 999;
`;

/* 🗳️ Caja del modal */
const Box = styled.div`
  background: linear-gradient(135deg, ${colors.white} 0%, ${colors.light} 100%);
  border: 4px solid ${colors.cyan};
  border-radius: 16px;
  padding: 28px 36px;
  width: 90%; max-width: 420px;
  box-shadow: 0 10px 24px -6px rgba(0,0,0,.35);
  display: flex; flex-direction: column; gap: 20px;
  font-family: 'Nunito', sans-serif; text-align: center;
  animation: ${popIn} 0.25s cubic-bezier(.18,1.25,.4,1);
`;

/* 🔘 Botones */
const BtnRow = styled.div`
  display: flex; gap: 14px; justify-content: center;
  button {
    flex: 1;
    padding: 10px 0;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: transform .12s, filter .18s;
    border: 2px solid transparent;
    &:hover { transform: translateY(-2px); }
    &:active { transform: translateY(0); }
  }
  .cancel {
    background: ${colors.white};
    color: ${colors.dark};
    border-color: ${colors.shadow};
    &:hover { filter: brightness(0.95); }
  }
  .confirm {
    background: ${colors.cyan};
    color: ${colors.white};
    &:hover { filter: brightness(0.92); }
  }
  .confirm.danger-final {
    background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
    color: #fff;
    border-color: #7f1d1d;
    animation: ${dangerPulse} 1.15s ease-in-out infinite;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    &:hover {
      filter: brightness(1.05) saturate(1.1);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export default function ConfirmModal({
  open,
  text,
  onCancel,
  onConfirm,
  title = '🟥 ¿Confirmar? 🟥',
  confirmLabel = 'Eliminar',
  dangerFinal = false
}) {
  if (!open) return null;
  return (
    <Backdrop>
      <Box>
        <h3 style={{margin:0,color:colors.dark,fontSize:'1.3rem'}}>{title}</h3>
        <p style={{margin:0,color:colors.shadow,lineHeight:1.45}}>{text}</p>

        <BtnRow>
          <button className="cancel"  onClick={onCancel}>Cancelar</button>
          <button className={`confirm${dangerFinal ? ' danger-final' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </BtnRow>
      </Box>
    </Backdrop>
  );
}
