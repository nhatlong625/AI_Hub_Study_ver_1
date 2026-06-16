import { useState } from 'react';

/* ── File type color map for badge ── */
const TYPE_CFG = {
  PDF:  { bg: '#fee2e2', color: '#dc2626' },
  DOCX: { bg: '#dbeafe', color: '#1d4ed8' },
  PPTX: { bg: '#fef3c7', color: '#b45309' },
  XLSX: { bg: '#d1fae5', color: '#047857' },
  MP4:  { bg: '#ede9fe', color: '#7c3aed' },
};

const TypeBadge = ({ type }) => {
  const c = TYPE_CFG[type] || { bg: '#f0edf8', color: '#5e5b73' };
  return (
    <span style={{ display:'inline-block', padding:'3px 8px', borderRadius:5, background:c.bg, color:c.color, fontSize:10, fontWeight:800, letterSpacing:'0.04em', flexShrink:0 }}>
      {type}
    </span>
  );
};

/* ── Mock data ── */
const DOCS = [
  {
    id: 1, title: 'Software Requirements Specification v2.pdf', type: 'PDF', size: '3.4 MB',
    course: 'Software Engineering', semester: 'Spring 2025',
    uploader: { name: 'Minh Tran', initials: 'MT', color: '#D1FAE5', text: '#047857' },
    uploadedAt: 'Jun 11, 2025 – 14:32', status: 'Pending',
    description: 'Updated SRS document including new functional requirements for the user authentication module.',
  },
  {
    id: 2, title: 'Business Analysis Slide Deck.pptx', type: 'PPTX', size: '12.1 MB',
    course: 'Business Analysis', semester: 'Spring 2025',
    uploader: { name: 'Alex Nguyen', initials: 'AN', color: '#DBEAFE', text: '#1D4ED8' },
    uploadedAt: 'Jun 11, 2025 – 11:05', status: 'Pending',
    description: 'Lecture slides covering SWOT analysis, stakeholder mapping, and process modeling techniques.',
  },
  {
    id: 3, title: 'Database Design Cheatsheet.docx', type: 'DOCX', size: '0.8 MB',
    course: 'Database', semester: 'Spring 2025',
    uploader: { name: 'Kim Anh', initials: 'KA', color: '#FEF3C7', text: '#B45309' },
    uploadedAt: 'Jun 10, 2025 – 09:17', status: 'Approved',
    description: 'Quick reference card for normalization rules, SQL syntax, and ER diagram notation.',
  },
  {
    id: 4, title: 'AI Introduction Lecture Recording.mp4', type: 'MP4', size: '248 MB',
    course: 'Artificial Intelligence', semester: 'Spring 2025',
    uploader: { name: 'John Pham', initials: 'JP', color: '#F3E8FF', text: '#7C3AED' },
    uploadedAt: 'Jun 10, 2025 – 20:44', status: 'Rejected',
    description: 'Lecture recording for Week 3 – Introduction to Neural Networks. Poor audio quality flagged.',
  },
  {
    id: 5, title: 'Calculus II Practice Exam.pdf', type: 'PDF', size: '1.2 MB',
    course: 'Calculus II', semester: 'Fall 2025',
    uploader: { name: 'Linh Vo', initials: 'LV', color: '#DBEAFE', text: '#1D4ED8' },
    uploadedAt: 'Jun 09, 2025 – 16:55', status: 'Pending',
    description: 'Practice exam with 30 questions covering integration techniques and series convergence.',
  },
  {
    id: 6, title: 'Database Query Examples.xlsx', type: 'XLSX', size: '2.3 MB',
    course: 'Database', semester: 'Spring 2025',
    uploader: { name: 'Minh Tran', initials: 'MT', color: '#D1FAE5', text: '#047857' },
    uploadedAt: 'Jun 09, 2025 – 08:30', status: 'Approved',
    description: 'Collection of 50 SQL query examples with explanations covering joins, subqueries, and aggregation.',
  },
];

const STATUS_CFG = {
  Pending:  { cls: 'dm-badge-pending',  label: 'Pending Review' },
  Approved: { cls: 'dm-badge-approved', label: 'Approved' },
  Rejected: { cls: 'dm-badge-rejected', label: 'Rejected' },
};

const COURSES = ['All Courses', 'Software Engineering', 'Business Analysis', 'Database', 'Artificial Intelligence', 'Calculus II'];
const STATUSES = ['All Status', 'Pending', 'Approved', 'Rejected'];
const TYPES    = ['All Types', 'PDF', 'DOCX', 'PPTX', 'XLSX', 'MP4'];

