import { useState } from 'react';
import welcomeIllustration from '../../assets/hero-illustration.svg';

function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState('Last 30 Days');

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 180;

  // Conversations Mock Data
  const conversations = [
    { id: 1, name: 'Sarah Miller', initials: 'SM', text: 'How do I access the...', time: '2m ago', active: true, color: '#DBEAFE', textColor: '#1D4ED8' },
    { id: 2, name: 'John Davis', initials: 'JD', text: 'Thanks for the help!', time: '1h ago', active: false, color: '#FEF3C7', textColor: '#B45309' },
    { id: 3, name: 'Elena Lopez', initials: 'EL', text: 'Is there a practice test for...', time: '3h ago', active: true, color: '#FCE7F3', textColor: '#BE185D' },
    { id: 4, name: 'Anna Kim', initials: 'AK', text: 'Where is the summary?', time: '8h ago', active: true, color: '#D1FAE5', textColor: '#047857' },
    { id: 5, name: 'Lucy White', initials: 'LW', text: 'Best practices for study...', time: '1d ago', active: false, color: '#F3E8FF', textColor: '#7C3AED' }
  ];

  return (
    <div className="admin-dashboard-container">
      {/* Left Column (Wider) */}
      <div className="admin-dashboard-main-col">
        {/* Welcome Banner */}
        <div className="admin-welcome-banner">
          <div className="admin-welcome-text">
            <h2>Welcome back, Admin!</h2>
          </div>
          <div className="admin-welcome-img">
            <img src={welcomeIllustration} alt="Welcome Illustration" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-row">
          {/* Card 1: Total Users */}
          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-label">Total Users</span>
              <span className="admin-stat-icon users-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="14" viewBox="0 0 19 14" fill="none" aria-hidden="true">
                  <path d="M0 13.3333V11C0 10.5278 0.121528 10.0938 0.364583 9.69792C0.607639 9.30208 0.930556 9 1.33333 8.79167C2.19444 8.36111 3.06944 8.03819 3.95833 7.82292C4.84722 7.60764 5.75 7.5 6.66667 7.5C7.58333 7.5 8.48611 7.60764 9.375 7.82292C10.2639 8.03819 11.1389 8.36111 12 8.79167C12.4028 9 12.7257 9.30208 12.9688 9.69792C13.2118 10.0938 13.3333 10.5278 13.3333 11V13.3333H0ZM15 13.3333V10.8333C15 10.2222 14.8299 9.63542 14.4896 9.07292C14.1493 8.51042 13.6667 8.02778 13.0417 7.625C13.75 7.70833 14.4167 7.85069 15.0417 8.05208C15.6667 8.25347 16.25 8.5 16.7917 8.79167C17.2917 9.06944 17.6736 9.37847 17.9375 9.71875C18.2014 10.059 18.3333 10.4306 18.3333 10.8333V13.3333H15ZM6.66667 6.66667C5.75 6.66667 4.96528 6.34028 4.3125 5.6875C3.65972 5.03472 3.33333 4.25 3.33333 3.33333C3.33333 2.41667 3.65972 1.63194 4.3125 0.979167C4.96528 0.326389 5.75 0 6.66667 0C7.58333 0 8.36806 0.326389 9.02083 0.979167C9.67361 1.63194 10 2.41667 10 3.33333C10 4.25 9.67361 5.03472 9.02083 5.6875C8.36806 6.34028 7.58333 6.66667 6.66667 6.66667ZM15 3.33333C15 4.25 14.6736 5.03472 14.0208 5.6875C13.3681 6.34028 12.5833 6.66667 11.6667 6.66667C11.5139 6.66667 11.3194 6.64931 11.0833 6.61458C10.8472 6.57986 10.6528 6.54167 10.5 6.5C10.875 6.05556 11.1632 5.5625 11.3646 5.02083C11.566 4.47917 11.6667 3.91667 11.6667 3.33333C11.6667 2.75 11.566 2.1875 11.3646 1.64583C11.1632 1.10417 10.875 0.611111 10.5 0.166667C10.6944 0.0972222 10.8889 0.0520833 11.0833 0.03125C11.2778 0.0104167 11.4722 0 11.6667 0C12.5833 0 13.3681 0.326389 14.0208 0.979167C14.6736 1.63194 15 2.41667 15 3.33333ZM1.66667 11.6667H11.6667V11C11.6667 10.8472 11.6285 10.7083 11.5521 10.5833C11.4757 10.4583 11.375 10.3611 11.25 10.2917C10.5 9.91667 9.74306 9.63542 8.97917 9.44792C8.21528 9.26042 7.44444 9.16667 6.66667 9.16667C5.88889 9.16667 5.11806 9.26042 4.35417 9.44792C3.59028 9.63542 2.83333 9.91667 2.08333 10.2917C1.95833 10.3611 1.85764 10.4583 1.78125 10.5833C1.70486 10.7083 1.66667 10.8472 1.66667 11V11.6667ZM6.66667 5C7.125 5 7.51736 4.83681 7.84375 4.51042C8.17014 4.18403 8.33333 3.79167 8.33333 3.33333C8.33333 2.875 8.17014 2.48264 7.84375 2.15625C7.51736 1.82986 7.125 1.66667 6.66667 1.66667C6.20833 1.66667 5.81597 1.82986 5.48958 2.15625C5.16319 2.48264 5 2.875 5 3.33333C5 3.79167 5.16319 4.18403 5.48958 4.51042C5.81597 4.83681 6.20833 5 6.66667 5Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <div className="admin-stat-value">8,386</div>
            <div className="admin-progress-bar-container">
              <div className="admin-progress-bar-fill" style={{ width: '68%' }}></div>
            </div>
            <span className="admin-stat-footer">1,412 new this month</span>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-label">Total Revenue</span>
              <span className="admin-stat-icon revenue-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="14" viewBox="0 0 19 14" fill="none" aria-hidden="true">
                  <path d="M10.8333 7.5C10.1389 7.5 9.54861 7.25694 9.0625 6.77083C8.57639 6.28472 8.33333 5.69444 8.33333 5C8.33333 4.30556 8.57639 3.71528 9.0625 3.22917C9.54861 2.74306 10.1389 2.5 10.8333 2.5C11.5278 2.5 12.1181 2.74306 12.6042 3.22917C13.0903 3.71528 13.3333 4.30556 13.3333 5C13.3333 5.69444 13.0903 6.28472 12.6042 6.77083C12.1181 7.25694 11.5278 7.5 10.8333 7.5ZM5 10C4.54167 10 4.14931 9.83681 3.82292 9.51042C3.49653 9.18403 3.33333 8.79167 3.33333 8.33333V1.66667C3.33333 1.20833 3.49653 0.815972 3.82292 0.489583C4.14931 0.163194 4.54167 0 5 0H16.6667C17.125 0 17.5174 0.163194 17.8438 0.489583C18.1701 0.815972 18.3333 1.20833 18.3333 1.66667V8.33333C18.3333 8.79167 18.1701 9.18403 17.8438 9.51042C17.5174 9.83681 17.125 10 16.6667 10H5ZM6.66667 8.33333H15C15 7.875 15.1632 7.48264 15.4896 7.15625C15.816 6.82986 16.2083 6.66667 16.6667 6.66667V3.33333C16.2083 3.33333 15.816 3.17014 15.4896 2.84375C15.1632 2.51736 15 2.125 15 1.66667H6.66667C6.66667 2.125 6.50347 2.51736 6.17708 2.84375C5.85069 3.17014 5.45833 3.33333 5 3.33333V6.66667C5.45833 6.66667 5.85069 6.82986 6.17708 7.15625C6.50347 7.48264 6.66667 7.875 6.66667 8.33333ZM15.8333 13.3333H1.66667C1.20833 13.3333 0.815972 13.1701 0.489583 12.8438C0.163194 12.5174 0 12.125 0 11.6667V2.5H1.66667V11.6667H15.8333V13.3333ZM5 8.33333V1.66667V8.33333Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <div className="admin-stat-value">$142,500</div>
            <div className="admin-stat-subtext">Basic: $12k | Plus: $45k | Pro: $85.5k</div>
            <span className="admin-stat-footer text-orange">12% new this month</span>
          </div>

          {/* Card 3: Uploaded Docs */}
          <div className="admin-stat-card">
            <div className="admin-stat-card-header">
              <span className="admin-stat-label">Uploaded Docs</span>
              <span className="admin-stat-icon docs-icon-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none" aria-hidden="true">
                  <path d="M3.33333 13.3333H10V11.6667H3.33333V13.3333ZM3.33333 10H10V8.33333H3.33333V10ZM1.66667 16.6667C1.20833 16.6667 0.815972 16.5035 0.489583 16.1771C0.163194 15.8507 0 15.4583 0 15V1.66667C0 1.20833 0.179514 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H8.33333L13.3333 5V15C13.3333 15.4583 13.1701 15.8507 12.8438 16.1771C12.5174 16.5035 12.125 16.6667 11.6667 16.6667H1.66667ZM7.5 5.83333V1.66667H1.66667V15H11.6667V5.83333H7.5ZM1.66667 1.66667V5.83333V1.66667V5.83333V15V1.66667Z" fill="currentColor"/>
                </svg>
              </span>
            </div>
            <div className="admin-stat-value">2.4M</div>
            <span className="admin-stat-footer">~12k daily avg</span>
          </div>
        </div>

        {/* File Upload Activity */}
        <div className="admin-chart-card">
          <div className="admin-chart-card-header">
            <h3>File Upload Activity</h3>
            <div className="admin-chart-dropdown">
              <span>{timeframe}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
          <div className="admin-chart-content">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="activity-chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(93, 84, 234, 0.18)" />
                  <stop offset="100%" stopColor="rgba(93, 84, 234, 0)" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="45" x2={chartWidth} y2="45" stroke="#f1f0f5" strokeWidth="1" />
              <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="#f1f0f5" strokeWidth="1" />
              <line x1="0" y1="135" x2={chartWidth} y2="135" stroke="#f1f0f5" strokeWidth="1" />
              {/* Curve Shadow Area */}
              <path d={`M 10 135 C 100 135, 110 95, 170 95 C 230 95, 240 145, 290 145 C 340 145, 390 20, 470 20 C 530 20, 560 135, 590 135 L 590 ${chartHeight} L 10 ${chartHeight} Z`} fill="url(#chartGrad)" />
              {/* Curved Line */}
              <path d="M 10 135 C 100 135, 110 95, 170 95 C 230 95, 240 145, 290 145 C 340 145, 390 20, 470 20 C 530 20, 560 135, 590 135" fill="none" stroke="#5d54ea" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="admin-bottom-grid">
          {/* Subscription Plan */}
          <div className="admin-bottom-card">
            <div className="admin-bottom-card-header">
              <h3>Subscription Plan</h3>
              <a href="#view-details" className="admin-card-link">View Details</a>
            </div>
            <div className="subscription-plan-content">
              <div className="donut-chart-wrapper">
                <svg viewBox="0 0 160 160" width="130" height="130" className="donut-chart-svg">
                  {/* Basic segment: 45% (Gray/light-blue background segment) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#e6e9f2" strokeWidth="15" strokeDasharray="377" strokeDashoffset="0" />
                  {/* Plus segment: 35% (Blue/purple) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#5d54ea" strokeWidth="15" strokeDasharray="377" strokeDashoffset="169.65" transform="rotate(-90 80 80)" />
                  {/* Pro segment: 20% (Purple) */}
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="#8b5cf6" strokeWidth="15" strokeDasharray="377" strokeDashoffset="301.6" transform="rotate(-90 80 80)" />
                  <text x="80" y="85" textAnchor="middle" fontWeight="700" fontSize="13" fill="#1a1926" className="donut-center-text">Plans</text>
                </svg>
              </div>
              <div className="donut-legend">
                <div className="legend-item">
                  <span className="legend-color-dot dot-basic"></span>
                  <span className="legend-label">Basic</span>
                  <span className="legend-percent">45%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color-dot dot-plus"></span>
                  <span className="legend-label">Plus</span>
                  <span className="legend-percent">35%</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color-dot dot-pro"></span>
                  <span className="legend-label">Pro</span>
                  <span className="legend-percent">20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload History */}
          <div className="admin-bottom-card">
            <div className="admin-bottom-card-header">
              <h3>File Upload History</h3>
              <a href="#view-all" className="admin-card-link">View All</a>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-history-table">
                <thead>
                  <tr>
                    <th>FILE NAME</th>
                    <th>USER</th>
                    <th>TIME</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="file-name-cell">
                        <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        </svg>
                        <span>Advanced Calculus</span>
                      </div>
                    </td>
                    <td className="text-gray">Sarah Miller</td>
                    <td className="text-gray">2 mins ago</td>
                    <td>
                      <span className="status-badge status-success">Success</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="file-name-cell">
                        <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        </svg>
                        <span>History Essay.docx</span>
                      </div>
                    </td>
                    <td className="text-gray">John Davis</td>
                    <td className="text-gray">1 hr ago</td>
                    <td>
                      <span className="status-badge status-success">Success</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Side Column) */}
      <div className="admin-dashboard-side-col">
        {/* System Health */}
        <div className="admin-side-card">
          <h3>System Health</h3>
          <div className="health-row">
            <div className="health-item-label">
              <span className="status-dot dot-green"></span>
              <span>API Status</span>
            </div>
            <span className="health-value text-green">100% Uptime</span>
          </div>
          <div className="health-row">
            <div className="health-item-label">
              <span className="status-dot dot-green"></span>
              <span>Database</span>
            </div>
            <span className="health-value text-green">24ms latency</span>
          </div>
          <div className="storage-usage-section">
            <div className="storage-usage-label">
              <span>Storage Usage</span>
              <span>68%</span>
            </div>
            <div className="admin-progress-bar-container storage-bar">
              <div className="admin-progress-bar-fill" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        {/* AI Tutor */}
        <div className="admin-side-card">
          <div className="ai-tutor-header">
            <h3>AI Tutor</h3>
            <span className="active-badge">12 active</span>
          </div>
          <div className="tutor-chats-list">
            {conversations.map((chat) => (
              <div key={chat.id} className="tutor-chat-item">
                <div className="chat-avatar" style={{ backgroundColor: chat.color, color: chat.textColor }}>
                  {chat.initials}
                </div>
                <div className="chat-details">
                  <div className="chat-name-row">
                    <span className="chat-name">{chat.name}</span>
                    <span className="chat-time">{chat.time}</span>
                  </div>
                  <p className="chat-text">{chat.text}</p>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="view-all-chats-btn">
            View All Conversations
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
