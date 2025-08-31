// ReactVTModal.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlay, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { RiAiGenerate2 } from "react-icons/ri";
/* --- Estilos --- */
const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: ${({ visible }) => (visible ? 'flex' : 'none')};
  align-items: center; justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: linear-gradient(90deg,#2e5eff 0%,#ff2e2e 100%);
  border-radius: 8px;
  width: 800px; max-width: 90%;
  max-height: 90vh;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CloseBtn = styled.button`
  position: absolute; top: 0.0rem; right: -.5rem;
  background: transparent; border: none; font-size: 2rem;
  cursor: pointer; color:#fff;
`;

const InfoBox = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #000;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  color:#fff;
`;

const SectionHeader = styled.button`
  display: flex; justify-content: space-between; align-items: center;
  width: 100%;
  background: none; border: none; color: #ffda79; font-weight: 600;
  font-size: 1rem; margin: .6rem 0 .2rem; cursor: pointer;
`;

const SectionBody = styled.div`
  margin-left: .5rem;
  & p { margin: .25rem 0; }
`;

const Ul = styled.ul`
  margin: .25rem 0 .5rem 1rem;
  padding: 0;
  list-style: square inside;
`;

const InputBox = styled.textarea`
  width: 98%;
  height: 90px;
  border: 2px solid red;
  border-radius: 4px;
  padding: 0.5rem;
  resize: vertical;
  margin-bottom: 1rem;
`;

const SendButton = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover { background: #218838; }
  & > svg { margin-right: 0.5rem; }
`;

/* --- Componente --- */
export default function ReactVTModal({
  visible,
  onClose,
  client,
  onSendMessage,
}) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState({
    contacto: true,
    vehiculos: false,
    seguros: false,
    notas: true,
  });

  const toggle = key => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSend = () => {
    onSendMessage(message);
    setMessage('');
  };

  return (
    <Overlay visible={visible} onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>

        {/* ---------- INFO CLIENTE ---------- */}
        <InfoBox>
          <h2>📋 Información de {client?.name || 'Cliente'}</h2>
          <p><strong>Edad:</strong> {client?.age ?? '-'} años</p>
          <SectionHeader onClick={() => toggle('contacto')}>
            Datos de contacto {open.contacto ? <FaChevronUp/> : <FaChevronDown/>}
          </SectionHeader>
          {open.contacto && (
            <SectionBody>
              <p><strong>📧 Correo:</strong> {client?.email}</p>
              <p><strong>📞 Teléfono:</strong> {client?.phone}</p>
              <p><strong>🏠 Dirección:</strong> {client?.address}</p>
              <p><strong>💼 Ocupación:</strong> {client?.occupation}</p>
              <p><strong>👥 Estado civil:</strong> {client?.maritalStatus}</p>
              <p><strong>👶 Hijos:</strong> {client?.children}</p>
              <p><strong>📱 WhatsApp:</strong> {client?.whatsapp ? 'Sí' : 'No'}</p>
              <p><strong>🕔 Hora preferida:</strong> {client?.preferredContactTime}</p>
            </SectionBody>
          )}

          <SectionHeader onClick={() => toggle('vehiculos')}>
            Vehículos {open.vehiculos ? <FaChevronUp/> : <FaChevronDown/>}
          </SectionHeader>
          {open.vehiculos && (
            <SectionBody>
              {client?.vehicles?.length
                ? client.vehicles.map((v,i)=>(
                    <p key={i}>🚗 {v.make} {v.model} {v.year} – 
                      {v.insured ? `Asegurado (${v.policyNumber})` : 'Sin seguro'}</p>
                  ))
                : <p>Sin registros</p>}
            </SectionBody>
          )}

          <SectionHeader onClick={() => toggle('seguros')}>
            Seguros {open.seguros ? <FaChevronUp/> : <FaChevronDown/>}
          </SectionHeader>
          {open.seguros && (
            <SectionBody>
              <p><strong>✅ Actuales:</strong></p>
              <Ul>
                {client?.currentInsurances?.map((s,i)=><li key={i}>{s}</li>)}
              </Ul>
              <p><strong>📈 Potenciales:</strong></p>
              <Ul>
                {client?.potentialInsurances?.map((s,i)=><li key={i}>{s}</li>)}
              </Ul>
              <p><strong>Nivel de riesgo:</strong> {client?.riskLevel}</p>
              <p><strong>Preferencia de pago:</strong> {client?.paymentPreference}</p>
            </SectionBody>
          )}

          <SectionHeader onClick={() => toggle('notas')}>
            Notas {open.notas ? <FaChevronUp/> : <FaChevronDown/>}
          </SectionHeader>
          {open.notas && (
            <SectionBody>
              <p style={{whiteSpace:'pre-line'}}>{client?.notes}</p>
            </SectionBody>
          )}
        </InfoBox>

        {/* ---------- MENSAJE ---------- */}
        <InputBox
          placeholder="✏️ Escribe el mensaje para el cliente..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SendButton onClick={handleSend}>
            <FaPlay /> Enviar mensaje
          </SendButton>
          <SendButton style={{ background: 'blue' }} onClick={() => setMessage('')}>
            <RiAiGenerate2 /> Generar mensaje
          </SendButton>
        </div>
        
        
      </ModalContainer>
    </Overlay>
  );
}
