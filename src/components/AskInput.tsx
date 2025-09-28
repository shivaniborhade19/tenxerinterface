import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AskInputProps {
  onSubmit: (value: string) => Promise<string>;
  onApiKeySubmit?: (apiKey: string) => void;
  isGeminiInitialized?: boolean;
  className?: string;
  isSplitMode?: boolean;
}

export default function AskInput({ 
  onSubmit, 
  onApiKeySubmit, 
  isGeminiInitialized = false, 
  className,
  isSplitMode = false
}: AskInputProps) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!isGeminiInitialized);
  const [apiKey, setApiKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setShowApiKeyInput(!isGeminiInitialized);
  }, [isGeminiInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: value,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setValue("");
    setIsLoading(true);
    setShowChat(true);

    try {
      const response = await onSubmit(value);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim() && onApiKeySubmit) {
      onApiKeySubmit(apiKey);
      setApiKey("");
      setShowApiKeyInput(false);
    }
  };

  // API Key Input Form
  if (showApiKeyInput && onApiKeySubmit) {
    return (
      <div className="w-full">
        <form onSubmit={handleApiKeySubmit} className="bg-white rounded-lg border border-gray-300 p-4 shadow-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Gemini API Key to enable AI navigation:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
                className="flex-1 rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={!apiKey.trim()}>
                Connect
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Chat History */}
      {showChat && messages.length > 0 && (
        <div className={`absolute bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50 ${
          isSplitMode 
            ? 'left-0 w-96 min-w-96' // Fixed width extending beyond the container in split mode
            : 'left-0 right-0' // Normal responsive width
        }`}>
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">AI Chat</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowChat(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {message.text}
                  </div>
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask something or use navigation commands..."
            disabled={isLoading}
            className={`w-full rounded-lg px-4 py-3 pr-12 text-foreground 
                placeholder-gray-500 focus:outline-none focus:ring-2 
                focus:ring-blue-500 bg-gray-200 ${className}`}
          />
          <Button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            variant="ghost"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{showChat ? 'Hide' : 'Chat'}</span>
          </Button>
        )}
      </form>
    </div>
  );
}
