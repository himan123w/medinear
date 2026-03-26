const express = require('express');
const router = express.Router();
const { extractTextFromImage } = require('../controllers/visionController');

// POST /api/ai/vision-text
router.post('/vision-text', extractTextFromImage);

module.exports = router;
