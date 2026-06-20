import { useState } from 'react';

/* ── Section wrapper ── */
function SettingSection({ icon, title, description, children }) {
  return (
    <div className="as-section">
      <div className="as-section-header">
        <div className="as-section-icon">{icon}</div>
        <div>
          <h2 className="as-section-title">{title}</h2>
          <p className="as-section-desc">{description}</p>
        </div>
      </div>
      <div className="as-section-body">{children}</div>
    </div>
  );
}

/* ── Divider ── */
const Divider = () => <div className="as-divider" />;

/* ── Sent notification history ── */
const SENT_HISTORY = [
  { id: 1, title: 'System maintenance notice', body: 'The platform will undergo scheduled maintenance on Jun 15 from 2:00–4:00 AM UTC. Please save your work beforehand.', recipients: 'All Users', sentAt: 'Jun 10, 2025 – 09:14', type: 'info' },
  { id: 2, title: 'New course available: AI Fundamentals', body: 'A brand-new course on Artificial Intelligence Fundamentals is now available. Enroll today and get 20% off with code AI2025.', recipients: 'All Users', sentAt: 'Jun 8, 2025 – 14:30', type: 'announcement' },
  { id: 3, title: 'Subscription expiring soon', body: 'Your PLUS subscription expires in 3 days. Renew now to keep your full access to all features.', recipients: 'PLUS Plan', sentAt: 'Jun 5, 2025 – 10:00', type: 'warning' },
];

