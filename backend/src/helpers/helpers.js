function isInvalidOrFuture(dateLike) {
  if (!dateLike) return true;

  const str = String(dateLike);
  const d   = new Date(dateLike);

  if (str.startsWith('0000')) return true;
  if (isNaN(d.getTime()))    return true;
  if (d.getFullYear() < 1900) return true;

  /* 🔄 FUTURO: solo compara la parte Y-M-D */
  const todayStr = new Date().toISOString().split('T')[0];
  const dateStr  = d.toISOString().split('T')[0];
  return dateStr > todayStr;
}

module.exports = { isInvalidOrFuture };
