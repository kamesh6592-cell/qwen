import React, { useState, useEffect } from 'react';
import { X, Maximize2, BookOpen } from 'lucide-react';
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
    <div className="w-1/2 min-w-[400px] border-l border-gray-200 dark:border-[#27272A] bg-white dark:bg-[#101011] flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-xl z-20">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-[#27272A] flex items-center justify-between px-4 bg-white dark:bg-[#101011]">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
          <BookOpen size={18} className="text-gray-500 dark:text-gray-400" />
          <span>Web Dev</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-lg transition-colors">
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs / Content Area Wrapper */}
      <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#09090b]">
        {/* Floating Tabs */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-[#1F1F22] p-1 rounded-full border border-gray-200 dark:border-[#27272A] shadow-lg flex gap-1">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'code' 
                ? 'bg-gray-800 dark:bg-[#3F3F46] text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'preview' 
                ? 'bg-gray-800 dark:bg-[#3F3F46] text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden h-full pt-0">
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
            <div className="h-full overflow-auto custom-scrollbar pt-16 px-4 bg-[#1e1e1e]">
              <SyntaxHighlighter
                language={language || 'html'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
                showLineNumbers={true}
                lineNumberStyle={{ color: '#52525b', minWidth: '2.5em' }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
