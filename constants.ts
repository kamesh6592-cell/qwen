
import { GeminiModel, ModelConfig } from './types';
import { 
  Image, 
  Code, 
  Search, 
  Video, 
  PenTool, 
  Box,
  Cpu
} from 'lucide-react';

export const MODELS: ModelConfig[] = [
  { id: GeminiModel.FLASH, name: 'Qwen3-Max', description: 'Great for complex tasks', isPro: true },
  { id: GeminiModel.PRO, name: 'Qwen3-Plus', description: 'Fast and versatile', isPro: false },
  { id: GeminiModel.IMAGE, name: 'Qwen-Visual', description: 'Generate & Edit Images', isPro: true },
];

export const INITIAL_SUGGESTIONS = [
  { icon: Image, label: 'Image Edit', prompt: 'Help me edit an image' },
  { icon: Code, label: 'Web Dev', prompt: 'Write a React component for a landing page' },
  { icon: PenTool, label: 'Image Generation', prompt: 'Generate an image of a futuristic city' },
  { icon: Video, label: 'Video Generation', prompt: 'Create a script for a short video' },
  { icon: Box, label: 'Artifacts', prompt: 'Help me create a code artifact' },
];

export const USER_NAME = "AJ COMPANY";
export const QWEN_LOGO_URL = "/images (1).png";
export const AI_AVATAR_URL = "/qwen-avatar.png";
export const COMBINED_LOGO_URL = "/images (2).png";