const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function DocumentManagementPage() {
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter,   setTypeFilter]   = useState('All Types');
  const [preview,      setPreview]      = useState(null);
  const [approveDoc,   setApproveDoc]   = useState(null);
  const [rejectDoc,    setRejectDoc]    = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = DOCS.filter(d => {
    if (courseFilter !== 'All Courses' && d.course !== courseFilter) return false;
    if (statusFilter !== 'All Status'  && d.status !== statusFilter) return false;
    if (typeFilter   !== 'All Types'   && d.type   !== typeFilter)   return false;
    return true;
  });

  const pending  = DOCS.filter(d => d.status === 'Pending').length;
  const approved = DOCS.filter(d => d.status === 'Approved').length;
  const rejected = DOCS.filter(d => d.status === 'Rejected').length;

  return (
    <>
    <div className="dm-page">

      {/* Header */}
      <div>
        <h1 className="dm-title">Document Management</h1>
        <p className="dm-subtitle">Review and approve files uploaded by users. Published documents are accessible to all enrolled students.</p>
      </div>

      {/* Stat cards */}
      <div className="dm-stats-row">
        <div className="dm-stat-card">
          <div className="dm-stat-label">TOTAL DOCUMENTS</div>
          <div className="dm-stat-value">{DOCS.length}</div>
        </div>
        <div className="dm-stat-card">
          <div className="dm-stat-label">PENDING REVIEW</div>
          <div className="dm-stat-value dm-stat-orange">{pending}</div>
        </div>
        <div className="dm-stat-card">
          <div className="dm-stat-label">APPROVED</div>
          <div className="dm-stat-value dm-stat-green">{approved}</div>
        </div>
        <div className="dm-stat-card">
          <div className="dm-stat-label">REJECTED</div>
          <div className="dm-stat-value dm-stat-red">{rejected}</div>
        </div>
        <div className="dm-stat-card">
          <div className="dm-stat-label">TOTAL SIZE</div>
          <div className="dm-stat-value" style={{ fontSize: 22 }}>267.8 MB</div>
        </div>
      </div>

      {/* Table card */}
      <div className="dm-table-card">
        {/* Filters */}
        <div className="dm-filters">
          {[
            { value: courseFilter, options: COURSES, setter: setCourseFilter },
            { value: statusFilter, options: STATUSES, setter: setStatusFilter },
            { value: typeFilter,   options: TYPES,    setter: setTypeFilter },
          ].map(({ value, options, setter }) => (
            <div key={value} className="ptm-select-wrap">
              <select className="ptm-select" value={value} onChange={e => setter(e.target.value)}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronIcon />
            </div>
          ))}
          <span className="dm-filter-result">{filtered.length} documents</span>
        </div>

        {/* Table */}
        <table className="dm-table">
          <thead>
            <tr>
              <th>DOCUMENT</th>
              <th>COURSE</th>
              <th>UPLOADED BY</th>
              <th>UPLOADED AT</th>
              <th>SIZE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => {
              const s = STATUS_CFG[doc.status] || {};
              return (
                <tr key={doc.id} className="dm-row">
                  <td>
                    <div className="dm-doc-cell">
                      <div>
                        <div className="dm-doc-name">{doc.title}</div>
                        <div className="dm-doc-meta" style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                          <TypeBadge type={doc.type} />
                          <span>{doc.semester}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="dm-cell-muted">{doc.course}</td>
                  <td>
                    <div className="dm-uploader">
                      <div className="dm-avatar" style={{ background: doc.uploader.color, color: doc.uploader.text }}>
                        {doc.uploader.initials}
                      </div>
                      <span className="dm-uploader-name">{doc.uploader.name}</span>
                    </div>
                  </td>
                  <td className="dm-cell-muted" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{doc.uploadedAt}</td>
                  <td className="dm-cell-muted">{doc.size}</td>
                  <td>
                    <span className={`dm-status-badge ${s.cls}`}>{s.label}</span>
                  </td>
                  <td>
                    <div className="dm-actions">
                      {/* Preview */}
                      <button className="dm-action-btn" aria-label="Preview" title="Preview" onClick={() => setPreview(doc)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      {/* Approve — only for pending */}
                      {doc.status === 'Pending' && (
                        <button className="dm-action-btn dm-action-approve" aria-label="Approve" title="Approve" onClick={() => setApproveDoc(doc)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {/* Reject — only for pending */}
                      {doc.status === 'Pending' && (
                        <button className="dm-action-btn dm-action-reject" aria-label="Reject" title="Reject" onClick={() => { setRejectDoc(doc); setRejectReason(''); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="dm-empty">No documents match your filters.</div>
        )}
      </div>
    </div>

    {/* ── PREVIEW MODAL ── */}
    {preview && (
      <div className="lib-modal-overlay" onClick={() => setPreview(null)}>
        <div className="dm-preview-modal" onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="dm-preview-header">
            <div className="dm-preview-header-left">
              <div>
                <h2 className="dm-preview-title">{preview.title}</h2>
                <p className="dm-preview-meta">
                  <TypeBadge type={preview.type} />&nbsp;&nbsp;{preview.course} &nbsp;•&nbsp; {preview.semester} &nbsp;•&nbsp; {preview.size}
                </p>
              </div>
            </div>
            <button className="rq-close-btn" onClick={() => setPreview(null)}>✕</button>
          </div>

          {/* File preview area */}
          <div className="dm-preview-body">
            <div className="dm-preview-thumb">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: '#c4c2d4' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <TypeBadge type={preview.type} />
              <p className="dm-preview-thumb-name">{preview.title}</p>
              <p className="dm-preview-thumb-size">{preview.size}</p>
            </div>
          </div>

          {/* Info section */}
          <div className="dm-preview-info">
            <div className="dm-preview-info-row">
              <span className="dm-preview-info-label">Uploaded by</span>
              <div className="dm-uploader">
                <div className="dm-avatar" style={{ background: preview.uploader.color, color: preview.uploader.text }}>
                  {preview.uploader.initials}
                </div>
                <span className="dm-uploader-name">{preview.uploader.name}</span>
              </div>
            </div>
            <div className="dm-preview-info-row">
              <span className="dm-preview-info-label">Upload time</span>
              <span className="dm-preview-info-val">{preview.uploadedAt}</span>
            </div>
            <div className="dm-preview-info-row">
              <span className="dm-preview-info-label">Status</span>
              <span className={`dm-status-badge ${STATUS_CFG[preview.status]?.cls}`}>{STATUS_CFG[preview.status]?.label}</span>
            </div>
            <div className="dm-preview-info-row" style={{ alignItems: 'flex-start' }}>
              <span className="dm-preview-info-label">Description</span>
              <span className="dm-preview-info-val">{preview.description}</span>
            </div>
          </div>

          {/* Footer */}
          {preview.status === 'Pending' && (
            <div className="dm-preview-footer">
              <button className="dm-reject-btn" onClick={() => { setRejectDoc(preview); setRejectReason(''); setPreview(null); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Reject
              </button>
              <button className="dm-approve-btn" onClick={() => { setApproveDoc(preview); setPreview(null); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Approve & Publish
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ── APPROVE MODAL ── */}
    {approveDoc && (
      <div className="lib-modal-overlay" onClick={() => setApproveDoc(null)}>
        <div className="lib-modal-card lib-modal-delete" onClick={e => e.stopPropagation()}>
          <div className="lib-modal-icon-wrap" style={{ background: '#d1fae5', color: '#047857' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="lib-modal-title">Approve & Publish</h2>
          <p className="lib-modal-subtitle">
            This document will be <strong>published publicly</strong> and accessible to all enrolled students in <strong>{approveDoc.course}</strong>.
          </p>
          <div className="dm-confirm-doc">
            <div>
              <div className="dm-confirm-doc-name">{approveDoc.title}</div>
              <div className="dm-confirm-doc-meta"><TypeBadge type={approveDoc.type} />&nbsp;&nbsp;Uploaded by {approveDoc.uploader.name} &nbsp;•&nbsp; {approveDoc.size}</div>
            </div>
          </div>
          <div className="lib-modal-divider" />
          <div className="lib-modal-footer">
            <button className="lib-modal-cancel-btn" onClick={() => setApproveDoc(null)}>Cancel</button>
            <button className="dm-approve-confirm-btn" onClick={() => setApproveDoc(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Approve & Publish
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── REJECT MODAL ── */}
    {rejectDoc && (
      <div className="lib-modal-overlay" onClick={() => setRejectDoc(null)}>
        <div className="lib-modal-card lib-modal-delete" onClick={e => e.stopPropagation()}>
          <div className="lib-modal-icon-wrap lib-modal-icon-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="lib-modal-title">Reject Document</h2>
          <p className="lib-modal-subtitle">
            This document will be rejected and the uploader will be notified. Please provide a reason.
          </p>
          <div className="dm-confirm-doc">
            <div>
              <div className="dm-confirm-doc-name">{rejectDoc.title}</div>
              <div className="dm-confirm-doc-meta"><TypeBadge type={rejectDoc.type} />&nbsp;&nbsp;Uploaded by {rejectDoc.uploader.name}</div>
            </div>
          </div>
          <div className="lib-form-group" style={{ marginTop: 16 }}>
            <label className="lib-form-label">Reason for rejection</label>
            <textarea
              className="lib-form-input rq-textarea"
              placeholder="e.g. Poor quality, incorrect content, copyright issue..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="lib-modal-divider" />
          <div className="lib-modal-footer">
            <button className="lib-modal-cancel-btn" onClick={() => setRejectDoc(null)}>Cancel</button>
            <button className="lib-modal-delete-btn" onClick={() => setRejectDoc(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Reject Document
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default DocumentManagementPage;
