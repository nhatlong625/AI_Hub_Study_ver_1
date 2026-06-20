import React, { useRef, useEffect } from 'react';
import SourceReferenceCard from './SourceReferenceCard';
import fstudyAvatar from '../../../assets/chat/fstudy-chatbot-avatar.png';
import userAvatar from '../../../assets/logos/logo.png';

function renderMessageContent(content) {
  const parts = String(content).split(/```(\w+)?\n?([\s\S]*?)```/g);

  return parts.map((part, index) => {
    if (index % 3 === 0) {
      return part
        .split('\n')
        .filter(line => line.trim())
        .map((line, lineIndex) => (
          <p key={`${index}-${lineIndex}`} style={{ margin: lineIndex === 0 ? 0 : '8px 0 0' }}>
            {line}
          </p>
        ));
    }

    if (index % 3 === 1) {
      return null;
    }

    const language = parts[index - 1];

    return (
      <div key={index} style={{ margin: '12px 0 0' }}>
        {language && (
          <div style={{
            background: '#1e293b',
            color: '#cbd5e1',
            borderRadius: '8px 8px 0 0',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {language}
          </div>
        )}
        <pre
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          borderRadius: language ? '0 0 8px 8px' : '8px',
          padding: '14px',
          margin: 0,
          overflowX: 'auto',
          whiteSpace: 'pre',
          fontFamily: 'var(--chat-code-font-family)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}
      >
          <code>{part.trim()}</code>
      </pre>
      </div>
    );
  });
}

function ChatMessage({ message, isHighlighted, onSourceClick }) {
  const isUser = message.role === 'user';
  const messageRef = useRef(null);

  useEffect(() => {
    if (isHighlighted && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <div 
      ref={messageRef} 
      className={`chat-message ${isHighlighted ? 'chat-message-highlighted' : ''}`}
      style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexDirection: isUser ? 'row-reverse' : 'row' }}
    >
      <div style={{ flexShrink: 0 }}>
        {isUser ? (
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              marginTop: '-4px'
            }}
          >
            <img
              src={userAvatar}
              alt="User avatar"
              style={{ width: '70%', height: '70%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <img
            src={fstudyAvatar}
            alt="FSTUDY chatbot"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginTop: '-4px',
              background: '#ffffff',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.12)'
            }}
          />
        )}
      </div>
      
      <div style={{ flex: 1, maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ 
          background: isUser ? 'var(--primary-light, #e6f0ff)' : 'var(--surface)', 
          border: isUser ? 'none' : '1px solid var(--border)',
          padding: '16px', 
          borderRadius: '8px', 
          borderTopRightRadius: isUser ? 0 : '8px',
          borderTopLeftRadius: !isUser ? 0 : '8px',
          fontFamily: 'var(--chat-font-family)',
          fontSize: '1rem',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: '1.65',
          color: '#111827'
        }}>
          {renderMessageContent(message.content)}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {message.sources.map((src, idx) => (
              <SourceReferenceCard key={idx} source={src} onClick={onSourceClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;

