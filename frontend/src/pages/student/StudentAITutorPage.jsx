import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import ChatSidebar from '../../components/student/chat/ChatSidebar';
import ChatInput from '../../components/student/chat/ChatInput';
import { deleteAiChatSession, getDefaultAiUserId, listAiChatSessions } from '../../services/aiChatService';
import { semesterApi } from '../../services/libraryApi';

function mapBackendSessionToThread(session) {
  const id = session?.sessionId ?? session?.session_id;
  const title = session?.sessionTitle ?? session?.session_title ?? 'New AI Chat';

  return {
    id,
    title,
    topic: 'Saved chat',
    updatedAt: session?.updatedAt || session?.updated_at || session?.createdAt || session?.created_at || ''
  };
}

function StudentAITutorPage() {
  const navigate = useNavigate();
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const [recentError, setRecentError] = useState('');
  const [libraryCourses, setLibraryCourses] = useState([]);
  const [libraryCoursesError, setLibraryCoursesError] = useState('');
  const refreshRecentThreads = useCallback(() => {
    listAiChatSessions(getDefaultAiUserId())
      .then(sessions => {
        setRecentError('');
        if (Array.isArray(sessions)) {
          setRecentThreads(sessions.map(mapBackendSessionToThread).filter(thread => thread.id));
        }
      })
      .catch(error => {
        setRecentError(error?.message || 'Cannot load recent chats from backend.');
        setRecentThreads([]);
      });
  }, []);

  useEffect(() => {
    refreshRecentThreads();
  }, [refreshRecentThreads]);

  useEffect(() => {
    semesterApi.getAll()
      .then(semesters => {
        const courses = Array.isArray(semesters)
          ? semesters.flatMap(semester => {
              const subjects = Array.isArray(semester.subjects) ? semester.subjects : [];
              return subjects.map(subject => ({
                id: subject.subjectId,
                subjectId: subject.subjectId,
                code: subject.subjectCode || subject.subjectName,
                name: subject.subjectName,
                semester: semester.semesterName,
              }));
            })
          : [];
        setLibraryCoursesError('');
        setLibraryCourses(courses);
      })
      .catch(error => {
        setLibraryCourses([]);
        setLibraryCoursesError(error?.message || 'Cannot load subjects from library.');
      });
  }, []);

  const handleDeleteThread = useCallback((thread) => {
    if (!thread?.id) return;
    const confirmed = window.confirm(`Delete chat history "${thread.title}"?`);
    if (!confirmed) return;

    deleteAiChatSession({ ...thread, userId: getDefaultAiUserId() })
      .then(() => refreshRecentThreads())
      .catch(error => {
        window.alert(error?.message || 'Could not delete this chat history.');
      });
  }, [refreshRecentThreads]);

  const actionCards = [
    {
      title: 'Summarize notes',
      description: 'Extract key points from uploaded PDF',
      tone: '#ede9fe',
      stroke: '#6d28d9',
      icon: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </>
      )
    },
    {
      title: 'Practice Exam',
      description: 'Create a 10-question Bio test',
      tone: '#f1ebff',
      stroke: '#7c3aed',
      icon: (
        <>
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </>
      )
    },
    {
      title: 'Explain concepts',
      description: 'Break down difficult theories simply',
      tone: '#f4eee6',
      stroke: '#8a6a3e',
      icon: (
        <>
          <path d="M12 2a7 7 0 0 0-4 12.75V17h8v-2.25A7 7 0 0 0 12 2z"></path>
          <path d="M9 21h6"></path>
          <path d="M10 17h4"></path>
        </>
      )
    }
  ];

  const handleSendMessage = (text) => {
    navigate('/student/ai-tutor/chat', {
      state: { initialMessage: text, selectedCourses }
    });
  };

  const handleAddCourse = (course) => {
    setSelectedCourses(prev => (
      prev.some(item => item.code === course.code) ? prev : [...prev, course]
    ));
  };

  const handleRemoveCourse = (courseCode) => {
    setSelectedCourses(prev => prev.filter(course => course.code !== courseCode));
  };

  return (
    <div className="ai-tutor-shell" style={{ display: 'flex', height: 'calc(100vh - 78px)', width: '100%', minWidth: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #ffffff 0%, #fbfaff 62%, #f7f4ff 100%)' }}>
      <ChatSidebar threads={recentThreads} recentError={recentError} onDeleteThread={handleDeleteThread} variant="newChat" showCourseFolders={false} />
      <div className="ai-tutor-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: '0 40px', overflow: 'hidden' }}>
        <main className="ai-tutor-hero" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '34px 0 28px' }}>
          
          <div style={{ 
            width: '58px', 
            height: '58px', 
            background: 'linear-gradient(135deg, #3526c4, #7c3aed)', 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white',
            marginBottom: '42px',
            boxShadow: '0 18px 30px rgba(76, 29, 149, 0.22)',
            transform: 'rotate(3deg)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.272L21 12l-5.813 1.912a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.813a2 2 0 0 0-1.272-1.272L3 12l5.813-1.912a2 2 0 0 0 1.272-1.272L12 3z"></path>
            </svg>
          </div>

          <h1 className="ai-tutor-title" style={{ fontSize: '2rem', lineHeight: 1.18, fontWeight: '850', color: '#111827', margin: '0 0 18px', textAlign: 'center', maxWidth: '760px', letterSpacing: '-0.01em' }}>
            Hello Alex, what subject would you like to <span style={{ color: '#3329b7', textDecoration: 'underline', textDecorationColor: '#3329b7', textDecorationThickness: '3px', textUnderlineOffset: '6px' }}>study today?</span>
          </h1>
          
          <p className="ai-tutor-subtitle" style={{ fontSize: '1rem', color: '#5f6678', textAlign: 'center', maxWidth: '620px', lineHeight: '1.6', margin: '0 0 62px' }}>
            I can help you summarize notes, solve complex equations, or practice for your upcoming midterms. Just ask!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px', width: '100%', maxWidth: '760px' }}>
            {actionCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className="ai-action-card"
                style={{ 
                  minHeight: '200px',
                  background: '#ffffff', 
                  border: '1px solid #ddddea', 
                  borderRadius: '24px', 
                  padding: '26px 22px 24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'flex-start',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 16px 34px rgba(31, 41, 55, 0.04)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  color: '#111827'
                }}
              >
                <span style={{ width: '46px', height: '46px', flex: '0 0 46px', borderRadius: '14px', background: card.tone, display: 'grid', placeItems: 'center', marginBottom: '20px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={card.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {card.icon}
                  </svg>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '24px', width: '100%', fontSize: '1rem', lineHeight: 1.2, fontWeight: 850, marginBottom: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {card.title}
                </span>
                <span style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '38px', maxWidth: '150px', fontSize: '0.82rem', lineHeight: 1.35, color: '#555b6d', fontWeight: 500 }}>
                  {card.description}
                </span>
              </button>
            ))}
          </div>

        </main>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          selectedCourses={selectedCourses}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
          libraryCourses={libraryCourses}
          libraryCoursesError={libraryCoursesError}
        />
      </div>
    </div>
  );
}

export default StudentAITutorPage;
