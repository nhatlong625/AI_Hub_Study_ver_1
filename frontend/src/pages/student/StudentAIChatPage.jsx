import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatSidebar from '../../components/student/chat/ChatSidebar';
import ChatMessage from '../../components/student/chat/ChatMessage';
import ChatInput from '../../components/student/chat/ChatInput';
import Modal from '../../components/common/Modal';
import { askAiChat, deleteAiChatSession, getDefaultAiUserId, listAiChatMessages, listAiChatSessions } from '../../services/aiChatService';
import { semesterApi } from '../../services/libraryApi';

const sourcePreviewMock = {
  'COS SRS.pdf': {
    type: 'PDF',
    pages: 'SRS document',
    summary: 'Describes the functional and non-functional requirements for the Course Online System.',
    excerpt: 'The SRS defines what the system must provide, including user roles, core features, constraints, and acceptance criteria.',
    sections: [
      {
        heading: '1. Introduction',
        body: 'The Course Online System supports students, instructors, and administrators in managing online courses, learning materials, practice tests, and study progress.'
      },
      {
        heading: '2. Functional Requirements',
        body: 'The system shall allow students to browse available courses, enroll in eligible courses, view uploaded documents, and generate AI-supported study sessions.'
      },
      {
        heading: '3. Non-functional Requirements',
        body: 'The system should provide responsive page loading, role-based access control, secure file handling, and a consistent user interface across student and admin workflows.'
      }
    ]
  },
  'COS Business Rules.pdf': {
    type: 'PDF',
    pages: 'Business rules',
    summary: 'Lists the business constraints and policies that the Course Online System must follow.',
    excerpt: 'Business rules describe conditions such as enrollment limits, course access rules, payment validation, and user permission boundaries.',
    sections: [
      {
        heading: 'BR-01 Course Enrollment',
        body: 'A student can enroll in a course only when the course is active and the student account has permission to access that learning package.'
      },
      {
        heading: 'BR-02 Document Access',
        body: 'Students can view documents linked to their enrolled courses. Admin users can upload, replace, or archive course documents.'
      },
      {
        heading: 'BR-03 Practice Test Generation',
        body: 'Practice tests should be generated from approved materials only, and each generated question should remain traceable to its source document.'
      }
    ]
  },
  'COS Vision and Scope.pdf': {
    type: 'PDF',
    pages: 'Vision and scope',
    summary: 'Introduces the product vision, target users, goals, and project boundaries for the Course Online System.',
    excerpt: 'The vision and scope document explains why the system is needed, who it serves, and which features are included or excluded.',
    sections: [
      {
        heading: 'Product Vision',
        body: 'The Course Online System aims to help learners organize course content, interact with study materials, and receive AI-supported explanations in one workspace.'
      },
      {
        heading: 'Target Users',
        body: 'The primary users are students who need guided study support, instructors who manage course content, and administrators who monitor documents and platform activity.'
      },
      {
        heading: 'Project Scope',
        body: 'The initial scope includes course browsing, document viewing, AI chat support, practice test generation, and basic admin management features.'
      }
    ]
  },
  'Software_Requirements_3rd_Edition.pdf': {
    type: 'PDF',
    pages: 'Chapter 4, pages 92-105',
    summary: 'Explains requirement elicitation techniques, including interviews, workshops, questionnaires, and observation.',
    excerpt: 'Interviews help analysts discover stakeholder goals, clarify ambiguous requirements, and capture business rules before documenting the SRS.'
  },
  'SWR_Elicitation_Techniques.pdf': {
    type: 'PDF',
    pages: 'Section 2.1',
    summary: 'Compares common SWR elicitation methods and when each method should be used.',
    excerpt: 'Interview is useful when the analyst needs detailed context, examples, exceptions, and direct confirmation from stakeholders.'
  },
  'Stakeholder_Interview_Checklist.docx': {
    type: 'DOCX',
    pages: 'Checklist',
    summary: 'A practical checklist for preparing, conducting, and validating stakeholder interviews.',
    excerpt: 'Ask about current pain points, expected outcomes, user roles, exceptions, priorities, and acceptance criteria.'
  },
  'Requirements_Interview_Template.pdf': {
    type: 'PDF',
    pages: 'Template',
    summary: 'Template questions for eliciting functional and non-functional requirements.',
    excerpt: 'Start with open-ended questions, then narrow the conversation into specific workflows and measurable requirements.'
  },
  'SRS_Practical_Guide.docx': {
    type: 'DOCX',
    pages: 'Section 3',
    summary: 'Shows how interview notes can be converted into clear SRS requirement statements.',
    excerpt: 'Each confirmed stakeholder need should be rewritten as a testable, traceable requirement.'
  },
  'Linear_Algebra_Chapter_5.pdf': {
    type: 'PDF',
    pages: 'Chapter 5, pages 118-132',
    summary: 'Introduces eigenvectors, eigenvalues, and their relationship to matrix transformations.',
    excerpt: 'An eigenvector keeps its direction under a linear transformation, while the eigenvalue describes the scale factor applied to that direction.'
  },
  'Matrix_Transformations_Notes.pdf': {
    type: 'PDF',
    pages: 'Lecture notes, section 3',
    summary: 'Explains how matrices transform vectors through scaling, rotation, reflection, and shearing.',
    excerpt: 'Eigenvectors reveal the directions that remain stable under a transformation.'
  },
  'Linear_Algebra_Worked_Examples.pdf': {
    type: 'PDF',
    pages: 'Examples 4-6',
    summary: 'Worked examples for finding eigenvalues and eigenvectors from simple matrices.',
    excerpt: 'For a diagonal matrix, the standard basis vectors are eigenvectors and the diagonal entries are their eigenvalues.'
  },
  'mock-swr-course-overview.txt': {
    type: 'TXT',
    pages: 'Mock test document',
    summary: 'Overview of Software Requirements concepts for testing AI Chat retrieval.',
    excerpt: 'SWR covers stakeholders, functional requirements, non-functional requirements, SRS, business rules, and validation.'
  },
  'mock-requirements-interview-guide.txt': {
    type: 'TXT',
    pages: 'Mock test document',
    summary: 'Interview guide for requirements elicitation in SWR.',
    excerpt: 'Interview helps analysts collect stakeholder goals, constraints, exceptions, and acceptance criteria.'
  },
  'mock-srs-document-template.txt': {
    type: 'TXT',
    pages: 'Mock test document',
    summary: 'Template-style summary of documents commonly created in SWR.',
    excerpt: 'Common SWR documents include Vision and Scope, SRS, Business Rules, Use Cases, and Traceability Matrix.'
  },
  'mock-linear-algebra-eigenvectors.txt': {
    type: 'TXT',
    pages: 'Mock test document',
    summary: 'Linear Algebra notes for testing non-SWR retrieval.',
    excerpt: 'Eigenvectors keep direction under a transformation; eigenvalues describe the scale factor.'
  }
};

