// routes/user.js
const express = require('express');
const router = express.Router();

const {
  login,
  add,
  getSummary,
  getPending,
  getProfilePending,
  clearProfileReminder,
  getById,
  removeById,
  postpone,
  modify,
  createCalendar,
  updateCalendar,
  listCalendar,
  deleteCalendar,
  saveLatestConsultaHistoriaClinica,
  getLimits,
  cloneDay
} = require('../controllers/user');
const { userAuth } = require('../middlewares/userAuth');
const { verifyAccessToken } = require('../helpers/jwt');
// Ruta pública: login
// POST /login
router.post('/login', login);
router.post('/add', userAuth, add);
router.put('/profile/:id', userAuth, modify);
router.get('/profile/:id', userAuth, getById);
router.get('/summary', userAuth, getSummary); // Resumen de perfiles
router.get('/pending', userAuth, getPending);
router.get('/profilepending', userAuth, getProfilePending);
router.post('/postpone', userAuth, postpone);
router.post('/profile/postpone', userAuth, clearProfileReminder);
router.post('/profile/:id/consultas/latest/historia-clinica', userAuth, saveLatestConsultaHistoriaClinica);
router.delete('/profile/:id', userAuth, removeById);


// Ruta que devuelve el estado (auth/no auth)
router.post('/calendar', userAuth, createCalendar);
router.put('/calendar', userAuth, updateCalendar);
router.get('/calendar', userAuth, listCalendar);
router.delete('/calendar/:id', userAuth, deleteCalendar);
router.post('/cloneday', userAuth, cloneDay);

// IA limits usage
router.get('/limits', userAuth, getLimits);


// GET /status
router.get('/status', (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(200).json({ ok: false });
    }
    const payload = verifyAccessToken(token);
    if (!payload || payload.typ !== 'access') {
      return res.status(200).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err?.message === 'JWT_SECRET_MISSING') {
      return res.status(500).json({ ok: false, error: 'JWT_SECRET_MISSING' });
    }
    return res.status(200).json({ ok: false });
  }
});


module.exports = router;
