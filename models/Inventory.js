const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  batchNumber: String,
  quantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  unitPrice: { type: Number, default: 0 },
  supplier: String,
  lastRestocked: Date,
  salesHistory: [
    {
      date: Date,
      quantity: Number
    }
  ]
}, { timestamps: true });

const InventorySchema = new mongoose.Schema({
  pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  items: { type: [InventoryItemSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);
