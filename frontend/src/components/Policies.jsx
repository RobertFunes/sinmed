// src/components/Policies.jsx
import PropTypes from 'prop-types';
import {
  FiUsers,
  FiShield,
  FiHash,
  FiLayers,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiRepeat,
  FiDollarSign,
  FiFileText,
} from 'react-icons/fi';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ButtonRow, ActionButton } from './ContactCard.styles.jsx';
import {
  Contracts,
  Section,
  FieldRow,
  Label,
  Value,
  TwoRow,
} from './Policies.styles.jsx';

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

const formatCurrencyMX = value => {
  if (value === undefined || value === null || value === '') return '—';
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return number.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Policies({ polizas = [], onEditPoliza, onDeletePoliza }) {
  if (polizas.length === 0) return null;
  return (
    <Contracts>
      <h3 style={{ margin: '32px 0 16px' }}>Pólizas relacionadas</h3>
      {polizas.map(p => {
        const titular = p.participantes?.find(
          part => Number(part.cliente_id) === Number(p.titular_id_cliente)
        );
        return (
        <Section key={p.id_poliza} style={{ marginBottom: '24px' }}>
          <ButtonRow style={{ justifyContent: 'flex-end', marginBottom: '12px' }}>
            <ActionButton onClick={() => onEditPoliza(p.id_poliza)} title="Editar póliza">
              <FaEdit /> Editar
            </ActionButton>
            <ActionButton className="delete" onClick={() => onDeletePoliza(p)} title="Eliminar póliza">
              <FaTrashAlt /> Eliminar
            </ActionButton>
          </ButtonRow>
          <TwoRow>
            {p.roles && (
              <FieldRow>
                <Label><FiUsers /> Rol:</Label>
                <Value>{p.roles.split(',').map(capitalize).map(r => r === 'Titular' ? 'Contratante' : r).join(', ')}</Value>
              </FieldRow>
            )}
            <FieldRow><Label><FiShield /> Aseguradora:</Label><Value>{p.aseguradora || '—'}</Value></FieldRow>
          </TwoRow>
          <TwoRow>
            <FieldRow><Label><FiHash /> No. de póliza:</Label><Value>{p.numero_poliza || '—'}</Value></FieldRow>
            <FieldRow><Label><FiLayers /> Id de póliza:</Label><Value>{p.id_poliza || '—'}</Value></FieldRow>
          </TwoRow>
          <TwoRow>
            {p.titular_id_cliente && (
              <FieldRow>
                <Label><FiUser /> Contratante:</Label>
                <Value>
                  <Link to={`/profile/${p.titular_id_cliente}`}>
                    {titular ? titular.nombre : p.titular_id_cliente}
                  </Link>
                </Value>
              </FieldRow>
            )}
            <FieldRow><Label><FiCalendar /> Inicio:</Label><Value>{p.fecha_inicio_poliza || '—'}</Value></FieldRow>
          </TwoRow>
          <TwoRow>
            <FieldRow><Label><FiCalendar /> Término:</Label><Value>{p.fecha_termino_poliza || '—'}</Value></FieldRow>
            <FieldRow><Label><FiCreditCard /> Forma de pago:</Label><Value>{p.forma_pago || '—'}</Value></FieldRow>
          </TwoRow>
          <TwoRow>
            <FieldRow><Label><FiRepeat /> Periodicidad:</Label><Value>{p.periodicidad_pago || '—'}</Value></FieldRow>
            <FieldRow><Label><FiDollarSign /> Prima:</Label><Value>{formatCurrencyMX(p.prima)}</Value></FieldRow>
          </TwoRow>
          <TwoRow>
            <FieldRow><Label><FiLayers /> Categoría:</Label><Value>{p.categoria_poliza || '—'}</Value></FieldRow>
            <FieldRow><Label><FiLayers style={{opacity:0.7}} /> Subcategoría:</Label><Value>{p.subcategoria_poliza || '—'}</Value></FieldRow>
          </TwoRow>
          <FieldRow><Label><FiLayers style={{opacity:0.4}} /> Detalle de póliza:</Label><Value>{p.detalle_poliza || '—'}</Value></FieldRow>
          <FieldRow><Label><FiFileText /> Notas:</Label><Value>{p.notas || '—'}</Value></FieldRow>
          <FieldRow><Label><FiUsers /> Notas participantes:</Label><Value>{p.notas_participantes || '—'}</Value></FieldRow>

          {p.participantes && p.participantes.length > 0 && (
            <>
              <h2>Participantes</h2>
              {p.participantes.map(part => (
                <FieldRow key={part.cliente_id}>
                  <Label>
                    <FiUsers />{' '}
                    <Link to={`/profile/${part.cliente_id}`}>{part.nombre}</Link>:
                  </Label>
                  <Value>
                    {capitalize(part.rol)}{part.porcentaje ? ` (${part.porcentaje}%)` : ''}
                  </Value>
                </FieldRow>
              ))}
            </>
          )}
        </Section>
        );
      })}
    </Contracts>
  );
}

Policies.propTypes = {
  polizas: PropTypes.array,
  onEditPoliza: PropTypes.func,
  onDeletePoliza: PropTypes.func,
};
