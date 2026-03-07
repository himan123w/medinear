import { useNavigate, useParams } from 'react-router-dom';
import './SaasBillingPlans.css';

const plans = [
  {
    name: 'Starter',
    monthly: 4999,
    bestFor: 'Single store operations',
    features: ['Inventory', 'Basic Analytics', 'Stock Alerts', 'Up to 3 staff accounts']
  },
  {
    name: 'Professional',
    monthly: 9999,
    bestFor: 'Growing chains and higher volume',
    featured: true,
    features: ['Advanced Analytics', 'AI Demand Predictions', 'Team Access', 'Up to 15 staff accounts']
  },
  {
    name: 'Enterprise',
    monthly: 24999,
    bestFor: 'Multi-city operations',
    features: ['Custom Limits', 'Priority Support', 'Dedicated Manager', 'SLA + Integrations']
  }
];

export default function SaasBillingPlans() {
  const navigate = useNavigate();
  const { pharmacyId } = useParams();

  return (
    <div className="saas-plans-page">
      <div className="saas-plans-wrap">
        <div className="plans-hero">
          <h1>Choose the Plan That Matches Your Growth</h1>
          <p>Built for modern pharmacies. Start monthly, switch anytime, and scale with confidence.</p>
        </div>

        <div className="billing-note">Annual billing unlocks <strong>2 months free</strong> on every plan.</div>

        <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.featured ? 'featured' : ''}`}
          >
            {plan.featured && <span className="plan-pill">Most Popular</span>}
            <h3>{plan.name}</h3>
            <p className="best-for">Best for: {plan.bestFor}</p>
            <div className="price-block">
              <strong>₹{plan.monthly.toLocaleString('en-IN')}</strong>
              <span>/month</span>
            </div>
            <p className="yearly-price">₹{(plan.monthly * 10).toLocaleString('en-IN')} / year</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button className="btn plan-cta" onClick={() => navigate(`/saas/dashboard/${pharmacyId || ''}`)}>
              Select {plan.name}
            </button>
          </div>
        ))}
        </div>

        <div className="plans-footnote">
          Need custom procurement workflows, compliance reports, or API integrations? Contact enterprise sales.
        </div>
      </div>
    </div>
  );
}
