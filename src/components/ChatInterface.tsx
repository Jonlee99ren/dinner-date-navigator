import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenRouterService } from '@/services/openrouter';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  onRestaurantSuggestions?: (preferences: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onRestaurantSuggestions }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI dining assistant. I can help you find the perfect restaurant for any occasion. Just tell me what you're looking for - cuisine type, location, budget, atmosphere, or any specific preferences you have in mind! 🍽️",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [openRouterService] = useState(new OpenRouterService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await openRouterService.generateDinnerResponse(userMessage.content);
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isLoading);
        return [...newMessages, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        }];
      });

      // Check if we should extract preferences and show restaurant suggestions
      const conversationHistory = [...messages, userMessage].map(msg => msg.content);
      if (shouldShowSuggestions(userMessage.content, response)) {
        setTimeout(async () => {
          try {
            const preferences = await openRouterService.extractPreferences(conversationHistory);
            onRestaurantSuggestions?.(preferences);
          } catch (error) {
            console.error('Error extracting preferences:', error);
          }
        }, 2000);
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = prev.filter(msg => !msg.isLoading);
        return [...newMessages, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or let me know your dining preferences and I'll help you find the perfect restaurant!",
          timestamp: new Date()
        }];
      });
    }

    setIsTyping(false);
  };

  const shouldShowSuggestions = (userInput: string, aiResponse: string): boolean => {
    const indicators = [
      'perfect', 'great choice', 'sounds good', 'let me find', 'here are some',
      'based on your preferences', 'I recommend', 'suggest'
    ];
    
    const hasLocation = userInput.toLowerCase().includes('near') || 
                       userInput.toLowerCase().includes('in ') ||
                       userInput.toLowerCase().includes('location');
    
    const hasBudget = userInput.toLowerCase().includes('rm') || 
                     userInput.toLowerCase().includes('budget') ||
                     userInput.toLowerCase().includes('price');
    
    const hasIndicator = indicators.some(indicator => 
      aiResponse.toLowerCase().includes(indicator)
    );

    return (hasLocation || hasBudget) && hasIndicator;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const quickSuggestions = [
    "Find romantic restaurants near me",
    "Best pizza places under RM50",
    "Halal Japanese restaurants in KL",
    "Rooftop dining with city views"
  ];
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-xs lg:max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className={`px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Suggestions (only show initially) */}
          {messages.length === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">Try asking about:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(suggestion)}
                    className="p-3 text-left text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500 mb-1" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about restaurants, cuisine, location, budget..."
                rows={1}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto"
                style={{ minHeight: '48px' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI can make mistakes. Please verify restaurant information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
