// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser'); 
const iaRoutes = require('./routes/ia');
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const citasCleanup = require('./jobs/citasCleanup');
const app = express();
// Trust first proxy (e.g., Nginx/Heroku). Needed so req.ip is the real client IP
// and not the proxy address, which is important for rate limiting.
app.set('trust proxy', 1);
const dev = process.env.NODE_ENV !== 'production';
console.log('ENV DEBUG:', process.env.USER_NAME, process.env.PASS, process.env.PIN);

app.use(cors({
  origin: dev 
    ? true                                // en dev: allow all origins 🌍
    : 'https://delvalleconecta.com',           // en prod: solo tu dominio 🔒
  credentials: true                      // habilita cookies
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser()); 
app.use('/api', userRoutes);
app.use('/api', searchRoutes);
app.use('/ia', iaRoutes);



const frontendPath = path.join(__dirname, '../../frontend/dist'); // ajusta el path según tu estructura
app.use(express.static(frontendPath));

// Sirve el index.html para /, /add y /pending
const indexFile = path.join(frontendPath, 'index.html');

app.get(['/', '/add', '/pending', '/login', '/profile/:id', '/calendar', '/calendar/new'], (req, res) => {
  res.sendFile(indexFile);
});

app.get(['/modify/:id'], (req, res) => {
  res.sendFile(indexFile);
});
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));

// Agenda la depuración mensual de citas (día 1 a las 03:00 America/Mexico_City)
try { citasCleanup.start(); } catch (_) {}
