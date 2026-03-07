import { useNavigate, useParams } from 'react-router-dom';

export default function SaaSDashboard() {
  const navigate = useNavigate();
  const { pharmacyId } = useParams();

  const cards = [
    { title: 'Inventory Software', value: 'Live Stock Tracking', icon: '📦' },
    { title: 'Analytics', value: 'Sales & Growth Insights', icon: '📈' },
    { title: 'Stock Prediction', value: 'Demand Forecasting', icon: '🔮' },
    { title: 'SaaS Billing', value: 'Monthly Revenue Plans', icon: '💳' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>B2B Pharmacy SaaS Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Manage inventory, monitor analytics, predict stock, and run subscription billing.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: 'var(--bg-secondary, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '22px' }}>{card.icon}</div>
            <h3 style={{ margin: '10px 0 6px 0' }}>{card.title}</h3>
            <p style={{ margin: 0, color: '#6b7280' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/saas/plans/${pharmacyId || ''}`)}
        >
          View Plans
        </button>
        <button className="btn" onClick={() => navigate('/dashboard')}>Back to Main Dashboard</button>
      </div>
    </div>
  );
}
