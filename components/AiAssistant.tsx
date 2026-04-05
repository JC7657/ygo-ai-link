'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, XMarkIcon, TrashIcon, MinusIcon } from '@heroicons/react/24/outline';


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLookingUp?: boolean;
  cardLinks?: { name: string; id: number }[];
}

const STORAGE_KEY = 'ai-chat-history';

const SUGGESTED_QUESTIONS = [
  "What is a handtrap?",
  "Explain the Branded archetype",
  "What does Small World do?",
  "How does Nibiru work?",
  "What is an endboard?",
  "Tell me about Tenpai",
  "What is an engine in Yu-Gi-Oh?",
  "Explain Synchro Summoning",
  "What's the current meta?",
  "What are board breakers?",
  "Tell me about Kashtira",
  "How does Maxx C work?",
  "What is a floodgate?",
  "Explain the Purrely archetype",
  "What's the difference between going first and going second?",
];

function getRandomQuestions(count: number): string[] {
  const shuffled = [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupTarget, setLookupTarget] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  const preserveScrollRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const trackingScrollRef = useRef(true);
  const expandedMessagesVersionRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat history');
      }
    } else {
      setSuggestedQuestions(getRandomQuestions(4));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (preserveScrollRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = scrollPositionRef.current;
        }
        preserveScrollRef.current = false;
        trackingScrollRef.current = true;
      }, 50);
    } else if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, lookupTarget, isExpanded, isOpen, expandedMessagesVersionRef.current]);

  const clearChat = () => {
    setMessages([]);
    setExpandedMessages(new Set());
    setSuggestedQuestions(getRandomQuestions(4));
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendQuestion = (question: string) => {
    setInput(question);
    const form = document.getElementById('ai-chat-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const longMessageThreshold = 400;
  const isLongContent = (content: string) => content.length > longMessageThreshold;

  const toggleMessageExpand = (messageId: string) => {
    if (chatContainerRef.current) {
      scrollPositionRef.current = chatContainerRef.current.scrollTop;
    }
    trackingScrollRef.current = false;
    preserveScrollRef.current = true;
    expandedMessagesVersionRef.current += 1;
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };

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
          chatHistory: messages.filter(m => !m.isLookingUp).map(m => ({ role: m.role, content: m.content }))
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
    
    const escapedNames = cardLinks.map(card => ({
      id: card.id,
      name: card.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }));
    
    const pattern = new RegExp(`(${escapedNames.map(n => n.name).join('|')})`, 'gi');
    const parts = content.split(pattern);
    
    return parts.map((part, index) => {
      const matchedCard = cardLinks.find(c => c.name.toLowerCase() === part.toLowerCase());
      if (matchedCard) {
        return (
          <Link
            key={index}
            href={`/cards/${matchedCard.id}`}
            className="text-primary hover:text-highlight underline"
            target="_blank"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  const ChatWindow = () => (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
      onScroll={(e) => {
        if (trackingScrollRef.current) {
          scrollPositionRef.current = e.currentTarget.scrollTop;
        }
      }}
    >
      {messages.length === 0 && (
        <p className="text-gray-400 text-center text-sm">
          Hey! I&apos;m Dark Ignis, but you can call me Ai! Got a question about a specific card or strategy? I can help!
        </p>
      )}
      {messages.map((message) => (
        <div key={message.id} className="space-y-1">
          <div
            className={`${
              message.role === 'user' ? 'ml-auto bg-primary' : 'mr-auto bg-surface'
            } max-w-[85%] rounded-lg px-3 py-2 text-sm text-white ${
              message.role === 'assistant' && isLongContent(message.content) && !isExpanded && !expandedMessages.has(message.id)
                ? 'line-clamp-6'
                : ''
            }`}
          >
            {message.role === 'user' ? message.content : renderContent(message.content, message.cardLinks)}
          </div>
          {message.role === 'assistant' && isLongContent(message.content) && !isExpanded && (
            <button
              onClick={() => toggleMessageExpand(message.id)}
              className="text-xs text-highlight hover:text-highlight/80 ml-2"
            >
              {expandedMessages.has(message.id) ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="mr-auto bg-surface rounded-lg px-3 py-2 text-sm text-text-muted">
          Thinking...
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const baseWidth = isExpanded ? 'lg:w-[600px] w-full' : 'lg:w-80 w-full';
  const baseHeight = isExpanded ? 'lg:h-[700px] h-full' : 'lg:h-96 h-full';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 md:w-14 md:h-14 hover:scale-110 transition-transform z-40"
        aria-label="Open AI Assistant"
      >
        <Image
          src="/assets/aiygo.png"
          alt="Ai Assistant"
          fill
          className="rounded-full"
        />
      </button>

      <div
        className={`fixed inset-0 md:inset-auto md:bottom-24 md:right-6 ${baseWidth} ${baseHeight} bg-surface border border-border md:rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border rounded-t-xl bg-gradient-to-r from-pink-600 to-purple-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">"Ai" Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-text-primary hover:text-white"
                  title="Clear chat"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  if (chatContainerRef.current) {
                    scrollPositionRef.current = chatContainerRef.current.scrollTop;
                  }
                  trackingScrollRef.current = false;
                  preserveScrollRef.current = true;
                  setIsExpanded(!isExpanded);
                }}
                className="hidden md:block text-text-primary hover:text-white"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => { 
                  setIsOpen(false); 
                  setIsExpanded(false); 
                }}
                className="text-text-primary hover:text-white"
              >
                <MinusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ChatWindow />

          {isExpanded && suggestedQuestions.length > 0 && messages.length === 0 && (
            <div className="px-3 pb-2 border-t border-surface">
              <p className="text-xs text-text-muted mb-2">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendQuestion(q)}
                    className="text-xs px-3 py-1.5 bg-surface hover:bg-surface/80 text-text-primary hover:text-white rounded-full border border-border hover:border-highlight transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form id="ai-chat-form" onSubmit={handleSubmit} className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cards..."
                className="flex-1 px-3 py-2 bg-input-bg border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-primary hover:bg-primary-hover disabled:bg-surface/50 text-white rounded-lg text-sm transition-colors cursor-pointer"
              >
                Send
              </button>
            </div>
          </form>
        </div>
    </>
  );
}