function getSourcePreview(source) {
  return sourcePreviewMock[source] || {
    type: source.split('.').pop()?.toUpperCase() || 'FILE',
    pages: 'Mock preview',
    summary: 'This is sample preview data for the selected citation.',
    excerpt: 'Preview content will be loaded from the real document once backend document parsing is connected.',
    sections: [
      {
        heading: 'Mock Document Content',
        body: 'This preview uses sample content. A real implementation can replace it with parsed PDF, DOCX, or document chunks returned from the backend.'
      }
    ]
  };
}

function createPendingAiMessage(id) {
  return {
    id,
    role: 'assistant',
    content: 'Sending your question to AI...',
    sources: [],
    isPending: true
  };
}

function createLoadingHistoryMessage(sessionId) {
  return {
    id: `loading-history-${sessionId}`,
    role: 'assistant',
    content: 'Loading saved chat history...',
    sources: [],
    isPending: true
  };
}

function createEmptyHistoryMessage(sessionId) {
  return {
    id: `empty-history-${sessionId}`,
    role: 'assistant',
    content: 'This chat exists in the backend, but it has no saved messages yet.',
    sources: [],
    isError: true
  };
}


function getBackendSessionId(response) {
  return response?.sessionId ?? response?.session_id ?? null;
}

function getBackendSources(response) {
  return (response?.sources || [])
    .map(source => source.documentName || source.document_name || source.title)
    .filter(Boolean);
}

