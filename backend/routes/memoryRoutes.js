const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');

router.post('/extract', memoryController.extractMemory);
router.post('/confirm', memoryController.confirmMemory);
router.post('/update', memoryController.updateMemory);
router.get('/:userId', memoryController.getMemories);
router.delete('/:id', memoryController.deleteMemory);

module.exports = router;
