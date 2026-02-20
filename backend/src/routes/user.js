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
  checkAuth,
  modify,
  createCalendar,
  updateCalendar,
  listCalendar,
  deleteCalendar,
  saveLatestConsultaHistoriaClinica,
  getLimits,
  cloneDay
} = require('../controllers/user');
const e = require('express');
// Ruta pública: login
// POST /login
router.post('/login', login);
router.post('/add',checkAuth, add);
router.put('/profile/:id',   checkAuth, modify);  
router.get('/profile/:id',checkAuth, getById);
router.get('/summary', checkAuth,getSummary); // Resumen de perfiles
router.get('/pending', checkAuth,getPending);
router.get('/profilepending', checkAuth, getProfilePending);
router.post('/postpone',checkAuth, postpone);
router.post('/profile/postpone', checkAuth, clearProfileReminder);
router.post('/profile/:id/consultas/latest/historia-clinica', checkAuth, saveLatestConsultaHistoriaClinica);
router.delete('/profile/:id', checkAuth,removeById);


// Ruta que devuelve el estado (auth/no auth)
router.post('/calendar', checkAuth, createCalendar);
router.put('/calendar', checkAuth, updateCalendar);
router.get('/calendar', checkAuth, listCalendar);
router.delete('/calendar/:id', checkAuth, deleteCalendar);
router.post('/cloneday', checkAuth, cloneDay);

// IA limits usage
router.get('/limits', checkAuth, getLimits);


// GET /status
router.get('/status', (req, res) => {
  const isAuth = req.cookies.auth === '1';
  console.log('Estado de autenticación:', req.cookies.auth);
  res.json({ ok: isAuth });
});


module.exports = router;
