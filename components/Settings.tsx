import React from 'react';
import { ArrowLeft, Monitor, Moon, Sun, Laptop, Shield, User, Info, MessageSquare, Layout } from 'lucide-react';
import { Theme } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  const tabs = [
    { id: 'general', icon: Monitor, label: 'General' },
    { id: 'interface', icon: Layout, label: 'Interface' },
    { id: 'models', icon:  MessageSquare, label: 'Models' },
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'personalization', icon: User, label: 'Personalization' },
    { id: 'account', icon: Shield, label: 'Account' },
    { id: 'about', icon: Info, label: 'About' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#101011] flex flex-col md:flex-row text-gray-900 dark:text-gray-200 font-sans">
      {/* Settings Sidebar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#27272A] flex flex-col bg-gray-50 dark:bg-[#18181B]">
        <div className="p-4 flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-[#27272A] rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                tab.id === 'general'
                  ? 'bg-white dark:bg-[#27272A] text-gray-900 dark:text-gray-200 shadow-sm dark:shadow-none'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#27272A]/50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#101011]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold mb-8">General</h1>

          {/* Theme Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
            </div>
            
            <div className="inline-flex bg-gray-100 dark:bg-[#1f1f23] p-1 rounded-full border border-gray-200 dark:border-[#2e2e32]">
              <button
                onClick={() => onThemeChange('system')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTheme === 'system'
                    ? 'bg-white dark:bg-[#2F2F32] text-gray-900 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Laptop size={16} />
                System
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTheme === 'light'
                    ? 'bg-white dark:bg-[#2F2F32] text-gray-900 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentTheme === 'dark'
                    ? 'bg-white dark:bg-[#2F2F32] text-gray-900 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>

           {/* Language Section (Mock) */}
           <div className="mb-8 border-t border-gray-100 dark:border-[#27272A] pt-8">
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
               </div>
               <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium">
                  English (US)
                  <ArrowLeft size={14} className="rotate-180" />
               </button>
            </div>
          </div>

           {/* Voice Section (Mock) */}
           <div className="mb-8 border-t border-gray-100 dark:border-[#27272A] pt-8">
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice</label>
               </div>
               <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium">
                  Katerina
                  <ArrowLeft size={14} className="rotate-180" />
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
