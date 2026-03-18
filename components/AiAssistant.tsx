'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLookingUp?: boolean;
  cardLinks?: { name: string; id: number }[];
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupTarget, setLookupTarget] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, lookupTarget]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const lookingFor = extractCardNames(input);
    if (lookingFor.length > 0) {
      setLookupTarget(lookingFor[0]);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          chatHistory: messages.filter(m => m.role !== 'looking-up').map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        cardLinks: data.cardLinks || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble responding right now. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setLookupTarget(null);
    }
  };

  function extractCardNames(text: string): string[] {
    const matches = text.match(/"([^"]+)"|'([^']+)'|([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g);
    if (!matches) return [];
    return matches.slice(0, 3).map(m => m.replace(/["']/g, ''));
  }

  const renderContent = (content: string, cardLinks?: { name: string; id: number }[]) => {
    if (!cardLinks || cardLinks.length === 0) {
      return content;
    }
    
    // Create a regex that matches any of the card names
    const escapedNames = cardLinks.map(card => ({
      id: card.id,
      name: card.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }));
    
    const pattern = new RegExp(`(${escapedNames.map(n => n.name).join('|')})`, 'gi');
    const parts = content.split(pattern);
    
    return parts.map((part, index) => {
      // Check if this part matches any card name (case-insensitive)
      const matchedCard = cardLinks.find(c => c.name.toLowerCase() === part.toLowerCase());
      if (matchedCard) {
        return (
          <Link
            key={index}
            href={`/cards/${matchedCard.id}`}
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 hover:scale-110 transition-transform z-40"
        aria-label="Open AI Assistant"
      >
        <Image
          src="/assets/aiygo.png"
          alt="Ai Assistant"
          fill
          className="rounded-full"
        />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 rounded-t-xl bg-gradient-to-r from-pink-600 to-purple-700">
            <div className="flex items-center gap-2">
              
              <span className="font-semibold text-white">"Ai" Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center text-sm">
                Hey! I&apos;m Dark Ignis, but you can call me Ignis! Got a question about a specific card or strategy? I can help!
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === 'user' ? 'ml-auto bg-blue-600' : 'mr-auto bg-gray-800'
                } max-w-[85%] rounded-lg px-3 py-2 text-sm text-white`}
              >
                {message.role === 'user' ? message.content : renderContent(message.content, message.cardLinks)}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400">
                {lookupTarget ? (
                  <span>Thinking...</span>
                ) : (
                  <span>Thinking...</span>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cards..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
