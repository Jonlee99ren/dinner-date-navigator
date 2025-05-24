import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenRouterService } from '@/services/openrouter';
import ReactMarkdown from 'react-markdown';

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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onRestaurantSuggestions }) => {  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your **AI dining assistant**. I can help you find the perfect restaurant for any occasion. Just tell me what you're looking for:\n\n- **Cuisine type** (Italian, Japanese, etc.)\n- **Location** preference\n- **Budget** range\n- **Atmosphere** (romantic, casual, etc.)\n\nWhat sounds good to you? 🍽️",
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
      });      // Check if we should extract preferences and show restaurant suggestions
      const conversationHistory = [...messages, userMessage].map(msg => msg.content);
      const messageCount = conversationHistory.length;
      
      if (shouldShowSuggestions(userMessage.content, response) || 
          (messageCount >= 4 && hasBasicPreferences(conversationHistory))) {
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
  const hasBasicPreferences = (conversationHistory: string[]): boolean => {
    const conversation = conversationHistory.join(' ').toLowerCase();
    
    const hasCuisine = ['italian', 'chinese', 'japanese', 'korean', 'thai', 'indian', 
                       'western', 'local', 'halal', 'pizza', 'burger', 'seafood',
                       'vegetarian', 'mexican', 'french', 'sushi', 'pasta'].some(cuisine => 
                       conversation.includes(cuisine));
    
    const hasBudget = ['rm', 'budget', 'price', 'cheap', 'expensive', 'affordable',
                      'ringgit', '$', 'dollar'].some(budget => conversation.includes(budget));
    
    const hasLocation = ['near', 'location', 'area', 'place', 'kl', 'kuala lumpur',
                        'petaling jaya', 'selangor', 'malaysia'].some(loc => conversation.includes(loc));
    
    const hasAtmosphere = ['romantic', 'casual', 'fine dining', 'family', 'rooftop',
                          'cozy', 'elegant', 'atmosphere', 'ambiance'].some(atm => conversation.includes(atm));
    
    // Return true if at least one preference is mentioned
    return hasCuisine || hasBudget || hasLocation || hasAtmosphere;
  };

  const shouldShowSuggestions = (userInput: string, aiResponse: string): boolean => {
    // Check for various indicators that the AI is ready to provide suggestions
    const aiReadyIndicators = [
      'let me find', 'i can help you find', 'here are some', 'i recommend',
      'based on your preferences', 'perfect', 'great choice', 'sounds good',
      'i\'ll help you find', 'let me suggest', 'find restaurants', 'restaurant suggestions'
    ];
    
    // Check if user has provided key information
    const hasLocation = userInput.toLowerCase().includes('near') || 
                       userInput.toLowerCase().includes('in ') ||
                       userInput.toLowerCase().includes('location') ||
                       userInput.toLowerCase().includes('around');
    
    const hasBudget = userInput.toLowerCase().includes('rm') || 
                     userInput.toLowerCase().includes('budget') ||
                     userInput.toLowerCase().includes('price') ||
                     userInput.toLowerCase().includes('cheap') ||
                     userInput.toLowerCase().includes('expensive') ||
                     userInput.toLowerCase().includes('affordable');
    
    const hasCuisine = ['italian', 'chinese', 'japanese', 'korean', 'thai', 'indian', 
                       'western', 'local', 'halal', 'pizza', 'burger', 'seafood',
                       'vegetarian', 'mexican', 'french'].some(cuisine => 
                       userInput.toLowerCase().includes(cuisine));
    
    const hasAtmosphere = ['romantic', 'casual', 'fine dining', 'family', 
                          'rooftop', 'beachside', 'cozy', 'elegant'].some(atmosphere => 
                          userInput.toLowerCase().includes(atmosphere));
    
    // Check if AI response indicates readiness to suggest
    const aiIsReady = aiReadyIndicators.some(indicator => 
      aiResponse.toLowerCase().includes(indicator)
    );
    
    // Check if user has provided enough information (at least 2 key pieces)
    const infoCount = [hasLocation, hasBudget, hasCuisine, hasAtmosphere].filter(Boolean).length;
    
    // Show suggestions if:
    // 1. AI indicates it's ready AND user has provided some info, OR
    // 2. User has provided 2+ pieces of information
    return (aiIsReady && infoCount >= 1) || infoCount >= 2;
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
                }`}>                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>                  ) : message.type === 'assistant' ? (
                    <div className="text-sm leading-relaxed chat-markdown">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
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
            </div>          )}

          {/* Show Restaurant Suggestions Button (after a few messages) */}
          {messages.length > 3 && (
            <div className="flex justify-center py-4">
              <Button
                onClick={async () => {
                  const conversationHistory = messages.map(msg => msg.content);
                  try {
                    const preferences = await openRouterService.extractPreferences(conversationHistory);
                    onRestaurantSuggestions?.(preferences);
                  } catch (error) {
                    console.error('Error extracting preferences:', error);
                  }
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Show Restaurant Suggestions
              </Button>
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
