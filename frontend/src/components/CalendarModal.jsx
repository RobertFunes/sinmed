import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Backdrop,
  Container,
  Header,
  Title,
  CloseButton,
  Content,
  Field,
  Label,
  Value,
  ColorTag,
  ColorSwatch,
  Actions,
  ActionRow,
  ActionButton,
} from "./CalendarModal.styles";
import { url } from "../helpers/url.js";

const COLOR_HEX = {
  blue: "#1976D2",
  green: "#2E7D32",
  red: "#D32F2F",
  orange: "#F57C00",
  purple: "#6A1B9A",
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function CalendarModal({
  visible,
  onClose,
  appointment,
  onDelete,
  onModify,
}) {
  if (!visible) return null;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setConfirmDelete(false);
      setIsDeleting(false);
    }
  }, [visible, appointment]);

  const eventId = appointment?.id ?? appointment?.raw?.id_cita ?? null;

  const handleClose = () => {
    setConfirmDelete(false);
    setIsDeleting(false);
    onClose?.();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (!eventId) {
      alert('No se pudo determinar el ID de la cita.');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${url}/api/calendar/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      alert('Cita eliminada correctamente.');
      onDelete?.(eventId);
      handleClose();
    } catch (err) {
      alert(`No se pudo eliminar la cita: ${err?.message || String(err)}`);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleModify = () => {
    onModify?.(appointment);
  };

  const name = appointment?.nombre || appointment?.title || 'Cita';
  const phone = appointment?.telefono || appointment?.phone || appointment?.contact;
  const start = appointment?.inicio_utc || appointment?.start;
  const end = appointment?.fin_utc || appointment?.end;
  const colorRaw = typeof appointment?.color === "string" ? appointment.color.trim() : "";
  const colorKey = colorRaw.toLowerCase();
  const colorHex = COLOR_HEX[colorKey] || colorRaw || null;

  return (
    <Backdrop $visible={visible} onClick={handleBackdropClick}>
      <Container role="dialog" aria-modal="true">
        <Header>
          <Title>{name}</Title>
          <CloseButton type="button" aria-label="Cerrar" onClick={handleClose}>
            x
          </CloseButton>
        </Header>

        <Content>
          <Field>
            <Label>Paciente</Label>
            <Value>{name}</Value>
          </Field>
          <Field>
            <Label>Telefono</Label>
            <Value>{phone || "Sin número registrado"}</Value>
          </Field>
          <Field>
            <Label>Inicio</Label>
            <Value>{formatDateTime(start)}</Value>
          </Field>
          <Field>
            <Label>Fin</Label>
            <Value>{formatDateTime(end)}</Value>
          </Field>
          <Field>
            <Label>Color</Label>
            <Value>
              {colorRaw ? (
                <ColorTag>
                  {colorHex ? <ColorSwatch $hex={colorHex} /> : null}
                  <span>{colorRaw}</span>
                </ColorTag>
              ) : (
                "Sin asignar"
              )}
            </Value>
          </Field>
        </Content>

        <Actions>
          <ActionRow>
            <ActionButton type="button" $variant="delay" onClick={handleModify}>
              +7
            </ActionButton>
            <ActionButton type="button" $variant="delay" onClick={handleModify}>
              +14
            </ActionButton>
            <ActionButton type="button" $variant="delay" onClick={handleModify}>
              +21
            </ActionButton>
          </ActionRow>
          <ActionRow>
            <ActionButton type="button" $variant="primary" onClick={handleModify}>
              Modificar
            </ActionButton>
            <ActionButton
              type="button"
              $variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              style={confirmDelete ? { background: '#D32F2F', borderColor: '#D32F2F', color: '#fff' } : undefined}
            >
              {confirmDelete ? 'Confirmar eliminación' : 'Eliminar'}
            </ActionButton>
          </ActionRow>
        </Actions>
      </Container>
    </Backdrop>
  );
}

CalendarModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  appointment: PropTypes.object,
  onDelete: PropTypes.func,
  onModify: PropTypes.func,
};

CalendarModal.defaultProps = {
  visible: false,
  onClose: undefined,
  appointment: null,
  onDelete: undefined,
  onModify: undefined,
};

