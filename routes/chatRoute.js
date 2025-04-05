const express = require('express');
const router = express.Router();
const { askGroq } = require('../controllers/chatController');

// Quand quelqu’un envoie un message
router.post('/', askGroq);

module.exports = router;
