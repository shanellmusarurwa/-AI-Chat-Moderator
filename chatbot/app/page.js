"use client";

import ChatInterface from "./components/ChatInterface";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Gemini 2.0 Flash AI Chat
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the power of Google Gemini 2.0 Flash through OpenRouter
              with real-time content moderation.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Powered by OpenRouter • Gemini 2.0 Flash • Fast • Efficient</p>
            </div>
          </header>

          <ChatInterface />

          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>Built with Next.js + Tailwind CSS + OpenRouter API</p>
            <p className="mt-2">
              Using Gemini 2.0 Flash via OpenRouter for optimal performance
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
