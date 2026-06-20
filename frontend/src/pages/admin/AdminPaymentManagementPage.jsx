import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const PLAN_CFG = {
  PRO:  { bg: '#ede9fe', color: '#7c3aed' },
  PLUS: { bg: '#dbeafe', color: '#1d4ed8' },
};

function Avatar({ member }) {
  if (member.avatar) {
    return <img src={member.avatar} alt={member.name} className="pm-avatar-img" />;
  }
  return (
    <div className="pm-avatar-init" style={{ background: member.avatarBg, color: member.avatarColor }}>
      {member.initials}
    </div>
  );
}

function PaymentManagementPage() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, activeSubscriptions: 0, pendingInvoices: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState('');
  const [error, setError] = useState('');
  const [plusPrice,    setPlusPrice]    = useState('19');
  const [plusBilling,  setPlusBilling]  = useState('Monthly');
  const [proPrice,     setProPrice]     = useState('49');
  const [proBilling,   setProBilling]   = useState('Monthly');
  const [savedPlus,    setSavedPlus]    = useState(false);
  const [savedPro,     setSavedPro]     = useState(false);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getPayments();
      setMembers(data.members || []);
      setStats(data.stats || { totalRevenue: 0, activeSubscriptions: 0, pendingInvoices: 0 });

      const plus = data.plans?.find(plan => plan.plan === 'PLUS');
      const pro = data.plans?.find(plan => plan.plan === 'PRO');
      if (plus) {
        setPlusPrice(String(plus.price));
        setPlusBilling(plus.billing);
      }
      if (pro) {
        setProPrice(String(pro.price));
        setProBilling(pro.billing);
      }
    } catch (err) {
      setError(err.message || 'Could not load payments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSave = async (plan) => {
    const isPlus = plan === 'PLUS';
    try {
      setIsSaving(plan);
      setError('');
      const updatedPlan = await adminService.updatePaymentPlan(plan, {
        price: isPlus ? plusPrice : proPrice,
        billing: isPlus ? plusBilling : proBilling,
      });

      if (isPlus) {
        setPlusPrice(String(updatedPlan.price));
        setPlusBilling(updatedPlan.billing);
        setSavedPlus(true);
        setTimeout(() => setSavedPlus(false), 1800);
      } else {
        setProPrice(String(updatedPlan.price));
        setProBilling(updatedPlan.billing);
        setSavedPro(true);
        setTimeout(() => setSavedPro(false), 1800);
      }
    } catch (err) {
      setError(err.message || 'Could not save plan pricing.');
    } finally {
      setIsSaving('');
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return (
    <div className="pm-page">

      {/* Title */}
      <h1 className="pm-page-title">Payment Management</h1>

      {/* Stat cards */}
      <div className="pm-stats-row">
        <div className="pm-stat-card">
          <div className="pm-stat-label">TOTAL REVENUE</div>
          <div className="pm-stat-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-label">ACTIVE SUBSCRIPTIONS</div>
          <div className="pm-stat-value">{stats.activeSubscriptions}</div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-label">PENDING INVOICES</div>
          <div className="pm-stat-value">{stats.pendingInvoices}</div>
        </div>
      </div>

      {error && <div className="dm-empty" style={{ color: '#dc2626' }}>{error}</div>}

      {/* Plan Pricing */}
      <div className="pm-section-card">
        <h2 className="pm-section-title">Manage Plan Pricing</h2>

        {/* PLUS plan */}
        <div className="pm-plan-row">
          <div className="pm-plan-info">
            <div className="pm-plan-name">PLUS</div>
            <div className="pm-plan-desc">Most popular choice for active users.</div>
          </div>
          <div className="pm-plan-controls">
            <div className="pm-field-group">
              <label className="pm-field-label">PRICE ($)</label>
              <input
                type="number" className="pm-price-input"
                value={plusPrice} onChange={e => setPlusPrice(e.target.value)}
              />
            </div>
            <div className="pm-field-group">
              <label className="pm-field-label">BILLING</label>
              <select className="pm-billing-select" value={plusBilling} onChange={e => setPlusBilling(e.target.value)}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <button
              className={`pm-save-btn${savedPlus ? ' pm-save-btn-done' : ''}`}
              disabled={isSaving === 'PLUS'}
              onClick={() => handleSave('PLUS')}
            >
              {isSaving === 'PLUS' ? 'Saving...' : savedPlus ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* PRO plan */}
        <div className="pm-plan-row">
          <div className="pm-plan-info">
            <div className="pm-plan-name">PRO</div>
            <div className="pm-plan-desc">Advanced tools for institutions.</div>
          </div>
          <div className="pm-plan-controls">
            <div className="pm-field-group">
              <label className="pm-field-label">PRICE ($)</label>
              <input
                type="number" className="pm-price-input"
                value={proPrice} onChange={e => setProPrice(e.target.value)}
              />
            </div>
            <div className="pm-field-group">
              <label className="pm-field-label">BILLING</label>
              <select className="pm-billing-select" value={proBilling} onChange={e => setProBilling(e.target.value)}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <button
              className={`pm-save-btn${savedPro ? ' pm-save-btn-done' : ''}`}
              disabled={isSaving === 'PRO'}
              onClick={() => handleSave('PRO')}
            >
              {isSaving === 'PRO' ? 'Saving...' : savedPro ? 'Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Subscribed Members */}
      <div className="pm-section-card">
        <div className="pm-members-header">
          <h2 className="pm-section-title" style={{ margin: 0 }}>Subscribed Members</h2>
          <button className="pm-export-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Export List
          </button>
        </div>

        {isLoading && <div className="dm-empty">Loading payments...</div>}
        {!isLoading && (
        <table className="pm-table">
          <thead>
            <tr>
              <th>MEMBER</th>
              <th>PLAN</th>
              <th>STATUS</th>
              <th>BILLING CYCLE</th>
              <th>PAYMENT DATE</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const pc = PLAN_CFG[m.plan] || {};
              return (
                <tr key={m.id} className="pm-row">
                  <td>
                    <div className="pm-member-cell">
                      <Avatar member={m} />
                      <div>
                        <div className="pm-member-name">{m.name}</div>
                        <div className="pm-member-email">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pm-plan-badge" style={{ background: pc.bg, color: pc.color }}>
                      {m.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`pm-status${m.status === 'Active' ? ' pm-status-active' : ' pm-status-expired'}`}>
                      <span className="pm-status-dot" />
                      {m.status}
                    </span>
                  </td>
                  <td className="pm-cell-muted">{m.billing}</td>
                  <td className="pm-cell-muted">{m.paymentDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export default PaymentManagementPage;