function parseMessageSources(message) {
  const rawSources = message?.sources || message?.backendSources || message?.backend_sources;
  if (Array.isArray(rawSources)) {
    return rawSources;
  }

  const rawJson = message?.sourcesJson || message?.sources_json;
  if (!rawJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getMessageSourceNames(message) {
  return parseMessageSources(message)
    .map(source => typeof source === 'string'
      ? source
      : source.documentName || source.document_name || source.title)
    .filter(Boolean);
}

function createBackendAiMessage(id, response) {
  return {
    id,
    role: 'assistant',
    content: response?.answer || 'AI service did not return an answer.',
    sources: getBackendSources(response),
    backendSources: response?.sources || [],
    usedMockAi: response?.usedMockAi ?? response?.used_mock_ai ?? false
  };
}

function getSelectedSubjectId(courses = []) {
  const selected = courses.find(course => Number.isFinite(Number(course.subjectId)));
  return selected ? Number(selected.subjectId) : null;
}

function createErrorAiMessage(id, error) {
  const rawMessage = error?.message || '';
  const shouldHideRawMessage = rawMessage.includes('Python AI service request failed')
    || rawMessage.includes('422 Unprocessable Entity')
    || rawMessage.includes('"loc":["body"]');

  return {
    id,
    role: 'assistant',
    content: shouldHideRawMessage
      ? 'Cannot reach AI service right now. Please refresh the page and try again.'
      : `Cannot reach AI service right now.\n\n${rawMessage || 'Please make sure Spring Boot, Python AI service, and SQL Server are running.'}`,
    sources: [],
    isError: true
  };
}

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

function mapBackendMessageToMessage(message) {
  return {
    id: message?.messageId ?? message?.message_id ?? `${message?.session_id || 'session'}-${message?.created_at || Date.now()}`,
    role: message?.role || 'assistant',
    content: message?.content || '',
    sources: getMessageSourceNames(message),
    backendSources: parseMessageSources(message)
  };
}

function StudentAIChatPage() {
  const params = useParams();
  const chatId = params.chatId || params.threadId;
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = !chatId ? location.state?.initialMessage : null;
  const initialCourses = !chatId ? location.state?.selectedCourses || [] : [];
  const initialMessageIdRef = useRef(Date.now());
  const handledInitialMessageKeyRef = useRef(null);
  const localThreadMessagesRef = useRef(null);
  const historyLoadRequestIdRef = useRef(0);
  const chatRequestIdRef = useRef(0);
  const [messages, setMessages] = useState(() => {
    if (initialMessage) {
      return [{
        id: initialMessageIdRef.current,
        role: 'user',
        content: initialMessage
      }];
    }
    return [];
  });
  const [localThreads, setLocalThreads] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const numericChatId = Number(chatId);
    return Number.isFinite(numericChatId) && numericChatId > 0 ? numericChatId : null;
  });
  const [recentError, setRecentError] = useState('');
  const [libraryCourses, setLibraryCourses] = useState([]);
  const [libraryCoursesError, setLibraryCoursesError] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(initialCourses);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const refreshRecentThreads = useCallback(() => {
    listAiChatSessions(getDefaultAiUserId())
      .then(sessions => {
        setRecentError('');
        if (Array.isArray(sessions)) {
          setLocalThreads(sessions.map(mapBackendSessionToThread).filter(thread => thread.id));
        }
      })
      .catch(error => {
        setRecentError(error?.message || 'Cannot load recent chats from backend.');
      });
  }, []);

  const loadSessionMessages = useCallback((sessionId) => {
    const numericSessionId = Number(sessionId);
    if (!Number.isFinite(numericSessionId) || numericSessionId <= 0) return;

    const requestId = historyLoadRequestIdRef.current + 1;
    historyLoadRequestIdRef.current = requestId;

    window.scrollTo({ top: 0, left: 0 });
    setActiveSessionId(numericSessionId);
    setSelectedCourses([]);
    setHighlightedMessageId(null);
    setSelectedSource(null);
    setMessages([createLoadingHistoryMessage(numericSessionId)]);

    listAiChatMessages(numericSessionId, getDefaultAiUserId())
      .then(history => {
        if (historyLoadRequestIdRef.current !== requestId) return;

        const nextMessages = (Array.isArray(history) ? history : [])
          .map(mapBackendMessageToMessage)
          .filter(message => message.content.trim());

        setMessages(nextMessages.length > 0 ? nextMessages : [createEmptyHistoryMessage(numericSessionId)]);
        localThreadMessagesRef.current = nextMessages;
      })
      .catch(error => {
        if (historyLoadRequestIdRef.current !== requestId) return;

        setMessages([{
          id: `load-error-${numericSessionId}`,
          role: 'assistant',
          content: `Could not load this chat history from backend.\n\n${error?.message || 'Please try again.'}`,
          sources: [],
          isError: true
        }]);
      });
  }, []);

  const startInitialChat = useCallback((text, courses, messageKey) => {
    const cleanText = String(text || '').trim();
    if (!cleanText || handledInitialMessageKeyRef.current === messageKey) return;

    handledInitialMessageKeyRef.current = messageKey;
    historyLoadRequestIdRef.current += 1;
    const requestId = chatRequestIdRef.current + 1;
    chatRequestIdRef.current = requestId;

    const userMessageId = Date.now();
    const pendingResponseId = userMessageId + 1;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: cleanText
    };
    const pendingResponse = createPendingAiMessage(pendingResponseId);
    const nextMessages = [userMessage, pendingResponse];

    window.scrollTo({ top: 0, left: 0 });
    setActiveSessionId(null);
    setSelectedCourses(courses || []);
    setHighlightedMessageId(null);
    setSelectedSource(null);
    setMessages(nextMessages);
    localThreadMessagesRef.current = nextMessages;

    askAiChat({
      userId: getDefaultAiUserId(),
      sessionId: null,
      subjectId: getSelectedSubjectId(courses),
      message: cleanText,
      topK: 3
    })
      .then(response => {
        if (chatRequestIdRef.current !== requestId) return;

        const backendSessionId = getBackendSessionId(response);
        if (backendSessionId) setActiveSessionId(backendSessionId);
        refreshRecentThreads();
        const aiResponse = createBackendAiMessage(pendingResponseId, response);
        setMessages(prev => {
          const updatedMessages = prev.map(message => (
            message.id === pendingResponseId ? aiResponse : message
          ));
          localThreadMessagesRef.current = updatedMessages;
          return updatedMessages;
        });
      })
      .catch(error => {
        if (chatRequestIdRef.current !== requestId) return;

        const aiResponse = createErrorAiMessage(pendingResponseId, error);
        setMessages(prev => {
          const updatedMessages = prev.map(message => (
            message.id === pendingResponseId ? aiResponse : message
          ));
          localThreadMessagesRef.current = updatedMessages;
          return updatedMessages;
        });
      });
  }, [refreshRecentThreads]);

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
                semester: semester.semesterName
              }));
            })
          : [];
        setLibraryCourses(courses);
        setLibraryCoursesError('');
      })
      .catch(error => {
        setLibraryCourses([]);
        setLibraryCoursesError(error?.message || 'Cannot load subjects from library.');
      });
  }, []);

  useEffect(() => {
    if (!chatId && !initialMessage) {
      navigate('/student/ai-tutor', { replace: true });
    }
  }, [chatId, initialMessage, navigate]);

  useEffect(() => {
    const numericChatId = Number(chatId);
    const nextSessionId = Number.isFinite(numericChatId) && numericChatId > 0 ? numericChatId : null;

    if (nextSessionId) {
      loadSessionMessages(nextSessionId);
    } else if (initialMessage) {
      startInitialChat(initialMessage, initialCourses, `${location.key || 'initial'}:${initialMessage}`);
    } else {
      setActiveSessionId(null);
      setMessages([]);
    }
    setHighlightedMessageId(null);
  }, [chatId, initialMessage, loadSessionMessages, location.key, startInitialChat]);

  const citedSources = messages.reduce((acc, msg) => {
    if (msg.sources && msg.sources.length > 0) {
      msg.sources.forEach(src => {
        if (!acc.find(item => item.source === src)) {
          acc.push({ source: src, messageId: msg.id });
        }
      });
    }
    return acc;
  }, []);
  const swrCourseFiles = citedSources
    .map(item => item.source)
    .filter(source => source.startsWith('COS '));
  const courseFolder = swrCourseFiles.length > 0
    ? { name: 'SWR', files: swrCourseFiles }
    : null;

  const handleSourceClick = (sourceOrItem) => {
    const source = typeof sourceOrItem === 'string' ? sourceOrItem : sourceOrItem.source;
    const messageId = typeof sourceOrItem === 'string' ? null : sourceOrItem.messageId;

    setSelectedSource(source);

    if (!messageId) return;

    setHighlightedMessageId(messageId);
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3000);
  };

  const handleSendMessage = (text) => {
    const userMessageId = Date.now();
    const pendingResponseId = userMessageId + 1;
    const newMessage = {
      id: userMessageId,
      role: 'user',
      content: text
    };
    const pendingResponse = createPendingAiMessage(pendingResponseId);
    
    setMessages(prev => {
      const nextMessages = [...prev, newMessage, pendingResponse];
      localThreadMessagesRef.current = nextMessages;
      return nextMessages;
    });

    askAiChat({
      userId: getDefaultAiUserId(),
      sessionId: activeSessionId,
      subjectId: getSelectedSubjectId(selectedCourses),
      message: text,
      topK: 3
    })
      .then(response => {
        const backendSessionId = getBackendSessionId(response);
        if (backendSessionId) setActiveSessionId(backendSessionId);
        refreshRecentThreads();
        const aiResponse = createBackendAiMessage(pendingResponseId, response);
        setMessages(prev => {
          const nextMessages = prev.map(message => (
            message.id === pendingResponseId ? aiResponse : message
          ));
          localThreadMessagesRef.current = nextMessages;
          return nextMessages;
        });
      })
      .catch(error => {
        const aiResponse = createErrorAiMessage(pendingResponseId, error);
        setMessages(prev => {
          const nextMessages = prev.map(message => (
            message.id === pendingResponseId ? aiResponse : message
          ));
          localThreadMessagesRef.current = nextMessages;
          return nextMessages;
        });
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

  const handleNewChat = () => {
    window.scrollTo({ top: 0, left: 0 });
    localThreadMessagesRef.current = null;
    handledInitialMessageKeyRef.current = null;
    chatRequestIdRef.current += 1;
    historyLoadRequestIdRef.current += 1;
    setMessages([]);
    setActiveSessionId(null);
    setSelectedCourses([]);
    setHighlightedMessageId(null);
    setSelectedSource(null);
    refreshRecentThreads();
  };

  const handleThreadSelect = useCallback((thread) => {
    if (!thread?.id) return;
    loadSessionMessages(thread.id);
  }, [loadSessionMessages]);

  const handleDeleteThread = useCallback((thread) => {
    if (!thread?.id) return;
    const confirmed = window.confirm(`Delete chat history "${thread.title}"?`);
    if (!confirmed) return;

    deleteAiChatSession({ ...thread, userId: getDefaultAiUserId() })
      .then(() => {
        refreshRecentThreads();
        const deletedSessionId = Number(thread.id);
        const currentSessionId = Number(activeSessionId ?? chatId);
        if (Number.isFinite(deletedSessionId) && deletedSessionId === currentSessionId) {
          localThreadMessagesRef.current = null;
          setMessages([]);
          setActiveSessionId(null);
          setSelectedCourses([]);
          setHighlightedMessageId(null);
          setSelectedSource(null);
          navigate('/student/ai-tutor', { replace: true });
        }
      })
      .catch(error => {
        window.alert(error?.message || 'Could not delete this chat history.');
      });
  }, [activeSessionId, chatId, navigate, refreshRecentThreads]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 78px)', width: '100%', minWidth: 0, overflow: 'hidden', background: '#fafafa' }}>
      <ChatSidebar
        threads={localThreads}
        citedSources={citedSources}
        onSourceClick={handleSourceClick}
        onNewChat={handleNewChat}
        onThreadSelect={handleThreadSelect}
        onDeleteThread={handleDeleteThread}
        recentError={recentError}
        variant={courseFolder ? 'newChat' : 'sources'}
        showCourseFolders={Boolean(courseFolder)}
        courseFolder={courseFolder}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 40px', overflow: 'hidden' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isHighlighted={msg.id === highlightedMessageId}
                onSourceClick={handleSourceClick}
              />
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
      <Modal
        isOpen={Boolean(selectedSource)}
        title={selectedSource || 'Source preview'}
        onClose={() => setSelectedSource(null)}
        contentClassName="modal-content-wide"
      >
        {selectedSource && (
          <div className="source-preview-modal" style={{ display: 'grid', gap: '14px', color: '#1f2937', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Document Preview
                </div>
                <div style={{ marginTop: '4px', fontSize: '1.05rem', fontWeight: 850, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedSource}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ borderRadius: '999px', background: '#eef2ff', color: '#4338ca', padding: '6px 10px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {getSourcePreview(selectedSource).type}
                </span>
                <span style={{ borderRadius: '999px', background: '#f1f5f9', color: '#475569', padding: '6px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {getSourcePreview(selectedSource).pages}
                </span>
              </div>
            </div>

            <div className="source-preview-layout" style={{ display: 'grid', gridTemplateColumns: '230px minmax(0, 1fr)', gap: '18px', alignItems: 'start' }}>
              <aside style={{ display: 'grid', gap: '10px' }}>
                <div style={{ borderRadius: '10px', background: '#f8fafc', border: '1px solid #e5e7eb', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem' }}>Summary</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', lineHeight: 1.55 }}>
                    {getSourcePreview(selectedSource).summary}
                  </p>
                </div>
                <div style={{ borderRadius: '10px', background: '#faf7ff', border: '1px solid #e9d5ff', padding: '12px' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem' }}>Matched excerpt</h4>
                  <p style={{ margin: 0, color: '#4c1d95', fontSize: '0.8rem', lineHeight: 1.55 }}>
                    {getSourcePreview(selectedSource).excerpt}
                  </p>
                </div>
              </aside>

              <div className="source-preview-scroll" style={{ maxHeight: '62vh', overflowY: 'auto', background: '#f1f5f9', borderRadius: '12px', padding: '20px' }}>
                <article className="source-preview-page" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)', padding: '36px 42px', minHeight: '620px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '18px' }}>
                    Preview page 1
                  </div>
                  <h2 style={{ margin: '0 0 16px', color: '#111827', fontSize: '1.35rem', lineHeight: 1.25 }}>
                    {selectedSource.replace(/\.[^/.]+$/, '')}
                  </h2>
                  {(getSourcePreview(selectedSource).sections || [
                    {
                      heading: 'Preview',
                      body: getSourcePreview(selectedSource).excerpt || getSourcePreview(selectedSource).summary
                    }
                  ]).map((section) => (
                    <section key={section.heading} style={{ marginTop: '20px' }}>
                      <h3 style={{ margin: '0 0 8px', color: '#1f2937', fontSize: '1rem' }}>
                        {section.heading}
                      </h3>
                      <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.75 }}>
                        {section.body}
                      </p>
                    </section>
                  ))}
                </article>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentAIChatPage;

