import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

/* â”€â”€ File type color map for badge â”€â”€ */
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

const STATUS_CFG = {
  Pending:  { cls: 'dm-badge-pending',  label: 'Pending Review' },
  Approved: { cls: 'dm-badge-approved', label: 'Approved' },
  Rejected: { cls: 'dm-badge-rejected', label: 'Rejected' },
};

const STATUSES = ['All Status', 'Pending', 'Approved', 'Rejected'];
const TYPES    = ['All Types', 'PDF', 'DOCX', 'PPTX', 'XLSX', 'MP4'];

const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function DocumentManagementPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter,   setTypeFilter]   = useState('All Types');
  const [preview,      setPreview]      = useState(null);
  const [approveDoc,   setApproveDoc]   = useState(null);
  const [rejectDoc,    setRejectDoc]    = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Could not load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const updateDocumentInState = (updatedDocument) => {
    setDocuments(current => current.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc));
    setPreview(current => current?.id === updatedDocument.id ? updatedDocument : current);
  };

  const handleStatusChange = async (document, status, reason = '') => {
    try {
      setIsSaving(true);
      setError('');
      const updatedDocument = await adminService.updateDocumentStatus(document.id, status, reason);
      updateDocumentInState(updatedDocument);
      setApproveDoc(null);
      setRejectDoc(null);
      setRejectReason('');
    } catch (err) {
      setError(err.message || 'Could not update document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setIsSaving(true);
      setError('');
      await adminService.deleteDocument(deleteDoc.id);
      setDocuments(current => current.filter(doc => doc.id !== deleteDoc.id));
      setPreview(current => current?.id === deleteDoc.id ? null : current);
      setDeleteDoc(null);
    } catch (err) {
      setError(err.message || 'Could not delete document.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCourseLabel = (doc) => [doc.semester, doc.course].filter(Boolean).join(' / ') || 'Unassigned Course';
  const courseOptions = ['All Courses', ...Array.from(new Set(documents.map(getCourseLabel)))];

  const filtered = documents.filter(d => {
    if (courseFilter !== 'All Courses' && getCourseLabel(d) !== courseFilter) return false;
    if (statusFilter !== 'All Status'  && d.status !== statusFilter) return false;
    if (typeFilter   !== 'All Types'   && d.type   !== typeFilter)   return false;
    return true;
  });

  const pending  = documents.filter(d => d.status === 'Pending').length;
  const approved = documents.filter(d => d.status === 'Approved').length;
  const rejected = documents.filter(d => d.status === 'Rejected').length;
  const totalSize = documents.reduce((sum, doc) => sum + Number(doc.sizeMb || 0), 0);

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
          <div className="dm-stat-value">{documents.length}</div>
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
          <div className="dm-stat-value" style={{ fontSize: 22 }}>{totalSize.toFixed(1)} MB</div>
        </div>
      </div>

      {/* Table card */}
      <div className="dm-table-card">
        {/* Filters */}
        <div className="dm-filters">
          {[
            { value: courseFilter, options: courseOptions, setter: setCourseFilter },
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

        {error && <div className="dm-empty" style={{ color: '#dc2626' }}>{error}</div>}
        {isLoading && <div className="dm-empty">Loading documents...</div>}

        {/* Table */}
        {!isLoading && (
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
                  <td className="dm-cell-muted">
                    <div style={{ fontWeight: 700, color: '#2f2a3d' }}>{doc.course}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: '#8b8798' }}>{doc.semester}</div>
                  </td>
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
                      {/* Approve â€” only for pending */}
                      {doc.status === 'Pending' && (
                        <button className="dm-action-btn dm-action-approve" aria-label="Approve" title="Approve" onClick={() => setApproveDoc(doc)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {/* Reject â€” only for pending */}
                      {doc.status === 'Pending' && (
                        <button className="dm-action-btn dm-action-reject" aria-label="Reject" title="Reject" onClick={() => { setRejectDoc(doc); setRejectReason(''); }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                      <button className="dm-action-btn dm-action-reject" aria-label="Delete" title="Delete" onClick={() => setDeleteDoc(doc)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="dm-empty">No documents match your filters.</div>
        )}
      </div>
    </div>

    {/* â”€â”€ PREVIEW MODAL â”€â”€ */}
    {preview && (
      <div className="lib-modal-overlay" onClick={() => setPreview(null)}>
        <div className="dm-preview-modal" onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="dm-preview-header">
            <div className="dm-preview-header-left">
              <div>
                <h2 className="dm-preview-title">{preview.title}</h2>
                <p className="dm-preview-meta">
                  <TypeBadge type={preview.type} />&nbsp;&nbsp;{preview.course} &nbsp;â€¢&nbsp; {preview.semester} &nbsp;â€¢&nbsp; {preview.size}
                </p>
              </div>
            </div>
            <button className="rq-close-btn" onClick={() => setPreview(null)}>âœ•</button>
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

    {/* â”€â”€ APPROVE MODAL â”€â”€ */}
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
              <div className="dm-confirm-doc-meta"><TypeBadge type={approveDoc.type} />&nbsp;&nbsp;Uploaded by {approveDoc.uploader.name} &nbsp;â€¢&nbsp; {approveDoc.size}</div>
            </div>
          </div>
          <div className="lib-modal-divider" />
          <div className="lib-modal-footer">
            <button className="lib-modal-cancel-btn" onClick={() => setApproveDoc(null)}>Cancel</button>
            <button className="dm-approve-confirm-btn" disabled={isSaving} onClick={() => handleStatusChange(approveDoc, 'Approved')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isSaving ? 'Saving...' : 'Approve & Publish'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* â”€â”€ REJECT MODAL â”€â”€ */}
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
            <button className="lib-modal-delete-btn" disabled={isSaving} onClick={() => handleStatusChange(rejectDoc, 'Rejected', rejectReason)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {isSaving ? 'Saving...' : 'Reject Document'}
            </button>
          </div>
        </div>
      </div>
    )}

    {deleteDoc && (
      <div className="lib-modal-overlay" onClick={() => setDeleteDoc(null)}>
        <div className="lib-modal-card lib-modal-delete" onClick={e => e.stopPropagation()}>
          <div className="lib-modal-icon-wrap lib-modal-icon-danger">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="lib-modal-title">Delete Document</h2>
          <p className="lib-modal-subtitle">
            This will permanently delete the document from the database and notify the uploader.
          </p>
          <div className="dm-confirm-doc">
            <div>
              <div className="dm-confirm-doc-name">{deleteDoc.title}</div>
              <div className="dm-confirm-doc-meta"><TypeBadge type={deleteDoc.type} />&nbsp;&nbsp;Uploaded by {deleteDoc.uploader.name}</div>
            </div>
          </div>
          <div className="lib-modal-divider" />
          <div className="lib-modal-footer">
            <button className="lib-modal-cancel-btn" onClick={() => setDeleteDoc(null)}>Cancel</button>
            <button className="lib-modal-delete-btn" disabled={isSaving} onClick={handleDeleteDocument}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isSaving ? 'Deleting...' : 'Delete Document'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default DocumentManagementPage;
