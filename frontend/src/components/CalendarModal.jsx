import React from "react";
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
  ActionButton,
} from "./CalendarModal.styles";

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

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleDelete = () => {
    onDelete?.(appointment);
  };

  const handleModify = () => {
    onModify?.(appointment);
  };

  const eventId = appointment?.id ?? appointment?.raw?.id_cita ?? null;
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
          <CloseButton type="button" aria-label="Cerrar" onClick={() => onClose?.()}>
            x
          </CloseButton>
        </Header>

        <Content>
          <Field>
            <Label>ID</Label>
            <Value>{eventId ?? 'Sin ID'}</Value>
          </Field>
          <Field>
            <Label>Paciente</Label>
            <Value>{name}</Value>
          </Field>
          <Field>
            <Label>Telefono</Label>
            <Value>{phone || "Sin numero"}</Value>
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
          <ActionButton type="button" $variant="default" onClick={handleModify}>
            Modificar
          </ActionButton>
          <ActionButton type="button" $variant="danger" onClick={handleDelete}>
            Eliminar
          </ActionButton>
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

