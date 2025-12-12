<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Qwen Chat Clone - AI Chat Application

A React-based chat application using Google's Gemini AI API, built with Vite and TypeScript.

View your app in AI Studio: https://ai.studio/apps/drive/1QrPjY7JY6mu34fCQbLUcoVmxH25OHVlR

## 🚀 Quick Deploy to Vercel

1. Fork this repository
2. Connect to Vercel
3. Add your `API_KEY` environment variable in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kamesh6592-cell/qwen.git)

## 💻 Run Locally

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/kamesh6592-cell/qwen.git
   cd qwen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Google Gemini API key:
   ```
   API_KEY=your_google_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 🔧 Environment Variables

- `API_KEY` or `VITE_API_KEY` - Your Google Gemini API key

## 📁 Project Structure

- `components/` - React components
- `services/` - API services (Gemini integration)
- `types.ts` - TypeScript type definitions
- `constants.ts` - Application constants
