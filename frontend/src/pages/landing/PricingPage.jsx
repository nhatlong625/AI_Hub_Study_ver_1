import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import socialProofImg from "../../assets/images/social-proof.png";

// ── Icons ──
const CheckIcon = ({ color = "#5046e5" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill={color} opacity="0.15" />
    <polyline
      points="7 12 10.5 15.5 17 9"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#ccc" opacity="0.25" />
    <line
      x1="8"
      y1="8"
      x2="16"
      y2="16"
      stroke="#aaa"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="8"
      x2="8"
      y2="16"
      stroke="#aaa"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ── Data ──
const PLANS = {
  monthly: [
    {
      key: "basic",
      name: "Basic",
      tagline: "For casual learners",
      price: 0,
      features: [
        { label: "AI Document Analysis (5/mo)", included: true },
        { label: "1GB Cloud Storage", included: true },
        { label: "Priority Support", included: false },
        { label: "Advanced AI Models", included: false },
      ],
      cta: "Current Plan",
      ctaStyle: "outline",
      highlight: false,
    },
    {
      key: "premium",
      name: "Premium",
      tagline: "Most popular for university",
      price: 9,
      badge: "STUDENT FAVORITE",
      features: [
        { label: "Unlimited AI Document Analysis", included: true },
        { label: "10GB Cloud Storage", included: true },
        { label: "Priority Email Support", included: true },
        { label: "Smart Citation Generator", included: true },
      ],
      cta: "Upgrade to Premium",
      ctaStyle: "primary",
      highlight: true,
    },
    {
      key: "pro",
      name: "Pro",
      tagline: "Advanced AI tools for power users",
      price: 19,
      features: [
        { label: "Custom AI Training Models", included: true },
        { label: "50GB Cloud Storage", included: true },
        { label: "Offline Mode & Sync", included: true },
        { label: "24/7 Dedicated Support", included: true },
      ],
      cta: "Get Pro Now",
      ctaStyle: "dark",
      highlight: false,
    },
  ],
  yearly: [
    {
      key: "basic",
      name: "Basic",
      tagline: "For casual learners",
      price: 0,
      features: [
        { label: "AI Document Analysis (5/mo)", included: true },
        { label: "1GB Cloud Storage", included: true },
        { label: "Priority Support", included: false },
        { label: "Advanced AI Models", included: false },
      ],
      cta: "Current Plan",
      ctaStyle: "outline",
      highlight: false,
    },
    {
      key: "premium",
      name: "Premium",
      tagline: "Most popular for university",
      price: 7,
      badge: "STUDENT FAVORITE",
      features: [
        { label: "Unlimited AI Document Analysis", included: true },
        { label: "10GB Cloud Storage", included: true },
        { label: "Priority Email Support", included: true },
        { label: "Smart Citation Generator", included: true },
      ],
      cta: "Upgrade to Premium",
      ctaStyle: "primary",
      highlight: true,
    },
    {
      key: "pro",
      name: "Pro",
      tagline: "Advanced AI tools for power users",
      price: 15,
      features: [
        { label: "Custom AI Training Models", included: true },
        { label: "50GB Cloud Storage", included: true },
        { label: "Offline Mode & Sync", included: true },
        { label: "24/7 Dedicated Support", included: true },
      ],
      cta: "Get Pro Now",
      ctaStyle: "dark",
      highlight: false,
    },
  ],
};

// ── Toggle ──
function BillingToggle({ yearly, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: "15px",
          fontWeight: yearly ? "500" : "700",
          color: yearly ? "#6b6880" : "#1a1637",
        }}
      >
        Monthly
      </span>
      <div
        onClick={onChange}
        style={{
          width: "48px",
          height: "26px",
          borderRadius: "99px",
          background: yearly ? "#5046e5" : "#d1cce8",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "3px",
            left: yearly ? "25px" : "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "15px",
          fontWeight: yearly ? "700" : "500",
          color: yearly ? "#1a1637" : "#6b6880",
        }}
      >
        Yearly
      </span>
      <span
        style={{
          background: "#fef3c7",
          color: "#d97706",
          fontSize: "12px",
          fontWeight: "700",
          padding: "3px 8px",
          borderRadius: "99px",
        }}
      >
        Save 20%
      </span>
    </div>
  );
}

// ── Pricing Cards ──
function PricingCards({ plans }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "0",
        alignItems: "center",
      }}
    >
      {plans.map((plan) => (
        <PricingCard key={plan.key} plan={plan} />
      ))}
    </div>
  );
}

