import { useEffect, useState } from 'react';
import { analyticsAPI } from '../api';
import './PharmacyAnalytics.css';

export default function PharmacyAnalytics(){
  const pharmacyId = localStorage.getItem('pharmacyId');
  const [stock, setStock] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const load = async () => {
    try{
      const s = await analyticsAPI.getStockSummary(pharmacyId);
      const p = await analyticsAPI.getPrediction(pharmacyId);
      if (s.data && s.data.success) setStock(s.data.items);
      if (p.data && p.data.success) setPredictions(p.data.predictions);
    }catch(err){
      console.error('Error loading analytics:', err);
    }
  };

  useEffect(()=>{ 
    if (pharmacyId) load(); 
  }, [pharmacyId]);

  return (
    <div className="pharmacy-analytics">
      <h2>Analytics</h2>
      <h3>Stock Summary</h3>
      <div className="grid">
        {stock.map(i => (<div key={i.medicineName} className="card"><strong>{i.medicineName}</strong><p>Qty: {i.quantity}</p></div>))}
      </div>
      <h3>Predictions</h3>
      <div className="grid">
        {predictions.map(p => (<div key={p.medicineName} className="card"><strong>{p.medicineName}</strong><p>Expected consumption (lead): {p.expectedConsumption}</p><p>Needs reorder: {p.needsReorder ? 'Yes' : 'No'}</p></div>))}
      </div>
    </div>
  );
}
