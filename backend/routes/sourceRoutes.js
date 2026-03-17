const express = require('express');
const router = express.Router();
const multer = require('multer');
const sourceController = require('../controllers/sourceController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), sourceController.uploadPdf);
router.post('/url', sourceController.scrapeUrl);
router.post('/query', sourceController.querySource);
router.get('/:userId', sourceController.getUserSources);
router.delete('/:sourceId', sourceController.deleteSource);

module.exports = router;
