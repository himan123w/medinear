import { useEffect, useState } from 'react';
import { inventoryAPI } from '../api';
import './PharmacyInventory.css';

export default function PharmacyInventory(){
  const pharmacyId = localStorage.getItem('pharmacyId');
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getInventory(pharmacyId);
      if (res.data && res.data.success) setInventory(res.data.inventory);
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
    setLoading(false);
  };

  useEffect(()=>{ 
    if (pharmacyId) load(); 
  }, [pharmacyId]);

  return (
    <div className="pharmacy-inventory">
      <h2>Inventory</h2>
      {loading && <p>Loading...</p>}
      {!loading && inventory && (
        <div className="items-grid">
          {inventory.items.map(item => (
            <div key={item._id} className="item-card">
              <h4>{item.medicineName}</h4>
              <p>Qty: {item.quantity}</p>
              <p>Reorder Level: {item.reorderLevel}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
