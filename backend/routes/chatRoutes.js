const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/messages', chatController.getMessages);
router.get('/messages/category/:category', chatController.getMessagesByCategory);
router.post('/', chatController.chat);
router.get('/search', chatController.search);
router.get('/summarize/:cat', chatController.summarize);

module.exports = router;
