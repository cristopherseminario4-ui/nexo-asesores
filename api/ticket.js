function generarTicketId() {
  const sello = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `NEXO-${sello}-${random}`;
}

const ETA_POR_PRIORIDAD = { baja: '48 horas', media: '24 horas', alta: '4 horas' };

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
    return;
  }

  const body = req.body || {};
  if (!body.nombre || !body.descripcion) {
    res.status(400).json({ ok: false, mensaje: 'Falta tu nombre o la descripción del problema.' });
    return;
  }

  const prioridad = ['baja', 'media', 'alta'].includes(body.prioridad) ? body.prioridad : 'media';
  const ticketId = generarTicketId();
  const eta = ETA_POR_PRIORIDAD[prioridad];

  const registro = { fecha: new Date().toISOString(), ticketId, prioridad, estado: 'abierto', ...body };
  console.log('Nuevo ticket de soporte:', registro);

  res.status(200).json({
    ok: true,
    ticketId,
    eta,
    mensaje: `Ticket ${ticketId} creado. Tiempo estimado de respuesta: ${eta}.`
  });
};
