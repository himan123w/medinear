import { useEffect, useState } from 'react';
import { billingAPI } from '../api';
import './PharmacyBilling.css';

export default function PharmacyBilling(){
  const pharmacyId = localStorage.getItem('pharmacyId');
  const [message, setMessage] = useState('');

  const processNow = async () => {
    setMessage('Processing...');
    try{
      const res = await billingAPI.processBilling();
      setMessage(`Processed ${res.data.count || 0} subscriptions`);
    }catch(err){ setMessage('Error'); console.error(err); }
  };

  return (
    <div className="pharmacy-billing">
      <h2>Billing & SaaS</h2>
      <p>Charge pharmacies monthly. Use this page to trigger billing manually (admin)</p>
      <button className="btn btn-primary" onClick={processNow}>Process Billing Now</button>
      {message && <p>{message}</p>}
    </div>
  );
}
