// routes/user.js
const express = require('express');
const router = express.Router();

const {
  login,
  add,
  getAll,
  getSummary,
  getPending,
  getById,
  removeById,
  postpone,
  checkAuth,
  modify,
  getNameMin
} = require('../controllers/user');
const {addBundle, listPreview, listSummary, getOne, editBundle, deleteOne, listByClient}=  require('../controllers/policy');
const e = require('express');
// Ruta pública: login
// POST /login
router.post('/login', login);
router.post('/add',checkAuth, add);
router.put('/profile/:id',   checkAuth, modify);  
router.get('/profile/:id',checkAuth, getById);
router.get('/summary', checkAuth,getSummary); // Resumen de perfiles
router.get('/pending', checkAuth,getPending);
router.get('/profile/:id/min', checkAuth, getNameMin);
router.post('/postpone',checkAuth, postpone);
router.delete('/profile/:id', checkAuth,removeById);

router.get('/getOne/:id', checkAuth, getOne);
router.get('/preview', checkAuth, listPreview);
router.get('/polizas', checkAuth, listSummary); // Resumen de pólizas
router.get('/profile/:id/polizas', checkAuth, listByClient);
router.post('/bundle', addBundle);
router.patch('/update/:id', editBundle);
router.delete('/delete/:id', deleteOne);

// Ruta que devuelve el estado (auth/no auth)
// GET /status
router.get('/status', (req, res) => {
  const isAuth = req.cookies.auth === '1';
  console.log('Estado de autenticación:', req.cookies.auth);
  res.json({ ok: isAuth });
});


module.exports = router;
