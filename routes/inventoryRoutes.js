const express = require('express');
const router = express.Router();
const inv = require('../controllers/inventoryController');

router.get('/:pharmacyId', inv.getInventory);
router.post('/:pharmacyId/item', inv.addOrUpdateItem);
router.post('/:pharmacyId/record-sale', inv.recordSale);

module.exports = router;
