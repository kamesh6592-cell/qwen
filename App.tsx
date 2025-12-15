import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputArea } from './components/InputArea';
import { EmptyState } from './components/EmptyState';
import { ChatMessage } from './components/ChatMessage';
import { ArtifactPanel } from './components/ArtifactPanel';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/toaster';
import { ChatSession, Message, GeminiModel, Theme, Attachment } from './types';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('dark');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Artifact/Preview State
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<{code: string, language: string} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile Detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Default closed on mobile
      } else {
        setIsSidebarOpen(true); // Default open on desktop
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') updateTheme();
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.model-dropdown-container');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

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
    if (isMobile) setIsSidebarOpen(false);
  };

  const getCurrentSession = () => sessions.find((s) => s.id === currentSessionId);

  const handleSessionSelect = (id: string) => {
    setCurrentSessionId(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, useSearch: boolean, useThinking: boolean, attachments: Attachment[] = []) => {
    if (!currentSessionId) return;

    const session = getCurrentSession();
    if (!session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const updatedSessions = sessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? (text.slice(0, 30) || 'New Conversation') : s.title
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now() + 1,
      isThinking: useThinking
    };
    
     setSessions((prev) => prev.map((s) => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, aiMessage] };
      }
      return s;
    }));

    try {
      let accumulatedText = "";
      
      const apiHistory = session.messages.map(m => {
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        if (m.attachments) {
           m.attachments.forEach(att => {
             const base64Data = att.data.split(',')[1];
             parts.push({
               inlineData: {
                 mimeType: att.mimeType,
                 data: base64Data
               }
             })
           });
        }
        return {
          role: m.role,
          parts: parts
        };
      });

      await streamChatResponse(
        currentModel,
        apiHistory,
        text,
        useSearch,
        useThinking,
        attachments,
        (update) => {
          if (update.text) {
             accumulatedText += update.text;
          }
          setSessions((prev) => prev.map((s) => {
            if (s.id === currentSessionId) {
              const updatedMessages = s.messages.map((m) => {
                if (m.id === aiMessageId) {
                  return { 
                    ...m, 
                    text: accumulatedText,
                    attachments: update.images ? [...(m.attachments || []), ...update.images] : m.attachments
                  };
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
    <div className="flex h-[100dvh] bg-white dark:bg-[#101011] overflow-hidden text-gray-900 dark:text-gray-200 font-sans transition-colors duration-200 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        flex-shrink-0 h-full bg-gray-50 dark:bg-[#18181B] border-r border-gray-200 dark:border-[#27272A] transition-all duration-300 ease-in-out z-50
        ${isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'relative'}
        ${isSidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-0 overflow-hidden border-none'}
      `}>
        <div className="w-[280px] h-full">
           <Sidebar 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSessionSelect}
            onNewChat={createNewSession}
            isOpen={true} 
            onToggle={() => setIsSidebarOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#101011] transition-colors duration-200 relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-white/90 dark:bg-[#101011]/90 backdrop-blur-sm z-10 border-b border-transparent sticky top-0">
          <div className="flex items-center gap-2 md:gap-3">
             {(!isSidebarOpen || isMobile) && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f22]">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative model-dropdown-container">
                <button 
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-2 text-[15px] md:text-[17px] font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F22] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span className="truncate max-w-[120px] md:max-w-none">{MODELS.find(m => m.id === currentModel)?.name || 'Qwen3-Max'}</span>
                  <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>
                {/* Model Dropdown */}
                 {isModelDropdownOpen && (
                 <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-[#2e2e32] rounded-xl shadow-xl overflow-hidden z-50">
                   {MODELS.map(model => (
                     <button
                       key={model.id}
                       onClick={() => {
                         setCurrentModel(model.id);
                         setIsModelDropdownOpen(false);
                       }}
                       className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2a2a2e] transition-colors flex flex-col ${currentModel === model.id ? 'bg-gray-50 dark:bg-[#2a2a2e]' : ''}`}
                     >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{model.name}</span>
                          {model.isPro && <span className="text-[10px] bg-[#5848BC] text-white px-1.5 py-0.5 rounded">PRO</span>}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{model.description}</span>
                     </button>
                   ))}
                 </div>
                 )}
              </div>

               {activeArtifact && (
                 <button 
                    onClick={() => setIsArtifactOpen(!isArtifactOpen)}
                    className={`p-2 rounded-md transition-colors ${isArtifactOpen ? 'bg-[#5848BC] text-white' : 'text-[#5848BC] hover:bg-gray-100 dark:hover:bg-[#1F1F22]'}`}
                    title="Toggle Web Preview"
                  >
                   <SquareSplitHorizontal size={20} strokeWidth={2} />
                </button>
               )}
            </div>
          </div>
          <div>
             <button className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f22]">
                <MoreHorizontalIcon />
             </button>
          </div>
        </div>

        {/* Split View Content */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Chat Column */}
          <div className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 ${isArtifactOpen && !isMobile ? 'mr-0' : ''}`}>
            <div className="flex-1 overflow-y-auto px-2 md:px-4 custom-scrollbar">
              <div className={`mx-auto h-full flex flex-col transition-all duration-300 ${isArtifactOpen && !isMobile ? 'max-w-3xl' : 'max-w-[850px]'}`}>
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
            <div className={`absolute bottom-0 left-0 right-0 z-20 ${isChatEmpty ? 'top-1/2 -translate-y-1/2 mt-8 md:mt-0' : ''} transition-all duration-300 pointer-events-none`}>
               <div className={`w-full h-full flex flex-col ${isChatEmpty ? 'justify-center' : 'justify-end'} pointer-events-auto bg-gradient-to-t from-white via-white via-70% dark:from-[#101011] dark:via-[#101011] dark:via-70% to-transparent pt-12 pb-2 md:pb-6`}>
                  <div className={`mx-auto w-full px-2 md:px-4 transition-all duration-300 ${isArtifactOpen && !isMobile ? 'max-w-3xl' : 'max-w-[850px]'}`}>
                    <InputArea 
                      onSendMessage={handleSendMessage} 
                      isLoading={isLoading}
                      suggestions={isChatEmpty ? INITIAL_SUGGESTIONS : undefined}
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Artifact Panel Column / Overlay */}
          <div className={`
             transition-all duration-300 ease-in-out bg-white dark:bg-[#101011] border-l border-gray-200 dark:border-[#27272A] shadow-xl z-30
             ${isMobile 
                ? 'fixed inset-0 w-full' 
                : 'relative h-full'}
             ${isArtifactOpen 
                ? (isMobile ? 'translate-y-0' : 'w-1/2 min-w-[450px] translate-x-0') 
                : (isMobile ? 'translate-y-full' : 'w-0 min-w-0 translate-x-full overflow-hidden border-none')}
          `}>
             {activeArtifact && (
               <div className="h-full w-full">
                  <ArtifactPanel 
                    isOpen={true} // Content always rendered in container
                    onClose={() => setIsArtifactOpen(false)}
                    code={activeArtifact.code}
                    language={activeArtifact.language}
                  />
               </div>
             )}
          </div>

        </div>
      </div>
      
      {/* Settings Modal */}
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      <Toaster />
    </div>
  );
};

const MoreHorizontalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H5.01M12 12H12.01M19 12H19.01M6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12ZM13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12ZM20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default App;