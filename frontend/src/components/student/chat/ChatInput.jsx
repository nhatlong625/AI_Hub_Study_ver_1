import { useState } from 'react';

function ChatInput({ onSendMessage, selectedCourses = [], onAddCourse, onRemoveCourse, libraryCourses = [], libraryCoursesError = '' }) {
  const [text, setText] = useState('');
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const selectedCourseCodes = selectedCourses.map(course => course.code);
  const filteredCourses = libraryCourses.filter(course => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return true;

    return `${course.code} ${course.name} ${course.semester}`.toLowerCase().includes(query);
  });

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage?.(text);
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input" style={{ width: '100%', paddingBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {selectedCourses.length > 0 && (
        <div style={{ width: '100%', maxWidth: '840px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {selectedCourses.map(course => (
            <span
              key={course.code}
              className="chat-selected-course-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '999px',
                background: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #ddd6fe',
                padding: '7px 10px',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
            >
              {course.code}
              <button
                type="button"
                onClick={() => onRemoveCourse?.(course.code)}
                aria-label={`Remove ${course.code}`}
                className="chat-selected-course-remove"
                style={{ border: 0, background: 'transparent', color: '#6366f1', cursor: 'pointer', padding: 0, fontWeight: 900 }}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <style>{`
        .chat-course-picker-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          transition: all 0.2s ease;
          padding: 0;
        }
        .chat-course-picker-btn:hover,
        .chat-course-picker-btn.active {
          background-color: #f5f3ff;
          color: #4c1d95;
        }
      `}</style>
      <div style={{ 
        width: '100%', 
        maxWidth: '840px', 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '24px', 
        padding: '8px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}>
        {isCoursePickerOpen && (
          <div className="chat-course-picker" style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '58px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 18px 44px rgba(15, 23, 42, 0.14)',
            padding: '14px',
            zIndex: 20
          }}>
            <div className="chat-course-picker-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 850, color: '#111827' }}>Choose library subjects</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Selected subjects will be used as chat context.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoursePickerOpen(false)}
                className="chat-course-picker-close"
                style={{ border: 0, background: '#f1f5f9', borderRadius: '999px', color: '#475569', cursor: 'pointer', padding: '7px 10px', fontWeight: 800 }}
              >
                Close
              </button>
            </div>

            <input
              value={courseSearch}
              onChange={(event) => setCourseSearch(event.target.value)}
              placeholder="Search subject code or name..."
              style={{
                width: '100%',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                outline: 'none',
                padding: '10px 12px',
                fontFamily: 'var(--chat-font-family)',
                fontSize: '0.92rem',
                marginBottom: '10px'
              }}
            />

            <div className="chat-course-picker-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {libraryCoursesError && (
                <div style={{ gridColumn: '1 / -1', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700 }}>
                  {libraryCoursesError}
                </div>
              )}
              {!libraryCoursesError && filteredCourses.length === 0 && (
                <div style={{ gridColumn: '1 / -1', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', borderRadius: '12px', padding: '14px 12px', fontSize: '0.84rem', fontWeight: 700 }}>
                  No library subjects found.
                </div>
              )}
              {filteredCourses.map(course => {
                const isSelected = selectedCourseCodes.includes(course.code);

                return (
                  <button
                    type="button"
                    key={course.code}
                    onClick={() => {
                      onAddCourse?.(course);
                      setIsCoursePickerOpen(false);
                      setCourseSearch('');
                    }}
                    disabled={isSelected}
                    className="chat-course-picker-item"
                    style={{
                      textAlign: 'left',
                      border: `1px solid ${isSelected ? '#c4b5fd' : '#e2e8f0'}`,
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      borderRadius: '12px',
                      padding: '11px 12px',
                      cursor: isSelected ? 'default' : 'pointer',
                      color: '#111827',
                      fontFamily: 'var(--chat-font-family)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <strong style={{ color: '#4c1d95' }}>{course.code}</strong>
                      <span style={{ color: isSelected ? '#7c3aed' : '#94a3b8', fontSize: '0.74rem', fontWeight: 800 }}>
                        {isSelected ? 'Selected' : course.semester}
                      </span>
                    </div>
                    <div style={{ marginTop: '4px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {course.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCoursePickerOpen(prev => !prev)}
          aria-label="Choose subjects from library"
          className={`chat-course-picker-btn ${isCoursePickerOpen ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
        
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..."
          style={{ 
            flex: 1, 
            border: 'none', 
            background: 'transparent', 
            outline: 'none', 
            fontFamily: 'var(--chat-font-family)', 
            fontSize: '1rem', 
            color: '#1e293b',
            padding: '8px 0'
          }}
        />
        <button 
          onClick={handleSend} 
          style={{ 
            background: '#6d28d9', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer' 
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: '600', color: '#94a3b8', marginTop: '12px', letterSpacing: '0.5px' }}>
        AI TUTOR CAN MAKE MISTAKES. VERIFY IMPORTANT ACADEMIC INFORMATION.
      </div>
    </div>
  );
}

export default ChatInput;
