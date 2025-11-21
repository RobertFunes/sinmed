//ia.js
require('dotenv').config(); // 🗝️ Carga tu API Key de Gemini
const express = require('express');
const axios   = require('axios');
const { checkAuth } = require('../controllers/user');
const { canUse, consume, getInfo } = require('../utils/iaLimiter');

const router = express.Router();

// 🌟 Ruta existente para Gemini
router.post('/gemini',checkAuth, async (req, res) => {
  const { prompt } = req.body;
  try {
    // Rate limit mensual: 250 mensajes
    if (!canUse('gemini')) {
      const info = getInfo('gemini');
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
    // Cuenta solo en éxito
    try { consume('gemini', 1); } catch (_) {}
    res.json({ respuesta: respuestaIA });
  } catch (error) {
    console.error('❌ Error en /gemini:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo generar la respuesta con IA 🤖' });
  }
});

router.post('/image',checkAuth, async (req, res) => {
  const { prompt, size = '1024x1024', n = 1 } = req.body;
  try {
    // Rate limit mensual: 40 imágenes
    if (!canUse('image')) {
      const info = getInfo('image');
      return res.status(429).json({ ok: false, error: 'Límite mensual de imágenes alcanzado', ...info });
    }
    const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'gpt-image-1', // 👈 modelo top para generar imágenes
      prompt,
      n,                    // Nº de imágenes (por defecto 1)
      size,
      quality: 'low'        // Resolución
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    }
);

    // El endpoint devuelve un array "data"; cada elemento trae la URL
    const b64 = response.data.data[0].b64_json;

    // Cuenta solo en éxito (una imagen por request)
    try { consume('image', 1); } catch (_) {}
    res.type('png').send(Buffer.from(b64, 'base64'));
  } catch (error) {
    console.error('🛑 Error en /image:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo generar la imagen 🤖' });
  }
});


module.exports = router;
