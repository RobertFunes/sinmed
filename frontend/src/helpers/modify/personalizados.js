const positiveId = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
};

const toStr = (value) => (value == null ? '' : String(value));

// Normaliza un personalizado sin perder su identidad persistida.
export const mapPersonalizadoToForm = (item) => {
  const id = positiveId(item?.id_personalizado);
  return {
    ...(id ? { id_personalizado: id } : {}),
    nombre: toStr(item?.nombre),
    descripcion: toStr(item?.descripcion),
    estado: toStr(item?.estado),
  };
};
