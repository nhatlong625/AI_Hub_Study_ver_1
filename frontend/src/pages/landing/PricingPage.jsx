import { useState } from 'react';
import { Link } from 'react-router-dom';
import studentsWorking from '../../assets/landingImages/students_working.png';

function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  const getPrice = (monthlyPrice) => {
    if (monthlyPrice === 0) return '$0';
    if (isYearly) {
      // 20% discount
      const discounted = monthlyPrice * 0.8;
      return `$${discounted.toFixed(1).replace('.0', '')}`;
    }
    return `$${monthlyPrice}`;
  };

  return (
    <div className="pricing-section">
      {/* Header */}
      <div className="pricing-header">
        <h1 className="pricing-title">Simple Pricing for Smart Students</h1>
        <p className="pricing-sub">
          Choose the perfect plan to supercharge your learning with AI-driven insights and effortless organization.
        </p>
      </div>

      {/* Monthly/Yearly billing toggle */}
      <div className="pricing-toggle-row">
        <span>Monthly</span>
        <div
          className={['pricing-toggle-switch', isYearly ? 'active' : ''].join(' ').trim()}
          onClick={toggleBilling}
        >
          <div className="pricing-toggle-dot" />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Yearly <span style={{ color: 'var(--color-primary)', fontSize: '0.78rem', background: 'var(--color-primary-soft)', padding: '2px 8px', borderRadius: '6px' }}>Save 20%</span>
        </span>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="pricing-cards-grid">
        {/* Basic Tier */}
        <div className="pricing-card">
          <h3 className="pricing-card-name">Basic</h3>
          <p className="pricing-card-desc">For casual learners</p>
          <div className="pricing-card-price">
            {getPrice(0)}<span>/mo</span>
          </div>

          <div className="pricing-perks-list">
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>AI Document Analysis (3/mo)</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>1GB Cloud Storage</span>
            </div>
            <div className="pricing-perk-item disabled">
              <span className="pricing-perk-icon disabled">✕</span>
              <span>Priority Support</span>
            </div>
            <div className="pricing-perk-item disabled">
              <span className="pricing-perk-icon disabled">✕</span>
              <span>Advanced AI Models</span>
            </div>
          </div>

          <button className="pricing-card-btn current" type="button" disabled>
            Current Plan
          </button>
        </div>

        {/* Premium Tier (Featured) */}
        <div className="pricing-card featured">
          <span className="pricing-card-badge">Student Favorite</span>
          <h3 className="pricing-card-name">Premium</h3>
          <p className="pricing-card-desc">Most popular for university</p>
          <div className="pricing-card-price">
            {getPrice(9)}<span>/mo</span>
          </div>

          <div className="pricing-perks-list">
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>Unlimited AI Document Analysis</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>10GB Cloud Storage</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>Priority Email Support</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>Smart Citation Generator</span>
            </div>
          </div>

          <Link to="/register" style={{ marginTop: 'auto', textDecoration: 'none' }}>
            <button className="pricing-card-btn" type="button" style={{ marginTop: 'auto' }}>
              Upgrade to Premium
            </button>
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="pricing-card">
          <h3 className="pricing-card-name">Pro</h3>
          <p className="pricing-card-desc">Advanced AI tools for power users</p>
          <div className="pricing-card-price">
            {getPrice(19)}<span>/mo</span>
          </div>

          <div className="pricing-perks-list">
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>Custom AI Training Models</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>50GB Cloud Storage</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>Offline Mode & Sync</span>
            </div>
            <div className="pricing-perk-item">
              <span className="pricing-perk-icon enabled">✓</span>
              <span>24/7 Dedicated Support</span>
            </div>
          </div>

          <Link to="/register" style={{ marginTop: 'auto', textDecoration: 'none' }}>
            <button className="pricing-card-btn pro" type="button">
              Get Pro Now
            </button>
          </Link>
        </div>
      </div>

      {/* ── Testimonial & University Statistics ── */}
      <section className="pricing-testimonial-section">
        <div>
          <h2 className="pricing-excel-title">Everything you need to excel.</h2>
          <p className="pricing-excel-sub">
            We've designed our pricing to be fair and transparent. No hidden fees, no complicated contracts. Just the tools you need to succeed.
          </p>

          <div className="pricing-stats-row">
            <div className="pricing-stat-item">
              <span className="pricing-stat-num">50k+</span>
              <span className="pricing-stat-label">Students</span>
            </div>
            <div className="pricing-stat-item">
              <span className="pricing-stat-num">200+</span>
              <span className="pricing-stat-label">Universities</span>
            </div>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="pricing-testimonial-card">
          <div className="pricing-testimonial-img-wrapper">
            <img src={studentsWorking} alt="University students studying together" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <p className="pricing-testimonial-quote">
            "F STUDY transformed how I manage my research papers. The AI analysis is a game-changer for final exams."
          </p>
          <p className="pricing-testimonial-author">
            — Sarah J., Medical Student
          </p>
        </div>
      </section>
    </div>
  );
}

export default PricingPage;
