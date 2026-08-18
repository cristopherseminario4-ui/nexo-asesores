const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3300;

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.jsonl');
const INSCRIPCIONES_FILE = path.join(DATA_DIR, 'inscripciones.jsonl');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- static assets ----------
// frontend/ covers index.html, nexo.html, programas.html, cursos.html, soporte.html,
// cursos/nexo-business-academy.html, js/*.js and partials/*.html by folder structure alone.
app.use(express.static(path.join(ROOT, 'frontend')));
app.use('/estilos', express.static(path.join(ROOT, 'estilos')));
app.use('/recursos', express.static(path.join(ROOT, 'recursos')));

const ETA_POR_PRIORIDAD = {
  baja: '48 horas',
  media: '24 horas',
  alta: '4 horas'
};

function generarTicketId() {
  const fecha = new Date();
  const sello = fecha.getTime().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `NEXO-${sello}-${random}`;
}

// ---------- support ticket generator ----------
app.post('/api/ticket', (req, res) => {
  const body = req.body || {};

  if (!body.nombre || !body.descripcion) {
    return res.status(400).json({ ok: false, mensaje: 'Falta tu nombre o la descripción del problema.' });
  }

  const prioridad = ['baja', 'media', 'alta'].includes(body.prioridad) ? body.prioridad : 'media';
  const ticketId = generarTicketId();
  const eta = ETA_POR_PRIORIDAD[prioridad];

  const registro = {
    fecha: new Date().toISOString(),
    ticketId,
    prioridad,
    estado: 'abierto',
    ...body
  };

  fs.appendFile(TICKETS_FILE, JSON.stringify(registro) + '\n', (err) => {
    if (err) console.error('No se pudo guardar el ticket:', err);
  });

  console.log('Nuevo ticket de soporte:', registro);

  res.json({
    ok: true,
    ticketId,
    eta,
    mensaje: `Ticket ${ticketId} creado. Tiempo estimado de respuesta: ${eta}.`
  });
});

// ---------- course / program enrollment leads ----------
app.post('/api/inscripcion', (req, res) => {
  const body = req.body || {};

  if (!body.nombre && !body.nombres) {
    return res.status(400).json({ ok: false, mensaje: 'Falta tu nombre.' });
  }

  const registro = {
    fecha: new Date().toISOString(),
    origen: body.origen || 'desconocido',
    ...body
  };

  fs.appendFile(INSCRIPCIONES_FILE, JSON.stringify(registro) + '\n', (err) => {
    if (err) console.error('No se pudo guardar la inscripción:', err);
  });

  console.log('Nueva inscripción / lead:', registro);

  res.json({
    ok: true,
    mensaje: '¡Listo! Un asesor de admisiones te contactará el mismo día.'
  });
});

app.listen(PORT, () => {
  console.log(`NEXO Academy corriendo en http://localhost:${PORT}`);
});
