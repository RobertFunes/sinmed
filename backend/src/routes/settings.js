const express = require('express');
const { userAuth } = require('../middlewares/userAuth');
const {
  getTelegramSettings,
  updateTelegramSettings,
  createTelegramLink,
  verifyTelegramLink,
  sendTelegramTest,
  deleteTelegramRecipient,
} = require('../controllers/telegram');
const {
  getAiSettings,
  updateAiSettings,
} = require('../controllers/aiSettings');

const router = express.Router();

router.use(userAuth);
router.get('/ai', getAiSettings);
router.put('/ai', updateAiSettings);
router.get('/telegram', getTelegramSettings);
router.put('/telegram', updateTelegramSettings);
router.post('/telegram/link', createTelegramLink);
router.post('/telegram/link/verify', verifyTelegramLink);
router.post('/telegram/test', sendTelegramTest);
router.delete('/telegram/recipient', deleteTelegramRecipient);

module.exports = router;
