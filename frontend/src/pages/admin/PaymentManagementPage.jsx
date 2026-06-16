import { useState } from 'react';

/* ── Mock members ── */
const MEMBERS = [
  {
    id: 1, name: 'Sarah Jenkins', email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/36?img=47',
    plan: 'PRO', status: 'Active', billing: 'Yearly', paymentDate: 'Oct 24, 2023',
  },
  {
    id: 2, name: 'Marcus Bell', email: 'm.bell@university.edu',
    initials: 'MB', avatarBg: '#dbeafe', avatarColor: '#1d4ed8',
    plan: 'PLUS', status: 'Active', billing: 'Monthly', paymentDate: 'Oct 12, 2023',
  },
  {
    id: 3, name: 'David Wu', email: 'david.wu@techinst.org',
    initials: 'DW', avatarBg: '#ede9fe', avatarColor: '#7c3aed',
    plan: 'PRO', status: 'Active', billing: 'Yearly', paymentDate: 'Jan 05, 2023',
  },
  {
    id: 4, name: 'Linh Nguyen', email: 'linh.n@school.edu',
    initials: 'LN', avatarBg: '#d1fae5', avatarColor: '#047857',
    plan: 'PLUS', status: 'Expired', billing: 'Monthly', paymentDate: 'Mar 18, 2023',
  },
  {
    id: 5, name: 'Tom Harrington', email: 't.harrington@corp.com',
    initials: 'TH', avatarBg: '#fee2e2', avatarColor: '#dc2626',
    plan: 'PRO', status: 'Active', billing: 'Yearly', paymentDate: 'Dec 01, 2022',
  },
  {
    id: 6, name: 'Amy Chen', email: 'amy.chen@startup.io',
    initials: 'AC', avatarBg: '#fef3c7', avatarColor: '#b45309',
    plan: 'PLUS', status: 'Active', billing: 'Monthly', paymentDate: 'Nov 30, 2023',
  },
];

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
  const [plusPrice,    setPlusPrice]    = useState('19');
  const [plusBilling,  setPlusBilling]  = useState('Monthly');
  const [proPrice,     setProPrice]     = useState('49');
  const [proBilling,   setProBilling]   = useState('Monthly');
  const [savedPlus,    setSavedPlus]    = useState(false);
  const [savedPro,     setSavedPro]     = useState(false);

  const handleSave = (plan) => {
    if (plan === 'PLUS') { setSavedPlus(true); setTimeout(() => setSavedPlus(false), 1800); }
    else                 { setSavedPro(true);  setTimeout(() => setSavedPro(false), 1800); }
  };

  const active  = MEMBERS.filter(m => m.status === 'Active').length;
  const pending = MEMBERS.filter(m => m.status === 'Expired').length;

  return (
    <div className="pm-page">

      {/* Title */}
      <h1 className="pm-page-title">Payment Management</h1>

      {/* Stat cards */}
      <div className="pm-stats-row">
        <div className="pm-stat-card">
          <div className="pm-stat-label">TOTAL REVENUE</div>
          <div className="pm-stat-value">$142,500</div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-label">ACTIVE SUBSCRIPTIONS</div>
          <div className="pm-stat-value">{active}</div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-label">PENDING INVOICES</div>
          <div className="pm-stat-value">{pending}</div>
        </div>
      </div>

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
              onClick={() => handleSave('PLUS')}
            >
              {savedPlus ? '✓ Saved' : 'Save Changes'}
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
              onClick={() => handleSave('PRO')}
            >
              {savedPro ? '✓ Saved' : 'Save Changes'}
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
            {MEMBERS.map(m => {
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
      </div>
    </div>
  );
}

export default PaymentManagementPage;
