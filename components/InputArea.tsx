import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  Globe, 
  Brain,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Video,
  Mic
} from 'lucide-react';
import { useToast } from './Toast';

interface InputAreaProps {
  onSendMessage: (text: string, useSearch: boolean, useThinking: boolean) => void;
  isLoading: boolean;
  suggestions?: { icon: any; label: string; prompt: string }[];
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, suggestions }) => {
  const [input, setInput] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isThinkingEnabled, setIsThinkingEnabled] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input, isSearchEnabled, isThinkingEnabled);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = (type: string) => {
      showToast(`${type} upload coming soon`, 'info');
      setIsPlusMenuOpen(false);
  };

  return (
    <div className="w-full max-w-[760px] mx-auto px-4 pb-4">
      
      {/* Main Input Container */}
      <div className={`relative bg-white dark:bg-[#2F2F32] rounded-[26px] transition-all duration-200 shadow-md dark:shadow-lg border border-gray-200 dark:border-transparent min-h-[128px] flex flex-col`}>
        
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help you today?"
          className="w-full flex-1 bg-transparent border-none outline-none resize-none px-5 pt-5 pb-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-[15px] leading-relaxed scrollbar-hide"
          style={{ minHeight: '60px' }}
        />

        {/* Toolbar */}
        <div className="px-3 pb-3 pt-2 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 relative">
            
             {/* Plus Button with Menu */}
             <div ref={menuRef} className="relative group">
                {isPlusMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-[#1f1f23] border border-gray-200 dark:border-[#2e2e32] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 py-1">
                      <MenuItem icon={FileText} label="Upload document" onClick={() => handleAttachmentClick('Document')} />
                      <MenuItem icon={ImageIcon} label="Upload Image" onClick={() => handleAttachmentClick('Image')} />
                      <MenuItem icon={Video} label="Upload Video" onClick={() => handleAttachmentClick('Video')} />
                      <MenuItem icon={Mic} label="Upload Audio" onClick={() => handleAttachmentClick('Audio')} />
                  </div>
                )}
                <button 
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className={`p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3E3E42] rounded-full transition-colors ${isPlusMenuOpen ? 'bg-gray-100 dark:bg-[#3E3E42] text-gray-700 dark:text-gray-200' : ''}`}
                >
                  <Plus size={20} strokeWidth={2} />
                </button>
                <Tooltip text="Add attachment" />
            </div>

            {/* Thinking Button (Pill style dropdown) */}
            <div className="relative group">
              <button 
                onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  isThinkingEnabled 
                    ? 'bg-[#2D2A57] text-[#818CF8]' 
                    : 'bg-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3E3E42]'
                }`}
              >
                <Brain size={16} className={isThinkingEnabled ? "text-[#818CF8]" : "text-gray-400 dark:text-gray-400"} />
                Thinking
                <ChevronDown size={14} className={`opacity-70 ${isThinkingEnabled ? 'text-[#818CF8]' : 'text-gray-400 dark:text-gray-500'}`} />
              </button>
              <Tooltip text="Thinking process" />
            </div>

            {/* Search Button (Pill style toggle) */}
            <div className="relative group">
              <button 
                onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  isSearchEnabled 
                    ? 'bg-blue-50 dark:bg-[#1E3A8A]/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3E3E42]'
                }`}
              >
                <Globe size={16} className={isSearchEnabled ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-400"} />
                Search
              </button>
              <Tooltip text="Search" />
            </div>
          </div>

          <div className="flex items-center relative group">
            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center ${
                input.trim() 
                  ? 'bg-[#5848BC] text-white shadow-md hover:bg-[#4d3eb0]' 
                  : 'bg-gray-200 dark:bg-[#3E3E42] text-gray-400 dark:text-gray-500'
              }`}
            >
              {input.trim() ? (
                <ArrowUp size={18} strokeWidth={3} />
              ) : (
                 <div className="w-full h-full flex items-center justify-center">
                   <div className="flex items-center gap-[2px]">
                     <div className="w-[2px] h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                     <div className="w-[2px] h-4 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                     <div className="w-[2px] h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                   </div>
                 </div>
              )}
            </button>
             {input.trim() && <Tooltip text="Send message" />}
          </div>
        </div>
      </div>

      {/* Suggestions Pills - Moved below input */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(s.prompt, false, false)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1f1f23] hover:bg-gray-50 dark:hover:bg-[#2a2a2e] border border-gray-200 dark:border-[#2e2e32] rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-300 transition-all shadow-sm group"
            >
              <s.icon size={16} className="text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
              {s.label}
            </button>
          ))}
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1f1f23] hover:bg-gray-50 dark:hover:bg-[#2a2a2e] border border-gray-200 dark:border-[#2e2e32] rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-300 transition-all shadow-sm">
             More
          </button>
        </div>
      )}
      
    </div>
  );
};

const MenuItem: React.FC<{ icon: any, label: string, onClick?: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2F2F32] transition-colors text-left"
  >
    <Icon size={18} className="text-gray-500 dark:text-gray-400" />
    {label}
  </button>
);

const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-black text-white text-[11px] font-medium rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl border border-[#27272A] flex items-center justify-center">
    {text}
    {/* Tiny arrow pointing up */}
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-[#27272A] transform rotate-45"></div>
  </div>
);
