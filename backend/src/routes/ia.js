//ia.js
require('dotenv').config(); // 🗝️ Carga tu API Key de Gemini
const express = require('express');
const axios   = require('axios');
const { userAuth } = require('../middlewares/userAuth');
const { canUse, consume, getInfo } = require('../utils/iaLimiter');

const router = express.Router();

// 🌟 Ruta existente para Gemini (solo texto)
router.post('/gemini', userAuth, async (req, res) => {
  const { prompt } = req.body;
  try {
    if (!canUse()) {
      const info = getInfo();
      return res.status(429).json({ ok: false, error: 'Límite mensual de mensajes alcanzado', ...info });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    const respuestaIA = response.data.candidates?.[0]?.content?.parts?.[0]?.text
                        || '🤖 Sin respuesta de la IA';
    try { consume(1); } catch (_) {}
    res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error('❌ Error en /gemini:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo generar la respuesta con IA 🤖' });
  }
});

module.exports = router;
