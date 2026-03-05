'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

const STORAGE_KEY = 'adevar-chat-history';
const MAX_STORED = 50;

const UI_TEXT = {
  ro: {
    title: 'Asistent AI',
    subtitle: 'adevar.ai',
    placeholder: 'Scrie un mesaj...',
    greeting: 'Bună! Sunt asistentul AI al platformei adevar.ai. Întreabă-mă orice despre economia, energia sau datele publice ale Republicii Moldova.',
    openLabel: 'Deschide asistentul AI',
    inputLabel: 'Scrie un mesaj',
    sendLabel: 'Trimite mesajul',
    errorMsg: 'A apărut o eroare. Încearcă din nou.',
    rateLimited: 'Prea multe cereri. Așteaptă un moment.',
  },
  en: {
    title: 'AI Assistant',
    subtitle: 'adevar.ai',
    placeholder: 'Type a message...',
    greeting: 'Hi! I\'m the AI assistant of adevar.ai. Ask me anything about Moldova\'s economy, energy, or public data.',
    openLabel: 'Open AI assistant',
    inputLabel: 'Type a message',
    sendLabel: 'Send message',
    errorMsg: 'An error occurred. Try again.',
    rateLimited: 'Too many requests. Please wait a moment.',
  },
  ru: {
    title: 'AI Ассистент',
    subtitle: 'adevar.ai',
    placeholder: 'Напишите сообщение...',
    greeting: 'Привет! Я AI-ассистент платформы adevar.ai. Спрашивайте меня о экономике, энергетике или публичных данных Республики Молдова.',
    openLabel: 'Открыть AI ассистент',
    inputLabel: 'Напишите сообщение',
    sendLabel: 'Отправить сообщение',
    errorMsg: 'Произошла ошибка. Попробуйте снова.',
    rateLimited: 'Слишком много запросов. Подождите немного.',
  },
};

function simpleMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#1e1e3a;padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
    .replace(/\n/g, '<br />');
}

export default function AiChat() {
  const { lang } = useLang();
  const t = UI_TEXT[lang] || UI_TEXT.ro;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
      } catch {}
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Escape key closes panel
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, lang }),
      });

      if (res.status === 429) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: t.rateLimited };
          return updated;
        });
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: t.errorMsg };
          return updated;
        });
        setIsLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: t.errorMsg };
                return updated;
              });
              break;
            }
            if (parsed.text) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + parsed.text };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: t.errorMsg };
        return updated;
      });
    }

    setIsLoading(false);
  }, [input, isLoading, messages, lang, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayMessages = messages.length > 0
    ? messages
    : [{ role: 'assistant', content: t.greeting }];

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={t.openLabel}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            right: '16px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#14B8A6',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(20,184,166,0.4)',
            zIndex: 1000,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t.title}
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
            right: '16px',
            width: 'min(400px, calc(100vw - 32px))',
            height: 'min(500px, calc(100dvh - 160px))',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#1a1a2e',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            zIndex: 1001,
            fontFamily: 'var(--font-onest, Onest, sans-serif)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#0f0f23',
            borderBottom: '1px solid #2d2d44',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{t.title}</div>
                <div style={{ color: '#a0a0b8', fontSize: '0.7rem' }}>{t.subtitle}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                color: '#a0a0b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#14B8A6' : '#2d2d44',
                    color: '#fff',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={
                    msg.role === 'assistant'
                      ? { __html: simpleMarkdown(msg.content) }
                      : undefined
                  }
                >
                  {msg.role === 'user' ? msg.content : undefined}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '14px 14px 14px 4px',
                  background: '#2d2d44',
                  color: '#a0a0b8',
                  fontSize: '0.85rem',
                  display: 'flex',
                  gap: '4px',
                }}>
                  <span className="ai-chat-dot" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="ai-chat-dot" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="ai-chat-dot" style={{ animationDelay: '300ms' }}>●</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #2d2d44',
            background: '#0f0f23',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              aria-label={t.inputLabel}
              disabled={isLoading}
              style={{
                flex: 1,
                background: '#2d2d44',
                border: '1px solid transparent',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#14B8A6')}
              onBlur={(e) => (e.target.style.borderColor = 'transparent')}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label={t.sendLabel}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: input.trim() && !isLoading ? '#14B8A6' : '#2d2d44',
                color: input.trim() && !isLoading ? '#fff' : '#666',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Dot animation keyframes */}
      <style>{`
        @keyframes aiChatPulse {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        .ai-chat-dot {
          animation: aiChatPulse 1.2s ease-in-out infinite;
          font-size: 0.6rem;
        }
      `}</style>
    </>
  );
}
