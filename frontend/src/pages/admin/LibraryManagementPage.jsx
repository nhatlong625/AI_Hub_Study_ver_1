import { useState, useEffect, useRef } from 'react';

const semestersData = [
  { id: 1, name: 'Spring 2024', range: 'Jan – May', courses: 124, docs: 128, storage: '320 MB', status: 'ACTIVE',   startDate: '29/04/2026', endDate: '29/04/2027', description: 'Standard Spring term encompassing core curriculum and undergraduate electives.' },
  { id: 2, name: 'Summer 2024', range: 'Jun – Aug', courses: 38,  docs: 45,  storage: '110 MB', status: 'ACTIVE',   startDate: '01/06/2024', endDate: '31/08/2024', description: '' },
  { id: 3, name: 'Fall 2024',   range: 'Sep – Dec', courses: 56,  docs: 96,  storage: '280 MB', status: 'ACTIVE',   startDate: '01/09/2024', endDate: '20/12/2024', description: '' },
  { id: 4, name: 'Spring 2025', range: 'Jan – May', courses: 89,  docs: 104, storage: '410 MB', status: 'ACTIVE',   startDate: '15/01/2025', endDate: '30/05/2025', description: '' },
  { id: 5, name: 'Fall 2023',   range: 'Sep – Dec', courses: 42,  docs: 87,  storage: '260 MB', status: 'ARCHIVED', startDate: '01/09/2023', endDate: '20/12/2023', description: '' },
];

