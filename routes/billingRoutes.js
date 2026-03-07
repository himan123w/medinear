const express = require('express');
const router = express.Router();
const billing = require('../controllers/billingController');

router.post('/create', billing.createSubscription);
router.get('/process', billing.processBilling);

module.exports = router;
