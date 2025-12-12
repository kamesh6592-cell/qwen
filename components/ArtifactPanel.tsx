import React, { useState } from 'react';
import { X, Maximize2, BookOpen, Code, Eye } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ isOpen, onClose, code, language }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');

  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-white dark:bg-[#101011] flex flex-col animate-in slide-in-from-right duration-300 z-20">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-[#27272A] flex items-center justify-between px-4 md:px-5 bg-white dark:bg-[#101011] flex-shrink-0 relative">
        <div className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200">
          <BookOpen size={20} className="text-[#5848BC] dark:text-[#818CF8]" />
          <span className="font-semibold text-[15px]">Web Dev</span>
        </div>
        
        {/* Centered Toggle - styled like reference */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 dark:bg-[#18181B] border border-gray-200 dark:border-[#27272A] p-1 rounded-full flex gap-1">
             <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 md:px-4 py-1 rounded-full text-[13px] font-medium transition-all duration-200 ${
              activeTab === 'code' 
                ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-[#3F3F46]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 md:px-4 py-1 rounded-full text-[13px] font-medium transition-all duration-200 ${
              activeTab === 'preview' 
                ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-[#3F3F46]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden on small mobile to save space */}
          <button className="hidden sm:block p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-lg transition-colors">
            <Maximize2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden h-full relative bg-white dark:bg-[#101011]">
        {activeTab === 'preview' ? (
           <div className="w-full h-full bg-white">
              <iframe 
                srcDoc={code}
                className="w-full h-full border-none"
                title="Preview"
                sandbox="allow-scripts"
              />
           </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar bg-gray-50 dark:bg-[#09090b]">
             {/* Simple Code Header inside the view */}
             <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#18181B] border-b border-gray-200 dark:border-[#27272A] text-xs text-gray-500 font-mono">
                <span>index.html</span>
                <span>{language}</span>
             </div>
            <div className="p-4">
              <SyntaxHighlighter
                language={language || 'html'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '0',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
                showLineNumbers={true}
                lineNumberStyle={{ color: '#52525b', minWidth: '3em', paddingRight: '1em', textAlign: 'right' }}
                wrapLines={true}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};