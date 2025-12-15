import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, ThumbsUp, ThumbsDown, RotateCw, MoreHorizontal, Sparkles, ChevronDown, Check, Play, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { CodeBlock } from '@/components/ui/code-block';
import { useToast } from './Toast';
import { QWEN_LOGO_URL, AI_AVATAR_URL } from '../constants';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  isLoading?: boolean;
  isDarkMode: boolean;
  onPreview?: (code: string, language: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast, isLoading, isDarkMode, onPreview }) => {
  const isUser = message.role === 'user';
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast } = useToast();

  // Check if message has HTML code blocks for preview detection
  const hasHtml = message.text.includes('```html');

  // Determine if actions should be shown: only for AI, and if it's the last message, only when NOT loading.
  const showActions = !isUser && (!isLast || !isLoading);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('Code copied to clipboard', 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAction = (action: string) => {
      switch(action) {
          case 'copy':
              navigator.clipboard.writeText(message.text);
              showToast('Message copied to clipboard', 'success');
              break;
          case 'good':
              showToast('Feedback submitted', 'success');
              break;
          case 'bad':
              showToast('Feedback submitted', 'success');
              break;
          case 'regenerate':
              showToast('Regeneration started...', 'info');
              break;
          case 'more':
              showToast('More options', 'info');
              break;
      }
  }

  return (
    <div className={`group flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        {!isUser && (
           <div className="w-8 h-8 rounded-full bg-transparent flex-shrink-0 flex items-center justify-center mt-0.5">
             <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                <img src={AI_AVATAR_URL} alt="AI Assistant" className="w-full h-full object-contain" />
             </div>
          </div>
        )}

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          {/* Sender Name */}
          <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200 mb-1.5 block">
             {isUser ? '' : 'Qwen3-Max'}
          </span>

          {/* Thinking Block */}
          {!isUser && message.isThinking && (
             <div className="w-full mb-4">
               <button 
                  onClick={() => !isLoading && setIsThinkingExpanded(!isThinkingExpanded)}
                  disabled={isLoading && isLast}
                  className={`w-full flex items-center justify-between bg-gray-50 dark:bg-[#1f1f23] border border-gray-200 dark:border-[#2e2e32] rounded-xl px-4 py-3 transition-all text-left group/thinking ${
                    isLoading && isLast 
                      ? 'cursor-default opacity-80' 
                      : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2e] cursor-pointer'
                  }`}
               >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md ${isLoading && isLast ? 'bg-[#e0e7ff]/50 dark:bg-[#2d2a4a]/50' : 'bg-[#e0e7ff] dark:bg-[#2d2a4a]'}`}>
                        {isLoading && isLast ? (
                           <Loader2 size={14} className="text-[#4f46e5] dark:text-[#818CF8] animate-spin" />
                        ) : (
                           <Sparkles size={14} className="text-[#4f46e5] dark:text-[#818CF8]" />
                        )}
                    </div>
                    <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
                        {isLoading && isLast ? 'Thinking...' : 'Thinking Process'}
                    </span>
                    {!isLoading && <span className="text-[13px] text-gray-500 dark:text-gray-500 font-normal hidden sm:inline">81,920 tokens budget</span>}
                  </div>
                  {(!isLoading || !isLast) && (
                    isThinkingExpanded ? (
                      <ChevronDown size={16} className="text-gray-500 group-hover/thinking:text-gray-700 dark:group-hover/thinking:text-gray-300" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500 group-hover/thinking:text-gray-700 dark:group-hover/thinking:text-gray-300 transform -rotate-90" />
                    )
                  )}
               </button>
               
               {isThinkingExpanded && (!isLoading || !isLast) && (
                 <div className="mt-3 pl-2 relative animate-in slide-in-from-top-2 duration-200">
                    <div className="absolute left-[21px] top-0 bottom-0 w-[2px] bg-gray-200 dark:bg-[#2e2e32]" />
                    <div className="ml-8 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-[#2e2e32] flex items-center justify-center">
                                <Check size={10} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                                I have analyzed the user's request and context.
                                <br/><br/>
                                <strong>Plan:</strong>
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                    <li>Identify the user's intent from the prompt.</li>
                                    <li>Check available tools (Search, Code, etc).</li>
                                    <li>Formulate a comprehensive and helpful response.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                 </div>
               )}
             </div>
          )}

          {/* Attachments / Images */}
          {message.attachments && message.attachments.length > 0 && (
             <div className={`grid gap-2 mb-3 ${message.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} ${isUser ? 'max-w-xs' : 'max-w-2xl'}`}>
                {message.attachments.map((att, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#2e2e32] shadow-sm">
                     <img src={att.data} alt="attachment" className="w-full h-auto object-cover" />
                  </div>
                ))}
             </div>
          )}

          {/* Message Content */}
          {message.text && (
            <div className={`relative text-[15px] leading-7 ${
              isUser 
                ? 'bg-[#f4f4f5] dark:bg-[#2F2F32] text-gray-800 dark:text-gray-100 px-5 py-3.5 rounded-[20px] rounded-tr-sm' 
                : 'text-gray-800 dark:text-gray-200 w-full'
            }`}>
              {isUser ? (
                message.text
              ) : (
                  <div className="prose dark:prose-invert max-w-none 
                    prose-p:text-[15px] prose-p:leading-7 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:my-3 
                    prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:mt-6 prose-headings:mb-3 
                    prose-ul:my-3 prose-ul:list-disc prose-ul:pl-4 
                    prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-4
                    prose-li:my-1 prose-li:text-gray-800 dark:prose-li:text-gray-200
                    prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-white
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-4 prose-blockquote:border-gray-200 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic
                    ">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const lang = match ? match[1] : '';
                          const codeString = String(children).replace(/\n$/, '');
                          const isHtml = lang === 'html';
                          
                          if (!inline && match) {
                            return (
                              <div className="rounded-xl overflow-hidden my-5 border border-gray-200 dark:border-[#2e2e32] bg-[#FAFAFA] dark:bg-[#0f0f11] shadow-sm">
                                <div className="flex items-center justify-between px-4 py-2 bg-[#F4F4F5] dark:bg-[#1a1a1d] border-b border-gray-200 dark:border-[#2e2e32]">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono lowercase">{lang}</span>
                                  <div className="flex items-center gap-3">
                                    {/* Removed internal preview button */}
                                    <button 
                                      onClick={() => handleCopy(codeString)}
                                      className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                      title="Copy code"
                                    >
                                      {copiedCode === codeString ? <Check size={14} /> : <Copy size={14} />}
                                      {copiedCode === codeString ? 'Copied' : 'Copy'}
                                    </button>
                                  </div>
                                </div>
                                <div className="p-0 overflow-x-auto text-[13px]">
                                  <CodeBlock language={lang} elementKey={`chat-code-${Math.random()}`}>
                                    {codeString}
                                  </CodeBlock>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code 
                              className={`font-mono text-[13px] bg-gray-100 dark:bg-[#2F2F32] text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-[#3F3F46]/50 ${className}`} 
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
              )}
            </div>
          )}

          {/* Action Buttons (Only for AI, after generation) */}
          {showActions && (
            <div className="flex flex-col gap-3 mt-2 w-full animate-in fade-in slide-in-from-top-1 duration-300">
               {/* Container for Preview + Icons */}
              <div className="flex items-center gap-4 w-full select-none">
                 
                 {/* Preview Button (Primary Action) - Only if HTML is present */}
                 {hasHtml && onPreview && (
                    <button 
                      onClick={() => {
                        const htmlMatch = message.text.match(/```html\s*([\s\S]*?)```/);
                        const htmlContent = htmlMatch ? htmlMatch[1] : '';
                        onPreview(htmlContent, 'html');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5848BC] hover:bg-[#4839A3] text-white rounded-full text-[13px] font-medium transition-colors shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                        <Play size={8} fill="currentColor" className="ml-0.5" />
                      </div>
                      Preview
                    </button>
                 )}

                 <div className="flex items-center gap-1">
                    <ActionButton icon={<Copy size={16} />} label="Copy" onClick={() => handleAction('copy')} />
                    <ActionButton icon={<ThumbsUp size={16} />} label="Good response" onClick={() => handleAction('good')} />
                    <ActionButton icon={<ThumbsDown size={16} />} label="Bad response" onClick={() => handleAction('bad')} />
                    <ActionButton icon={<RotateCw size={16} />} label="Regenerate" onClick={() => handleAction('regenerate')} />
                    <ActionButton icon={<MoreHorizontal size={16} />} label="More" onClick={() => handleAction('more')} />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
  <div className="relative group/btn">
    <button 
      onClick={onClick}
      className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272A] rounded-lg transition-all"
    >
      {icon}
    </button>
    {/* Tooltip positioned below the button */}
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-black text-white text-[11px] font-medium rounded-[6px] opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl border border-[#27272A] flex items-center justify-center">
      {label}
      {/* Tiny arrow pointing up */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-[#27272A] transform rotate-45"></div>
    </div>
  </div>
);