function PricingCard({ plan }) {
  const [hovered, setHovered] = useState(false);

  const isHighlight = plan.highlight;

  const cardStyle = isHighlight
    ? {
        background: "linear-gradient(145deg, #5c4ee8 0%, #3d38d4 100%)",
        borderRadius: "20px",
        padding: "36px 32px",
        color: "#fff",
        position: "relative",
        zIndex: 2,
        boxShadow: "0 20px 60px rgba(80,70,229,0.4)",
        transform: "translateY(-12px)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }
    : {
        background: "#fff",
        borderRadius: "16px",
        padding: "36px 28px",
        color: "#1a1637",
        border: "1px solid #ece8f5",
        position: "relative",
        zIndex: 1,
      };

  const ctaStyle = (() => {
    if (plan.ctaStyle === "primary")
      return {
        background: "#fff",
        color: "#5046e5",
        fontWeight: "700",
        border: "none",
      };
    if (plan.ctaStyle === "dark")
      return {
        background: "#1a1637",
        color: "#fff",
        fontWeight: "600",
        border: "none",
      };
    return {
      background: "transparent",
      color: "#1a1637",
      fontWeight: "600",
      border: "1.5px solid #d1cce8",
    };
  })();

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        if (!isHighlight) return;
        e.currentTarget.style.transform = "translateY(-16px)";
        e.currentTarget.style.boxShadow = "0 26px 70px rgba(80,70,229,0.5)";
      }}
      onMouseLeave={(e) => {
        if (!isHighlight) return;
        e.currentTarget.style.transform = "translateY(-12px)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(80,70,229,0.4)";
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          className="pricing-badge"
          style={{
            position: "absolute",
            top: "-16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(90deg, #c97c2a, #e09a3a)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "1.2px",
            padding: "6px 16px",
            borderRadius: "99px",
            whiteSpace: "nowrap",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}
        >
          {plan.name}
        </div>
        <div
          style={{
            fontSize: "13px",
            opacity: isHighlight ? 0.75 : undefined,
            color: isHighlight ? undefined : "#6b6880",
          }}
        >
          {plan.tagline}
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "4px",
          marginBottom: "28px",
        }}
      >
        <span style={{ fontSize: "44px", fontWeight: "900", lineHeight: 1 }}>
          ${plan.price}
        </span>
        <span style={{ fontSize: "14px", opacity: 0.65, marginBottom: "6px" }}>
          /mo
        </span>
      </div>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          marginBottom: "32px",
        }}
      >
        {plan.features.map((f) => (
          <div
            key={f.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            {f.included ? (
              <CheckIcon color={isHighlight ? "#fff" : "#5046e5"} />
            ) : (
              <CrossIcon />
            )}
            <span style={{ opacity: f.included ? 1 : 0.5 }}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "99px",
          fontSize: "15px",
          cursor: "pointer",
          transition: "opacity 0.15s, transform 0.15s",
          opacity: hovered ? 0.88 : 1,
          transform: hovered ? "translateY(-1px)" : "",
          ...ctaStyle,
        }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

// ── Social Proof ──
function SocialProof() {
  return (
    <section style={{ padding: "80px 48px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: "64px",
          alignItems: "stretch",
        }}
      >
        {/* Left */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#1a1637",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Everything you need to excel
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#524f63",
              lineHeight: 1.7,
              margin: "0 0 40px",
            }}
          >
            We've designed our pricing to be fair and transparent. No hidden
            fees, no complicated contracts. Just the tools you need to succeed.
          </p>
          <div style={{ display: "flex", gap: "40px" }}>
            {[
              { number: "50k+", label: "STUDENTS" },
              { number: "200+", label: "CAMPUSES" },
            ].map(({ number, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "900",
                    color: "#5046e5",
                  }}
                >
                  {number}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#6b6880",
                    letterSpacing: "1px",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(99,82,229,0.1)",
            boxShadow: "0 8px 32px rgba(80,70,229,0.10)",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Image top */}
          <div style={{ padding: "12px 12px 0 12px" }}>
            <img
              src={socialProofImg}
              alt="Students"
              style={{
                width: "100%",
                height: "260px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                borderRadius: "12px",
              }}
            />
          </div>
          {/* Quote bottom */}
          <div style={{ padding: "24px 28px" }}>
            <p
              style={{
                fontSize: "14px",
                color: "#474554",
                lineHeight: 1.7,
                fontStyle: "italic",
                margin: "0 0 12px",
              }}
            >
              "F STUDY transformed how I manage my research papers. The AI
              analysis is a game-changer for final exams."
            </p>
            <div
              style={{ fontSize: "13px", fontWeight: "700", color: "#1a1637" }}
            >
              — Sarah J., Medical Student
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Hero ──
function Hero({ yearly, onToggle }) {
  return (
    <section style={{ textAlign: "center", padding: "72px 48px 48px" }}>
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "900",
          color: "#1a1637",
          margin: "0 0 16px",
          lineHeight: 1.15,
          letterSpacing: "-1px",
        }}
      >
        Simple pricing for smart students
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#524f63",
          margin: "0 0 36px",
          lineHeight: 1.7,
          maxWidth: "480px",
          display: "inline-block",
        }}
      >
        Choose the perfect plan to supercharge your learning with <br />
        AI-driven insights and effortless organization.
      </p>
      <div style={{ marginBottom: "48px" }}>
        <BillingToggle yearly={yearly} onChange={onToggle} />
      </div>
    </section>
  );
}

// ── Page ──
export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const plans = yearly ? PLANS.yearly : PLANS.monthly;

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#f4f0fe",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,154,58,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(224,154,58,0); }
        }
        .pricing-badge {
          animation: badgePulse 2.2s ease-out infinite;
        }
      `}</style>
      <Navbar />
      <Hero yearly={yearly} onToggle={() => setYearly((v) => !v)} />

      {/* Cards */}
      <div style={{ padding: "0 48px 80px" }}>
        <PricingCards plans={plans} />
      </div>

      <SocialProof />

      <Footer />
    </div>
  );
}