const coursesData = {
  1: [
    { id: 1, name: 'Introduction to Algorithms', code: 'CS-101',   instructor: 'Dr. Alan Turing',        docs: 24, updated: 'Oct 24, 2023', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 2, name: 'Advanced Calculus',           code: 'MATH-302', instructor: 'Prof. Isaac Newton',     docs: 18, updated: 'Oct 22, 2023', status: 'Draft',    icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 3, name: 'Modern World Literature',     code: 'LIT-205',  instructor: 'Dr. Virginia Woolf',    docs: 42, updated: 'Oct 20, 2023', status: 'Active',   icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 4, name: 'Cellular Biology',            code: 'BIO-410',  instructor: 'Dr. Rosalind Franklin', docs: 0,  updated: 'Oct 18, 2023', status: 'Archived', icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 5, name: 'Data Structures',             code: 'CS-201',   instructor: 'Dr. Ada Lovelace',      docs: 30, updated: 'Oct 16, 2023', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 6, name: 'Discrete Mathematics',        code: 'MATH-210', instructor: 'Prof. Georg Cantor',    docs: 14, updated: 'Oct 14, 2023', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 7, name: 'English Composition',         code: 'ENG-101',  instructor: 'Prof. George Orwell',   docs: 22, updated: 'Oct 12, 2023', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 8, name: 'Physics I',                   code: 'PHY-101',  instructor: 'Dr. Richard Feynman',   docs: 19, updated: 'Oct 10, 2023', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
  ],
  2: [
    { id: 1, name: 'Data Structures',             code: 'CS-201',   instructor: 'Dr. Ada Lovelace',      docs: 12, updated: 'Aug 10, 2024', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 2, name: 'Linear Algebra',              code: 'MATH-201', instructor: 'Prof. Emmy Noether',    docs: 8,  updated: 'Aug 08, 2024', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 3, name: 'Intro to Philosophy',         code: 'PHIL-101', instructor: 'Prof. Immanuel Kant',   docs: 10, updated: 'Aug 06, 2024', status: 'Active',   icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 4, name: 'Microbiology',                code: 'BIO-210',  instructor: 'Dr. Louis Pasteur',     docs: 6,  updated: 'Aug 04, 2024', status: 'Draft',    icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 5, name: 'Web Development',             code: 'CS-310',   instructor: 'Dr. Tim Berners-Lee',   docs: 20, updated: 'Aug 02, 2024', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 6, name: 'Statistics I',                code: 'STAT-101', instructor: 'Prof. Karl Pearson',    docs: 15, updated: 'Jul 30, 2024', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 7, name: 'Creative Writing',            code: 'ENG-202',  instructor: 'Prof. Mark Twain',      docs: 9,  updated: 'Jul 28, 2024', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 8, name: 'Chemistry I',                 code: 'CHEM-101', instructor: 'Dr. Antoine Lavoisier', docs: 11, updated: 'Jul 26, 2024', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
  ],
  3: [
    { id: 1, name: 'Computer Networks',           code: 'CS-401',   instructor: 'Dr. Vint Cerf',         docs: 20, updated: 'Dec 05, 2024', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 2, name: 'Organic Chemistry',           code: 'CHEM-301', instructor: 'Dr. Marie Curie',       docs: 15, updated: 'Dec 03, 2024', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 3, name: 'World History',               code: 'HIST-101', instructor: 'Prof. Howard Zinn',     docs: 30, updated: 'Dec 01, 2024', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 4, name: 'Calculus III',                code: 'MATH-301', instructor: 'Prof. Leonhard Euler',  docs: 18, updated: 'Nov 29, 2024', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 5, name: 'Operating Systems',           code: 'CS-402',   instructor: 'Dr. Linus Torvalds',    docs: 25, updated: 'Nov 27, 2024', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 6, name: 'Ecology',                     code: 'BIO-320',  instructor: 'Dr. Charles Darwin',    docs: 12, updated: 'Nov 25, 2024', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 7, name: 'American Literature',         code: 'LIT-310',  instructor: 'Prof. Ernest Hemingway',docs: 16, updated: 'Nov 23, 2024', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 8, name: 'Probability Theory',          code: 'STAT-210', instructor: 'Prof. Pierre-Simon Laplace', docs: 10, updated: 'Nov 21, 2024', status: 'Active', icon: 'calc', color: '#fef3c7', iconColor: '#d97706' },
  ],
  4: [
    { id: 1, name: 'Machine Learning',            code: 'CS-501',   instructor: 'Dr. Geoffrey Hinton',   docs: 35, updated: 'May 12, 2025', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 2, name: 'Statistics II',               code: 'STAT-301', instructor: 'Prof. Ronald Fisher',   docs: 22, updated: 'May 10, 2025', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 3, name: 'Molecular Biology',           code: 'BIO-501',  instructor: 'Dr. James Watson',      docs: 28, updated: 'May 08, 2025', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 4, name: 'Comparative Literature',      code: 'LIT-410',  instructor: 'Prof. Franz Kafka',     docs: 17, updated: 'May 06, 2025', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 5, name: 'Artificial Intelligence',     code: 'CS-502',   instructor: 'Dr. Alan Turing',       docs: 40, updated: 'May 04, 2025', status: 'Active',   icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 6, name: 'Quantum Mechanics',           code: 'PHY-401',  instructor: 'Dr. Niels Bohr',        docs: 32, updated: 'May 02, 2025', status: 'Active',   icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 7, name: 'Advanced Algebra',            code: 'MATH-401', instructor: 'Prof. Évariste Galois', docs: 14, updated: 'Apr 30, 2025', status: 'Active',   icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 8, name: 'Poetry & Poetics',            code: 'LIT-310',  instructor: 'Prof. Emily Dickinson', docs: 8,  updated: 'Apr 28, 2025', status: 'Draft',    icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
  ],
  5: [
    { id: 1, name: 'Classical Literature',        code: 'LIT-101',  instructor: 'Prof. Homer Simpson',   docs: 18, updated: 'Dec 10, 2023', status: 'Archived', icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 2, name: 'Genetics',                    code: 'BIO-301',  instructor: 'Dr. Gregor Mendel',     docs: 11, updated: 'Dec 08, 2023', status: 'Archived', icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 3, name: 'Intro to Programming',        code: 'CS-101',   instructor: 'Dr. Dennis Ritchie',    docs: 24, updated: 'Dec 06, 2023', status: 'Archived', icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 4, name: 'Trigonometry',                code: 'MATH-101', instructor: 'Prof. Hipparchus',      docs: 9,  updated: 'Dec 04, 2023', status: 'Archived', icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
    { id: 5, name: 'Environmental Science',       code: 'ENV-201',  instructor: 'Dr. Rachel Carson',     docs: 15, updated: 'Dec 02, 2023', status: 'Archived', icon: 'science', color: '#fce7f3', iconColor: '#db2777' },
    { id: 6, name: 'Ancient History',             code: 'HIST-201', instructor: 'Prof. Herodotus',       docs: 20, updated: 'Nov 30, 2023', status: 'Archived', icon: 'book',    color: '#d1fae5', iconColor: '#059669' },
    { id: 7, name: 'Database Systems',            code: 'CS-302',   instructor: 'Dr. Edgar Codd',        docs: 16, updated: 'Nov 28, 2023', status: 'Archived', icon: 'code',    color: '#e0e7ff', iconColor: '#4648D4' },
    { id: 8, name: 'Algebra I',                   code: 'MATH-101', instructor: 'Prof. Al-Khwarizmi',    docs: 7,  updated: 'Nov 26, 2023', status: 'Archived', icon: 'calc',    color: '#fef3c7', iconColor: '#d97706' },
  ],
};

const ICON_MAP = {
  code:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  calc:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  book:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2"/></svg>),
  science: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v7L6 19h12l-4-9V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
};

const EMPTY_FORM = { name: '', startDate: '', endDate: '', description: '', status: 'ACTIVE' };

function LibraryManagementPage() {
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editSemester, setEditSemester]     = useState(null);
  const [deleteSemester, setDeleteSemester] = useState(null);
  const [createModal, setCreateModal]           = useState(false);
  const [createForm, setCreateForm]             = useState(EMPTY_FORM);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [createCourseModal, setCreateCourseModal] = useState(false);
  const menuRef = useRef(null);

  const filtered = semestersData.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Prevent body scroll when any modal open
  useEffect(() => {
    if (editSemester || deleteSemester || createModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [editSemester, deleteSemester, createModal]);

  function openCreate() {
    setCreateForm(EMPTY_FORM);
    setCreateModal(true);
  }

  function openEdit(row) {
    setOpenMenuId(null);
    setEditSemester({ ...row });
  }

  function openDelete(row) {
    setOpenMenuId(null);
    setDeleteSemester(row);
  }

  // ── COURSES PAGE (early return) ──
  if (selectedSemester) {
    const courses = coursesData[selectedSemester.id] || [];
    return (
      <div className="lib-page">

        {/* Back link */}
        <button className="lib-courses-back" type="button" onClick={() => setSelectedSemester(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Semesters
        </button>

        {/* Title */}
        <div className="lib-header">
          <h1 className="lib-title">{selectedSemester.name} Courses</h1>
          <p className="lib-subtitle">Manage and review all courses for the current academic term.</p>
        </div>

        {/* Stat card + Create Course on same row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="lib-courses-stat-card">
            <div className="lib-courses-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#4648D4" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="#4648D4" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <div className="lib-courses-stat-label">TOTAL COURSES</div>
              <div className="lib-courses-stat-value">{selectedSemester.courses}</div>
            </div>
          </div>

          <button
            className="lib-create-btn"
            type="button"
            onClick={() => setCreateCourseModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Create Course
          </button>
        </div>

        {/* Courses table */}
        <div className="lib-table-card lib-courses-tbl">
          <table className="lib-table lib-table--courses">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Documents</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} className="lib-course-row">
                  <td>
                    <div className="lib-course-name-cell">
                      <div>
                        <div className="lib-course-name">{course.name}</div>
                        <div className="lib-course-code" style={{ color: course.iconColor }}>{course.code}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="lib-course-docs">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#8c8a9e" strokeWidth="2" strokeLinejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="#8c8a9e" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                      {course.docs}
                    </div>
                  </td>
                  <td className="lib-row-muted">{course.updated}</td>
                  <td>
                    <span className={`lib-status-badge ${
                      course.status === 'Active'   ? 'lib-status-active'   :
                      course.status === 'Archived' ? 'lib-status-archived' :
                      'lib-status-draft'
                    }`}>{course.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="lib-icon-delete-btn" type="button" aria-label="Delete course">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="lib-pagination">
            <span className="lib-pagination-info">
              Showing 1 to 8 of <strong>{selectedSemester.courses}</strong> entries
            </span>
            <div className="lib-pagination-controls">
              <button className="lib-page-icon-btn" type="button" disabled>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {[1,2,3].map(p => (
                <button key={p} className={`lib-page-num${p === 1 ? ' active' : ''}`} type="button">{p}</button>
              ))}
              <span className="lib-page-ellipsis">…</span>
              <button className="lib-page-icon-btn" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── CREATE COURSE MODAL ── */}
        {createCourseModal && (
          <div className="lib-modal-overlay" onClick={() => setCreateCourseModal(false)}>
            <div className="lib-modal-card lib-modal-edit" onClick={e => e.stopPropagation()}>
              <h2 className="lib-modal-title">Create Course</h2>
              <p className="lib-modal-subtitle">Add a new course to <strong>{selectedSemester.name}</strong>.</p>

              <div className="lib-modal-divider" />

              <div className="lib-form-group">
                <label className="lib-form-label">Course Name</label>
                <input className="lib-form-input" type="text" placeholder="e.g. Introduction to Algorithms" />
              </div>

              <div className="lib-form-group">
                <label className="lib-form-label">Course Code</label>
                <input className="lib-form-input" type="text" placeholder="e.g. CS-101" />
              </div>

              <div className="lib-form-group">
                <label className="lib-form-label">Instructor</label>
                <input className="lib-form-input" type="text" placeholder="e.g. Dr. Alan Turing" />
              </div>

              <div className="lib-form-group">
                <label className="lib-form-label">Description (Optional)</label>
                <textarea className="lib-form-textarea" rows={3} placeholder="Brief description of the course..." />
              </div>

              <div className="lib-form-group">
                <label className="lib-form-label">Status</label>
                <div className="lib-form-radio-row">
                  <label className="lib-radio-label">
                    <input type="radio" name="course-status" defaultChecked className="lib-radio-input" /> Active
                  </label>
                  <label className="lib-radio-label">
                    <input type="radio" name="course-status" className="lib-radio-input" /> Draft
                  </label>
                  <label className="lib-radio-label">
                    <input type="radio" name="course-status" className="lib-radio-input" /> Archived
                  </label>
                </div>
              </div>

              <div className="lib-modal-divider" />

              <div className="lib-modal-footer">
                <button className="lib-modal-cancel-btn" type="button" onClick={() => setCreateCourseModal(false)}>Cancel</button>
                <button className="lib-modal-save-btn" type="button" onClick={() => setCreateCourseModal(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  Create Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lib-page">
      {/* Header */}
      <div className="lib-header">
        <h1 className="lib-title">Library Management</h1>
        <p className="lib-subtitle">Manage semesters, course folders, user libraries, uploaded documents, and storage usage across the platform.</p>
      </div>

      {/* Stat Cards */}
      <div className="lib-stats-row">
        <div className="lib-stat-card">
          <div className="lib-stat-label">Total Semesters</div>
          <div className="lib-stat-value">12</div>
        </div>
        <div className="lib-stat-card">
          <div className="lib-stat-label">Course Folders</div>
          <div className="lib-stat-value">248</div>
        </div>
        <div className="lib-stat-card">
          <div className="lib-stat-label">Total Documents</div>
          <div className="lib-stat-value">14,250</div>
        </div>
        <div className="lib-stat-card lib-stat-card--storage">
          <div className="lib-stat-label">Storage Used</div>
          <div className="lib-stat-value lib-stat-value--storage">
            1.2 TB <span className="lib-storage-total">/ 2.0 TB</span>
          </div>
          <div className="lib-storage-bar-bg">
            <div className="lib-storage-bar-fill" style={{ width: '60%' }} />
          </div>
        </div>
        <div className="lib-stat-card">
          <div className="lib-stat-label">AI Generated Content</div>
          <div className="lib-stat-value">3,420</div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="lib-actions-row">
        <div className="lib-search-wrapper">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="lib-search-icon">
            <circle cx="11" cy="11" r="8" stroke="#8c8a9e" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="#8c8a9e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search semester..."
            className="lib-search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="lib-create-btn" type="button" onClick={openCreate}>Create Semester</button>
      </div>

      {/* Table */}
      <div className="lib-table-card">
        <table className="lib-table">
          <thead>
            <tr>
              <th>SEMESTER NAME</th>
              <th>TIME RANGE</th>
              <th>COURSES</th>
              <th>DOCS</th>
              <th>STORAGE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr
                key={row.id}
                className="lib-row-clickable"
                onClick={() => setSelectedSemester(row)}
              >
                <td className="lib-row-name">{row.name}</td>
                <td className="lib-row-muted">{row.range}</td>
                <td className="lib-row-muted">{row.courses} Courses</td>
                <td className="lib-row-muted">{row.docs}</td>
                <td className="lib-row-muted">{row.storage}</td>
                <td>
                  <span className={`lib-status-badge${row.status === 'ARCHIVED' ? ' lib-status-archived' : ' lib-status-active'}`}>
                    {row.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div
                    className="lib-action-wrapper"
                    ref={openMenuId === row.id ? menuRef : null}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="lib-menu-btn"
                      type="button"
                      aria-label="More actions"
                      onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="5"  r="2" fill="currentColor"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                        <circle cx="12" cy="19" r="2" fill="currentColor"/>
                      </svg>
                    </button>

                    {openMenuId === row.id && (
                      <div className="lib-dropdown">
                        <button className="lib-dropdown-item" type="button" onClick={() => openEdit(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Edit
                        </button>
                        <button className="lib-dropdown-item lib-dropdown-item--delete" type="button" onClick={() => openDelete(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <polyline points="3 6 5 6 21 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M19 6l-1 14H6L5 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11v6M14 11v6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M9 6V4h6v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#8c8a9e' }}>
                  No results found for &quot;{search}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="lib-pagination">
          <span className="lib-pagination-info">
            Showing <strong>{filtered.length}</strong> of 12 semesters
          </span>
          <div className="lib-pagination-controls">
            <button className="lib-page-btn" type="button" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Previous
            </button>
            {[1, 2].map(p => (
              <button key={p} className={`lib-page-num${page === p ? ' active' : ''}`} type="button" onClick={() => setPage(p)}>
                {p}
              </button>
            ))}
            <button className="lib-page-btn" type="button" onClick={() => setPage(p => Math.min(2, p + 1))}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editSemester && (
        <div className="lib-modal-overlay" onClick={() => setEditSemester(null)}>
          <div className="lib-modal-card lib-modal-edit" onClick={e => e.stopPropagation()}>
            <h2 className="lib-modal-title">Edit Semester</h2>
            <p className="lib-modal-subtitle">Modify temporal boundaries and availability settings for the academic term.</p>

            <div className="lib-modal-divider" />

            <div className="lib-form-group">
              <label className="lib-form-label">Semester Name</label>
              <input
                className="lib-form-input"
                type="text"
                value={editSemester.name}
                onChange={e => setEditSemester(s => ({ ...s, name: e.target.value }))}
              />
            </div>

            <div className="lib-form-row">
              <div className="lib-form-group">
                <label className="lib-form-label">Start Date</label>
                <div className="lib-form-date-wrapper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="lib-form-date-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#8c8a9e" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#8c8a9e" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="lib-form-input lib-form-input--date"
                    type="text"
                    value={editSemester.startDate}
                    onChange={e => setEditSemester(s => ({ ...s, startDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="lib-form-group">
                <label className="lib-form-label">End Date</label>
                <div className="lib-form-date-wrapper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="lib-form-date-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#8c8a9e" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#8c8a9e" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="lib-form-input lib-form-input--date"
                    type="text"
                    value={editSemester.endDate}
                    onChange={e => setEditSemester(s => ({ ...s, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="lib-form-group">
              <label className="lib-form-label">Description (Optional)</label>
              <textarea
                className="lib-form-textarea"
                rows={4}
                value={editSemester.description}
                onChange={e => setEditSemester(s => ({ ...s, description: e.target.value }))}
              />
            </div>

            <div className="lib-form-group">
              <label className="lib-form-label">Status</label>
              <div className="lib-form-radio-row">
                <label className="lib-radio-label">
                  <input
                    type="radio"
                    name="sem-status"
                    value="ACTIVE"
                    checked={editSemester.status === 'ACTIVE'}
                    onChange={() => setEditSemester(s => ({ ...s, status: 'ACTIVE' }))}
                    className="lib-radio-input"
                  />
                  Active
                </label>
                <label className="lib-radio-label">
                  <input
                    type="radio"
                    name="sem-status"
                    value="ARCHIVED"
                    checked={editSemester.status === 'ARCHIVED'}
                    onChange={() => setEditSemester(s => ({ ...s, status: 'ARCHIVED' }))}
                    className="lib-radio-input"
                  />
                  Archived
                </label>
              </div>
              <p className="lib-form-hint">Archiving a semester hides it from active registration views but preserves historical data.</p>
            </div>

            <div className="lib-modal-divider" />

            <div className="lib-modal-footer">
              <button className="lib-modal-cancel-btn" type="button" onClick={() => setEditSemester(null)}>Cancel</button>
              <button className="lib-modal-save-btn" type="button" onClick={() => setEditSemester(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteSemester && (
        <div className="lib-modal-overlay" onClick={() => setDeleteSemester(null)}>
          <div className="lib-modal-card lib-modal-delete" onClick={e => e.stopPropagation()}>
            <div className="lib-delete-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="1" fill="#ef4444"/>
              </svg>
            </div>
            <div className="lib-delete-content">
              <h2 className="lib-delete-title">Delete Semester?</h2>
              <p className="lib-delete-body">
                Are you sure you want to delete <strong>{deleteSemester.name}</strong>?
                This will permanently remove all associated course references and data. This action cannot be undone.
              </p>
            </div>

            <div className="lib-modal-divider" />

            <div className="lib-modal-footer">
              <button className="lib-modal-cancel-btn" type="button" onClick={() => setDeleteSemester(null)}>
                Keep Semester
              </button>
              <button className="lib-modal-delete-btn" type="button" onClick={() => setDeleteSemester(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete Semester
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {createModal && (
        <div className="lib-modal-overlay" onClick={() => setCreateModal(false)}>
          <div className="lib-modal-card lib-modal-edit" onClick={e => e.stopPropagation()}>
            <h2 className="lib-modal-title">Create Semester</h2>
            <p className="lib-modal-subtitle">Define temporal boundaries and availability settings for the new academic term.</p>

            <div className="lib-modal-divider" />

            <div className="lib-form-group">
              <label className="lib-form-label">Semester Name</label>
              <input
                className="lib-form-input"
                type="text"
                placeholder="e.g. Spring 2026"
                value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="lib-form-row">
              <div className="lib-form-group">
                <label className="lib-form-label">Start Date</label>
                <div className="lib-form-date-wrapper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="lib-form-date-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#8c8a9e" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#8c8a9e" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="lib-form-input lib-form-input--date"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={createForm.startDate}
                    onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="lib-form-group">
                <label className="lib-form-label">End Date</label>
                <div className="lib-form-date-wrapper">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="lib-form-date-icon">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#8c8a9e" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#8c8a9e" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    className="lib-form-input lib-form-input--date"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={createForm.endDate}
                    onChange={e => setCreateForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="lib-form-group">
              <label className="lib-form-label">Description (Optional)</label>
              <textarea
                className="lib-form-textarea"
                rows={4}
                placeholder="Describe the purpose or content of this semester..."
                value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="lib-form-group">
              <label className="lib-form-label">Status</label>
              <div className="lib-form-radio-row">
                <label className="lib-radio-label">
                  <input
                    type="radio"
                    name="create-status"
                    value="ACTIVE"
                    checked={createForm.status === 'ACTIVE'}
                    onChange={() => setCreateForm(f => ({ ...f, status: 'ACTIVE' }))}
                    className="lib-radio-input"
                  />
                  Active
                </label>
                <label className="lib-radio-label">
                  <input
                    type="radio"
                    name="create-status"
                    value="ARCHIVED"
                    checked={createForm.status === 'ARCHIVED'}
                    onChange={() => setCreateForm(f => ({ ...f, status: 'ARCHIVED' }))}
                    className="lib-radio-input"
                  />
                  Archived
                </label>
              </div>
              <p className="lib-form-hint">Archiving a semester hides it from active registration views but preserves historical data.</p>
            </div>

            <div className="lib-modal-divider" />

            <div className="lib-modal-footer">
              <button className="lib-modal-cancel-btn" type="button" onClick={() => setCreateModal(false)}>Cancel</button>
              <button className="lib-modal-save-btn" type="button" onClick={() => setCreateModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                Create Semester
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryManagementPage;
