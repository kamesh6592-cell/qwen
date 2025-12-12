import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, MessageSquare, ChevronDown, PanelLeftClose, MoreHorizontal, Settings, Archive, LogOut } from 'lucide-react';
import { ChatSession } from '../types';
import { USER_NAME, QWEN_LOGO_URL } from '../constants';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
  onOpenSettings
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="w-[280px] h-screen bg-gray-50 dark:bg-[#18181B] flex flex-col border-r border-gray-200 dark:border-[#27272A] flex-shrink-0 font-sans transition-colors duration-200">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
           {/* Qwen Logo */}
           <div className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden">
             <img src={QWEN_LOGO_URL} alt="Qwen Logo" className="w-full h-full object-cover" />
           </div>
          <span className="text-[22px] font-bold text-gray-800 dark:text-gray-200 tracking-tight">Qwen</span>
        </div>
        <button onClick={onToggle} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-4 mb-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-[#e0e7ff] dark:bg-[#2D2A57] text-[#4f46e5] dark:text-[#818CF8] hover:bg-[#c7d2fe] dark:hover:bg-[#39356E] py-3 rounded-xl transition-colors font-semibold text-[14px]"
        >
          <Plus size={20} strokeWidth={2.5} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Chats"
            className="w-full pl-9 pr-3 py-2 bg-transparent hover:bg-gray-200 dark:hover:bg-[#27272A] focus:bg-gray-200 dark:focus:bg-[#27272A] border border-transparent focus:border-gray-300 dark:focus:border-[#3F3F46] rounded-lg text-sm outline-none transition-all placeholder-gray-500 text-gray-800 dark:text-gray-300"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          <span>All chats</span>
          <ChevronDown size={14} />
        </div>
        
        <div className="mb-6">
          <div className="px-3 py-2 text-[11px] font-bold text-gray-500 dark:text-gray-600 uppercase tracking-wide">Today</div>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 group transition-colors mb-0.5 ${
                currentSessionId === session.id
                  ? 'bg-gray-200 dark:bg-[#27272A] text-gray-900 dark:text-gray-200 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#27272A]/50 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <MessageSquare size={16} className={currentSessionId === session.id ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"} />
              <span className="truncate flex-1">
                {session.title || 'New Conversation'}
              </span>
              <MoreHorizontal size={14} className={`text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ${currentSessionId === session.id ? 'opacity-100' : ''}`} />
            </button>
          ))}
          {/* Mock previous session for visual fidelity */}
          <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 group text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#27272A]/50 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
              <MessageSquare size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="truncate flex-1">Quick Greeting Exchange</span>
          </button>
        </div>
      </div>

      {/* User Profile with Dropdown */}
      <div className="p-4 mt-auto border-t border-gray-200 dark:border-[#27272A] bg-gray-50 dark:bg-[#18181B] relative" ref={menuRef}>
        
        {isProfileMenuOpen && (
           <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-[#2e2e32] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 py-1.5">
               <button 
                onClick={() => {
                  onOpenSettings();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F32] transition-colors text-left font-medium"
               >
                 <Settings size={16} />
                 Settings
               </button>
               <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F32] transition-colors text-left font-medium">
                 <Archive size={16} />
                 Archived Chats
               </button>
               <div className="h-[1px] bg-gray-200 dark:bg-[#2e2e32] my-1 mx-2"></div>
               <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left font-medium">
                 <LogOut size={16} />
                 Log out
               </button>
           </div>
        )}

        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`w-full flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-[#27272A] rounded-lg transition-colors ${isProfileMenuOpen ? 'bg-gray-200 dark:bg-[#27272A]' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-[#5848BC] flex items-center justify-center text-white text-sm font-bold shadow-sm">
            A
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{USER_NAME}</div>
          </div>
        </button>
      </div>
    </div>
  );
};