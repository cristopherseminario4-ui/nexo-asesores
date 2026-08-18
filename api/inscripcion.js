module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, mensaje: 'Método no permitido.' });
    return;
  }

  const body = req.body || {};
  if (!body.nombre && !body.nombres) {
    res.status(400).json({ ok: false, mensaje: 'Falta tu nombre.' });
    return;
  }

  const registro = { fecha: new Date().toISOString(), origen: body.origen || 'desconocido', ...body };
  console.log('Nueva inscripción / lead:', registro);

  res.status(200).json({
    ok: true,
    mensaje: '¡Listo! Un asesor de admisiones te contactará el mismo día.'
  });
};