const TYPE_CFG = {
  info:         { bg: '#dbeafe', color: '#1d4ed8', label: 'Info' },
  announcement: { bg: '#ede9fe', color: '#7c3aed', label: 'Announcement' },
  warning:      { bg: '#fef3c7', color: '#b45309', label: 'Warning' },
  alert:        { bg: '#fee2e2', color: '#dc2626', label: 'Alert' },
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
function AdminSettingsPage() {
  /* ── Notification compose ── */
  const [notifTitle,     setNotifTitle]     = useState('');
  const [notifBody,      setNotifBody]      = useState('');
  const [notifRecipient, setNotifRecipient] = useState('All Users');
  const [notifType,      setNotifType]      = useState('announcement');
  const [sending,        setSending]        = useState(false);
  const [sent,           setSent]           = useState(false);

  const handleSend = () => {
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setNotifTitle(''); setNotifBody(''); setTimeout(() => setSent(false), 2500); }, 1600);
  };

  /* ── AI config ── */
  const [provider,    setProvider]    = useState('openai');
  const [apiKey,      setApiKey]      = useState('sk-••••••••••••••••••••••••••••••••••');
  const [model,       setModel]       = useState('gpt-4o');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens,   setMaxTokens]   = useState('2048');
  const [topP,        setTopP]        = useState('1.0');
  const [showKey,     setShowKey]     = useState(false);
  const [testStatus,  setTestStatus]  = useState(null);
  const [savedAI,     setSavedAI]     = useState(false);

  const MODELS = {
    openai:    ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    google:    ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro'],
    anthropic: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'],
    mistral:   ['mistral-large', 'mistral-medium', 'mistral-small'],
  };

  const PROVIDER_LABELS = {
    openai:    { name: 'OpenAI',             color: '#10a37f' },
    google:    { name: 'Google Gemini',      color: '#4285f4' },
    anthropic: { name: 'Anthropic Claude',   color: '#d97706' },
    mistral:   { name: 'Mistral AI',         color: '#7c3aed' },
  };

  const handleTestAPI = () => {
    setTestStatus('testing');
    setTimeout(() => setTestStatus('ok'), 1800);
  };

  const handleSaveAI = () => {
    setSavedAI(true);
    setTimeout(() => setSavedAI(false), 2000);
  };

  const tc = TYPE_CFG[notifType] || TYPE_CFG.announcement;

  return (
    <div className="as-page">

      <div>
        <h1 className="as-page-title">Admin Settings</h1>
        <p className="as-page-sub">Configure platform-wide preferences, send user notifications, and manage AI settings.</p>
      </div>

      {/* ══ SECTION 1 — Send Notification to Users ══ */}
      <SettingSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        }
        title="Send Notification to Users"
        description="Compose and broadcast a notification to all or selected groups of users on the platform."
      >
        {/* Compose form */}
        <div className="as-group">
          <div className="as-group-label">✉️ Compose Message</div>
          <div className="as-notif-form">

            {/* Row 1: Recipients + Type */}
            <div className="as-notif-row2">
              <div className="as-form-group" style={{ flex: 1 }}>
                <label className="as-form-label">Recipients</label>
                <div className="ptm-select-wrap" style={{ width: '100%' }}>
                  <select
                    className="ptm-select"
                    style={{ width: '100%' }}
                    value={notifRecipient}
                    onChange={e => setNotifRecipient(e.target.value)}
                  >
                    <option>All Users</option>
                    <option>PLUS Plan</option>
                    <option>PRO Plan</option>
                    <option>Free Plan</option>
                    <option>Admin Only</option>
                  </select>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div className="as-form-group" style={{ flex: 1 }}>
                <label className="as-form-label">Notification Type</label>
                <div className="as-type-tabs">
                  {Object.entries(TYPE_CFG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      className={`as-type-tab${notifType === key ? ' as-type-active' : ''}`}
                      style={notifType === key ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color } : {}}
                      onClick={() => setNotifType(key)}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* Title */}
            <div className="as-form-group as-notif-field">
              <label className="as-form-label">Notification Title</label>
              <input
                type="text"
                className="as-form-input"
                placeholder="e.g. System maintenance scheduled for Jun 15"
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
              />
            </div>

            {/* Body */}
            <div className="as-form-group as-notif-field">
              <label className="as-form-label">Message Body</label>
              <textarea
                className="as-form-input as-notif-textarea"
                placeholder="Write the notification content here. Be clear and concise — users will see this in their notification panel."
                value={notifBody}
                onChange={e => setNotifBody(e.target.value)}
                rows={4}
              />
            </div>

            {/* Preview */}
            {(notifTitle || notifBody) && (
              <div className="as-notif-preview">
                <div className="as-notif-preview-label">Preview</div>
                <div className="as-notif-preview-card">
                  <div className="as-notif-preview-icon" style={{ background: tc.bg, color: tc.color }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="as-notif-preview-body">
                    <div className="as-notif-preview-title">
                      {notifTitle || 'Notification title'}
                      <span className="as-notif-type-chip" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                    </div>
                    <div className="as-notif-preview-text">{notifBody || 'Message body will appear here…'}</div>
                    <div className="as-notif-preview-meta">To: {notifRecipient} &nbsp;·&nbsp; Just now</div>
                  </div>
                </div>
              </div>
            )}

            {/* Send button */}
            <div className="as-notif-send-row">
              <span className="as-notif-hint">
                This notification will be sent to <strong>{notifRecipient}</strong>.
              </span>
              <button
                className={`as-save-btn${sent ? ' as-save-done' : ''}`}
                onClick={handleSend}
                disabled={sending || !notifTitle.trim() || !notifBody.trim()}
                style={sending || (!notifTitle.trim() || !notifBody.trim()) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {sending ? (
                  <><span className="as-spin" /> Sending…</>
                ) : sent ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Sent!</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Send Notification</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sent history */}
        <div className="as-group">
          <div className="as-group-label">🕒 Recent Notifications Sent</div>
          {SENT_HISTORY.map((n, i) => {
            const cfg = TYPE_CFG[n.type] || TYPE_CFG.info;
            return (
              <div key={n.id}>
                {i > 0 && <Divider />}
                <div className="as-history-row">
                  <div className="as-history-icon" style={{ background: cfg.bg, color: cfg.color }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="as-history-content">
                    <div className="as-history-title">
                      {n.title}
                      <span className="as-notif-type-chip" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div className="as-history-body">{n.body}</div>
                    <div className="as-history-meta">To: {n.recipients} &nbsp;·&nbsp; {n.sentAt}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SettingSection>

      {/* ══ SECTION 2 — AI API & Model Config ══ */}
      <SettingSection
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 8h.01M12 8h.01M17 8h.01M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        }
        title="AI API & Model Configuration"
        description="Connect and fine-tune the AI model used for question generation, hints, and content analysis."
      >
        {/* Provider selector */}
        <div className="as-group">
          <div className="as-group-label">🔌 AI Provider</div>
          <div className="as-provider-grid">
            {Object.entries(PROVIDER_LABELS).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className={`as-provider-card${provider === key ? ' as-provider-active' : ''}`}
                onClick={() => { setProvider(key); setModel(MODELS[key][0]); }}
                style={provider === key ? { borderColor: cfg.color } : {}}
              >
                <div className="as-provider-dot" style={{ background: cfg.color }} />
                <span className="as-provider-name">{cfg.name}</span>
                {provider === key && (
                  <span className="as-provider-check" style={{ color: cfg.color }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="as-group">
          <div className="as-group-label">🔑 API Key</div>
          <div className="as-field-row">
            <div className="as-form-group" style={{ flex: 1 }}>
              <label className="as-form-label">API Key</label>
              <div className="as-key-input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="as-form-input"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                />
                <button type="button" className="as-key-eye" onClick={() => setShowKey(v => !v)}>
                  {showKey
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="as-test-wrap">
              <label className="as-form-label" style={{ opacity: 0 }}>_</label>
              <button
                type="button"
                className={`as-test-btn${testStatus === 'ok' ? ' as-test-ok' : testStatus === 'fail' ? ' as-test-fail' : ''}`}
                onClick={handleTestAPI}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' && <span className="as-spin" />}
                {testStatus === 'ok'      && <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {testStatus === 'fail'    && <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
                {testStatus === null      && <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {testStatus === 'testing' ? 'Testing…'
                  : testStatus === 'ok'  ? 'Connected'
                  : testStatus === 'fail' ? 'Failed'
                  : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>

        {/* Model selector */}
        <div className="as-group">
          <div className="as-group-label">🧠 Select Model</div>
          <div className="as-model-grid">
            {MODELS[provider].map(m => (
              <button
                key={m}
                type="button"
                className={`as-model-card${model === m ? ' as-model-active' : ''}`}
                onClick={() => setModel(m)}
              >
                <span className="as-model-name">{m}</span>
                {model === m && <span className="as-model-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="as-group">
          <div className="as-group-label">⚙️ Generation Parameters</div>
          <div className="as-params-grid">
            <div className="as-form-group">
              <label className="as-form-label">Temperature</label>
              <div className="as-param-hint">Creativity level (0 = focused, 2 = creative)</div>
              <input type="number" className="as-form-input" min="0" max="2" step="0.1"
                value={temperature} onChange={e => setTemperature(e.target.value)} />
              <input type="range" className="as-range" min="0" max="2" step="0.1"
                value={temperature} onChange={e => setTemperature(e.target.value)} />
            </div>
            <div className="as-form-group">
              <label className="as-form-label">Max Tokens</label>
              <div className="as-param-hint">Maximum response length per request</div>
              <input type="number" className="as-form-input" min="256" max="8192" step="256"
                value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
              <input type="range" className="as-range" min="256" max="8192" step="256"
                value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
            </div>
            <div className="as-form-group">
              <label className="as-form-label">Top P</label>
              <div className="as-param-hint">Token diversity via nucleus sampling</div>
              <input type="number" className="as-form-input" min="0" max="1" step="0.05"
                value={topP} onChange={e => setTopP(e.target.value)} />
              <input type="range" className="as-range" min="0" max="1" step="0.05"
                value={topP} onChange={e => setTopP(e.target.value)} />
            </div>
          </div>
        </div>

        {/* System prompt */}
        <div className="as-group">
          <div className="as-group-label">📝 System Prompt</div>
          <div className="as-form-group as-notif-field">
            <label className="as-form-label">Default prompt for AI</label>
            <textarea
              className="as-form-input as-textarea"
              rows={4}
              defaultValue="You are an educational AI assistant for AI StudyHub. Your role is to generate high-quality, accurate exam questions based on the provided course material. Always output in valid JSON format. Be concise, clear, and pedagogically sound."
            />
            <div className="as-param-hint" style={{ marginTop: 6 }}>
              This prompt is prepended to every AI question-generation request to guide model behavior.
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="as-section-footer">
          <div className="as-active-model-tag">
            <div className="as-active-dot" style={{ background: PROVIDER_LABELS[provider].color }} />
            Active: <strong>{PROVIDER_LABELS[provider].name}</strong> / <strong>{model}</strong>
          </div>
          <button
            className={`as-save-btn${savedAI ? ' as-save-done' : ''}`}
            onClick={handleSaveAI}
          >
            {savedAI ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Saved!</>
            ) : 'Save AI Configuration'}
          </button>
        </div>
      </SettingSection>
    </div>
  );
}

export default AdminSettingsPage;
