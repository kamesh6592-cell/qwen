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
];

export const INITIAL_SUGGESTIONS = [
  { icon: Image, label: 'Image Edit', prompt: 'Help me edit an image' },
  { icon: Code, label: 'Web Dev', prompt: 'Write a React component for a landing page' },
  { icon: PenTool, label: 'Image Generation', prompt: 'Generate an image of a futuristic city' },
  { icon: Video, label: 'Video Generation', prompt: 'Create a script for a short video' },
  { icon: Box, label: 'Artifacts', prompt: 'Help me create a code artifact' },
];

export const USER_NAME = "AJ COMPANY";
export const QWEN_LOGO_URL = "https://z-cdn-media.chatglm.cn/files/77098327-769c-44a0-b80f-b380d7f15333.png?auth_key=1797051279-f6d2401d782d46aa9d506f9a810b12df-0-542088c7e194291282c363dec25c7468";