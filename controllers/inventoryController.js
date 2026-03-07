const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    let inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) inv = await Inventory.create({ pharmacy: pharmacyId, items: [] });
    res.json({ success: true, inventory: inv });
  } catch (err) {
    console.error('Get inventory error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addOrUpdateItem = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { medicineName, medicineId, batchNumber, quantity, unitPrice, reorderLevel, supplier } = req.body;

    let inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) inv = await Inventory.create({ pharmacy: pharmacyId, items: [] });

    let item = inv.items.find(i => (i.medicineId && i.medicineId.toString() === (medicineId || '')) || i.medicineName === medicineName);
    if (item) {
      // update
      item.batchNumber = batchNumber || item.batchNumber;
      item.quantity = typeof quantity === 'number' ? quantity : (item.quantity + (quantity || 0));
      item.unitPrice = unitPrice || item.unitPrice;
      item.reorderLevel = typeof reorderLevel === 'number' ? reorderLevel : item.reorderLevel;
      item.supplier = supplier || item.supplier;
      item.lastRestocked = new Date();
    } else {
      inv.items.push({ medicineName, medicineId, batchNumber, quantity, unitPrice, reorderLevel, supplier, lastRestocked: new Date() });
    }

    await inv.save();
    res.json({ success: true, inventory: inv });
  } catch (err) {
    console.error('Add/Update item error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.recordSale = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { medicineName, quantity } = req.body;
    const inv = await Inventory.findOne({ pharmacy: pharmacyId });
    if (!inv) return res.status(404).json({ success: false, message: 'Inventory not found' });

    const item = inv.items.find(i => i.medicineName === medicineName || (i.medicineId && i.medicineId.toString() === (req.body.medicineId || '')));
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.quantity = Math.max(0, item.quantity - quantity);
    item.salesHistory.push({ date: new Date(), quantity });
    await inv.save();
    res.json({ success: true, inventory: inv });
  } catch (err) {
    console.error('Record sale error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
