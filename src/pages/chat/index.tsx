import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Loader2, History, Clock, Plus, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  session: ChatSession;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ session, deleting, onConfirm, onCancel }: DeleteModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="font-heading text-lg font-bold text-navy text-center mb-1">
          Delete Conversation?
        </h3>
        <p className="font-body text-sm text-lightnavy text-center leading-relaxed mb-6">
          <span className="font-semibold text-navy">
            {session.title || `Conversation ${session.id}`}
          </span>{' '}
          will be permanently removed and cannot be recovered.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-navy rounded-2xl py-2.5 font-body text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white rounded-2xl py-2.5 font-body text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseSessionHistory(data: any): Message[] {
  if (!data) return [];
  if (Array.isArray(data)) return parseArrayOfMessagesOrQAs(data);
  if (typeof data === 'object') {
    const arrayKeys = ['messages', 'history', 'chat_history', 'sessions', 'data'];
    for (const key of arrayKeys) {
      if (Array.isArray(data[key])) return parseArrayOfMessagesOrQAs(data[key]);
    }
    if ('question' in data || 'answer' in data) return parseArrayOfMessagesOrQAs([data]);
  }
  return [];
}

function parseArrayOfMessagesOrQAs(arr: any[]): Message[] {
  const parsed: Message[] = [];
  arr.forEach((item, index) => {
    if (!item) return;
    if ('question' in item || 'answer' in item) {
      if (item.question) {
        parsed.push({
          id: `q-${index}-${Date.now()}`,
          role: 'user',
          content: item.question,
          timestamp: item.created_at ? new Date(item.created_at) : new Date(),
        });
      }
      if (item.answer) {
        parsed.push({
          id: `a-${index}-${Date.now()}`,
          role: 'assistant',
          content: item.answer,
          timestamp: item.created_at ? new Date(item.created_at) : new Date(),
        });
      }
    } else {
      const content = item.content || item.message || item.text || '';
      const role = item.role === 'user' ? 'user' : 'assistant';
      parsed.push({
        id: item.id?.toString() || `msg-${index}-${Date.now()}`,
        role,
        content,
        timestamp: item.timestamp
          ? new Date(item.timestamp)
          : item.created_at
            ? new Date(item.created_at)
            : new Date(),
      });
    }
  });
  return parsed;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('hydroscope_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    return [];
  });

  const [sessionId, setSessionId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('hydroscope_chat_session_id');
    return saved ? Number(saved) : null;
  });

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [confirmSession, setConfirmSession] = useState<ChatSession | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isChatLoading]);

  useEffect(() => {
    sessionStorage.setItem('hydroscope_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (sessionId !== null) {
      sessionStorage.setItem('hydroscope_chat_session_id', sessionId.toString());
    } else {
      sessionStorage.removeItem('hydroscope_chat_session_id');
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const response = await api.get('/chat/sessions');
      const fetchedSessions = response.data?.sessions || [];
      setSessions(fetchedSessions);
      if (sessionId !== null && sessionId !== 0) {
        const exists = fetchedSessions.some((s: ChatSession) => s.id === sessionId);
        if (!exists) {
          setSessionId(null);
          resetMessagesToDefault();
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load chat history list');
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const loadSessionMessages = async (id: number) => {
    setIsChatLoading(true);
    try {
      const response = await api.get(`/chat/sessions/${id}`);
      const parsed = parseSessionHistory(response.data);
      if (parsed.length > 0) {
        setMessages(parsed);
      } else {
        resetMessagesToDefault();
      }
    } catch (error) {
      console.error(`Failed to load messages for session ${id}:`, error);
      toast.error('Failed to load chat history details');
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (sessionId !== null && sessionId !== 0) {
      loadSessionMessages(sessionId);
    } else {
      const saved = sessionStorage.getItem('hydroscope_chat_history');
      if (!saved) resetMessagesToDefault();
    }
  }, [sessionId]);

  const resetMessagesToDefault = () => setMessages([]);

  const handleSelectSession = (id: number) => {
    setSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleNewChat = async () => {
    try {
      await api.post('/chat/reset');
    } catch (error) {
      console.error('Failed to reset session on server:', error);
    }
    setSessionId(null);
    resetMessagesToDefault();
    sessionStorage.removeItem('hydroscope_chat_history');
    sessionStorage.removeItem('hydroscope_chat_session_id');
    toast.success('Started a new conversation');
  };

  const handleDeleteClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setConfirmSession(session);
  };

  const handleConfirmDelete = async () => {
    if (!confirmSession) return;
    setDeletingId(confirmSession.id);
    try {
      await api.delete(`/chat/sessions/${confirmSession.id}`);
      toast.success('Conversation deleted');
      if (sessionId === confirmSession.id) {
        setSessionId(null);
        resetMessagesToDefault();
        sessionStorage.removeItem('hydroscope_chat_history');
        sessionStorage.removeItem('hydroscope_chat_session_id');
      }
      setConfirmSession(null);
      fetchSessions();
    } catch (error) {
      console.error(`Failed to delete session ${confirmSession.id}:`, error);
      toast.error('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const currentInput = input;
    if (!currentInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        question: currentInput,
        session_id: sessionId || 0,
      });

      const data = response.data;
      const returnedSessionId = data?.session_id;

      console.log('AI response:', data);

      let aiResponseText = '';
      if (typeof data === 'string') aiResponseText = data;
      else if (data?.answer) aiResponseText = data.answer;
      else if (data?.response) aiResponseText = data.response;
      else if (data?.message) aiResponseText = data.message;
      else aiResponseText = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      if (returnedSessionId && returnedSessionId !== sessionId) {
        setSessionId(returnedSessionId);
        fetchSessions();
      }
    } catch (error: any) {
      console.error('Error fetching chat response:', error);
      toast.error(error.response?.data?.detail || 'Failed to connect to the AI model.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSessionDate = (iso?: string) => {
    if (!iso) return '';
    const utc = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
    return new Date(utc).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div className="flex h-dvh bg-slate-50 overflow-hidden font-body">

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmSession && (
          <DeleteModal
            session={confirmSession}
            deleting={deletingId === confirmSession.id}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmSession(null)}
          />
        )}
      </AnimatePresence>

      {/* ── History Sidebar ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 z-30 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ x: '-100%', width: 0 }}
              animate={{ x: 0, width: 280 }}
              exit={{ x: '-100%', width: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed left-0 top-0 h-full bg-[#0B1B2D] border-r border-[#1B2F44] shadow-2xl md:shadow-none flex flex-col z-40 md:z-10 md:relative shrink-0 overflow-hidden text-slate-200"
            >
              <div className="p-4 border-b border-[#1B2F44] flex items-center justify-between shrink-0">
                <h2 className="font-heading text-lg text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-white" />
                  Hydroscope AI
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-[#1E334A] rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                <button
                  onClick={handleNewChat}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-[#2E4660] hover:bg-[#1E334A] text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer text-sm shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  New Conversation
                </button>

                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-track-[#0B1B2D] scrollbar-thumb-[#2E4660] hover:scrollbar-thumb-[#3a5a7a]">                  {isSessionsLoading ? (
                  <div className="flex flex-col gap-3 py-2 animate-pulse">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="h-14 bg-[#142639] border border-transparent rounded-xl" />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">
                    No saved chats found.<br />Start a new conversation!
                  </div>
                ) : (
                  sessions.map(session => {
                    const isActive = sessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        className={`group relative w-full rounded-xl transition-all border text-sm flex items-center justify-between overflow-hidden ${isActive
                            ? 'bg-[#1B2F44] border-transparent text-white font-bold shadow-xs'
                            : 'bg-transparent hover:bg-[#15273A] text-slate-300 border-transparent hover:text-white'
                          }`}
                      >
                        <button
                          onClick={() => handleSelectSession(session.id)}
                          className="flex-1 text-left p-3 cursor-pointer select-none overflow-hidden"
                        >
                          <span className="truncate pr-4 font-medium block">
                            {session.title || `Conversation ${session.id}`}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal mt-0.5">
                            <Clock className="w-3 h-3 shrink-0 text-slate-500" />
                            {formatSessionDate(session.created_at)}
                          </span>
                        </button>

                        <button
                          onClick={e => handleDeleteClick(e, session)}
                          className="mr-2 p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-0 active:opacity-100 cursor-pointer"
                          title="Delete Conversation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Workspace ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-full transition-all duration-200 cursor-pointer text-slate-600 hover:bg-slate-100 hover:text-navy"
                title="Show Chat History"
              >
                <History className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-navy" title="Back to Previous Page">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 ml-1">
              <h1 className="font-heading text-lg text-navy leading-none truncate max-w-xs">
                {sessionId
                  ? sessions.find(s => s.id === sessionId)?.title || `Conversation ${sessionId}`
                  : 'New Conversation'}
              </h1>
            </div>
          </div>
        </header>

        {isChatLoading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-navy animate-spin" />
              <span className="text-sm text-slate-500 font-semibold">Loading messages...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">

              {messages.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-center text-center py-20 px-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center shadow-lg mb-5">
                    <Bot className="w-9 h-9 text-white" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-navy mb-2">Ready to help!</h2>
                  <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                    Ask me anything about waterborne bacteria, infections or treatment.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['What is Salmonella?', 'Explain Gram staining', 'How to treat E. coli?'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="text-xs px-3.5 py-1.5 rounded-full border border-navy/15 text-navy/70 hover:bg-navy/5 hover:text-navy hover:border-navy/30 transition-all cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-bluenavy' : 'bg-navy'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                    </div>

                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs relative ${msg.role === 'user'
                        ? 'bg-white border border-gray-100 text-slate-800 rounded-br-sm'
                        : 'bg-navy text-white rounded-bl-sm'
                      }`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">{msg.content}</p>
                      <span className={`text-[10px] mt-2 block flex justify-end ${msg.role === 'user' ? 'text-slate-400' : 'text-blue-200'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-navy rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10 shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message to Hydroscope AI..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-5 pr-12 py-3 text-base focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all shadow-inner"
              disabled={isLoading || isChatLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isChatLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bluenavy transition-colors shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-0.5 mt-0.5" />}
            </button>
          </form>
          <div className="text-center mt-2 text-xs text-slate-400">
            The AI has a memory of up to 10 messages, older context may be forgotten.
          </div>
        </div>
      </div>
    </div>
  );
}