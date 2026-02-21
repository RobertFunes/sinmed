const express = require('express');
const { refresh } = require('../controllers/auth');

const router = express.Router();

router.post('/refresh', refresh);

module.exports = router;
