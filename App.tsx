import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputArea } from './components/InputArea';
import { EmptyState } from './components/EmptyState';
import { ChatMessage } from './components/ChatMessage';
import { ArtifactPanel } from './components/ArtifactPanel';
import { Settings } from './components/Settings';
import { ChatSession, Message, GeminiModel, Theme } from './types';
import { INITIAL_SUGGESTIONS, MODELS } from './constants';
import { streamChatResponse } from './services/geminiService';
import { PanelLeft, ChevronDown, SquareSplitHorizontal } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string>(GeminiModel.FLASH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark as per design
  const [isDarkMode, setIsDarkMode] = useState(true); // Track effective mode for JS-based styles (like syntax highlighter)

  // Artifact/Preview State
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<{code: string, language: string} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with one empty session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isArtifactOpen, isLoading]);

  // Handle Theme Changes
  useEffect(() => {
    const calculateIsDark = () => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return theme === 'dark';
    };

    const updateTheme = () => {
      const isDark = calculateIsDark();
      setIsDarkMode(isDark);
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();
    
    // Listen for system changes if theme is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') updateTheme();
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsArtifactOpen(false);
    setActiveArtifact(null);
  };

  const getCurrentSession = () => sessions.find((s) => s.id === currentSessionId);

  const handleSendMessage = async (text: string, useSearch: boolean, useThinking: boolean) => {
    if (!currentSessionId) return;

    const session = getCurrentSession();
    if (!session) return;

    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    // Update state optimistically
    const updatedSessions = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? text.slice(0, 30) : s.title
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setIsLoading(true);

    // 2. Prepare AI Message Placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '', // Start empty
      timestamp: Date.now() + 1,
      isThinking: useThinking
    };
    
    // Insert empty AI message
     setSessions((prev) => prev.map((s) => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, aiMessage] };
      }
      return s;
    }));

    try {
      // 3. Stream Response
      let accumulatedText = "";
      
      // Prepare history for API
      const apiHistory = session.messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Call service
      await streamChatResponse(
        currentModel,
        apiHistory,
        text,
        useSearch,
        useThinking,
        (chunk) => {
          accumulatedText += chunk;
          setSessions((prev) => prev.map((s) => {
            if (s.id === currentSessionId) {
              const updatedMessages = s.messages.map((m) => {
                if (m.id === aiMessageId) {
                  return { ...m, text: accumulatedText };
                }
                return m;
              });
              return { ...s, messages: updatedMessages };
            }
            return s;
          }));
        }
      );
    } catch (error) {
       // Error handled in service
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (code: string, language: string) => {
    setActiveArtifact({ code, language });
    setIsArtifactOpen(true);
  };

  const currentSession = getCurrentSession();
  const isChatEmpty = !currentSession || currentSession.messages.length === 0;

  return (
    <div className="flex h-screen bg-white dark:bg-[#101011] overflow-hidden text-gray-900 dark:text-gray-200 font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#101011] transition-colors duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-[#101011]/90 backdrop-blur-sm z-10 border-b border-transparent">
          <div className="flex items-center gap-3">
             {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-1">
                <PanelLeft size={22} />
              </button>
            )}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-[17px] font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F22] px-3 py-1.5 rounded-lg transition-colors group">
                <span>{MODELS.find(m => m.id === currentModel)?.name || 'Qwen3-Max'}</span>
                <ChevronDown size={16} className="text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-300" strokeWidth={2.5} />
              </button>
               <button 
                  onClick={() => setIsArtifactOpen(!isArtifactOpen)}
                  className={`p-1.5 rounded-md transition-colors ${isArtifactOpen ? 'bg-[#5848BC] text-white' : 'text-[#5848BC] hover:bg-gray-100 dark:hover:bg-[#1F1F22]'}`}
                >
                 <SquareSplitHorizontal size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div>
             <button className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2">
                <MoreHorizontalIcon />
             </button>
          </div>
        </div>

        {/* Split View Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chat Column */}
          <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
              <div className={`mx-auto h-full flex flex-col transition-all duration-300 ${isArtifactOpen ? 'max-w-3xl' : 'max-w-[850px]'}`}>
                {isChatEmpty ? (
                  <EmptyState />
                ) : (
                  <div className="flex-1 py-4 pb-40">
                     {currentSession?.messages.map((msg, idx) => (
                       <ChatMessage 
                          key={msg.id} 
                          message={msg} 
                          isLast={idx === currentSession.messages.length - 1} 
                          isLoading={isLoading}
                          isDarkMode={isDarkMode}
                          onPreview={handlePreview}
                        />
                     ))}
                     <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area (Floats over Chat Column) */}
            <div className={`absolute bottom-0 left-0 right-0 ${isChatEmpty ? 'top-1/2 -translate-y-1/2' : ''} transition-all duration-300 pointer-events-none`}>
               <div className={`w-full h-full flex flex-col ${isChatEmpty ? 'justify-center' : 'justify-end'} pointer-events-auto bg-gradient-to-t from-white via-white via-60% dark:from-[#101011] dark:via-[#101011] dark:via-60% to-transparent pt-12`}>
                  <div className={`mx-auto w-full transition-all duration-300 ${isArtifactOpen ? 'max-w-3xl' : ''}`}>
                    <InputArea 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading}
                      suggestions={isChatEmpty ? INITIAL_SUGGESTIONS : undefined}
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Artifact Panel Column */}
          {isArtifactOpen && activeArtifact && (
            <ArtifactPanel 
              isOpen={isArtifactOpen}
              onClose={() => setIsArtifactOpen(false)}
              code={activeArtifact.code}
              language={activeArtifact.language}
            />
          )}

        </div>
      </div>
      
      {/* Settings Modal */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

const MoreHorizontalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12ZM13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default App;