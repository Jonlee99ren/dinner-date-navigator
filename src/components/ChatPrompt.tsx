
import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OpenRouterService } from '@/services/openrouter';

interface ChatPromptProps {
  onContinue: (preferences: any) => void;
}

const ChatPrompt: React.FC<ChatPromptProps> = ({ onContinue }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      type: 'ai',
      text: "Hi! I'm your Smart Dinner Planner 🍽️ Tell me what you're looking for tonight. For example: 'I want a beachside restaurant with live music that serves alcohol, around RM100-150 budget, near me, for tonight at 7 PM'"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [openRouterService] = useState(new OpenRouterService());
  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { type: 'user', text: message };
    setConversation(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      // Get AI response from OpenRouter
      const aiResponseText = await openRouterService.generateDinnerResponse(currentMessage);
      
      const aiResponse = {
        type: 'ai',
        text: aiResponseText
      };
      
      setConversation(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Check if the response indicates we have enough information to proceed
      const hasEnoughInfo = currentMessage.toLowerCase().includes('budget') && 
                           (currentMessage.toLowerCase().includes('restaurant') || 
                            currentMessage.toLowerCase().includes('food') ||
                            currentMessage.toLowerCase().includes('dinner'));
      
      if (hasEnoughInfo || 
          aiResponseText.toLowerCase().includes('perfect') ||
          aiResponseText.toLowerCase().includes('great choice')) {
        // Extract preferences and continue to next screen
        setTimeout(async () => {
          const allMessages = [...conversation, userMessage].map(msg => msg.text);
          const preferences = await openRouterService.extractPreferences(allMessages);
          onContinue(preferences);
        }, 2000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = {
        type: 'ai',
        text: "I'm having trouble connecting right now. Please try again or let me know your dining preferences and I'll help you find the perfect restaurant!"
      };
      setConversation(prev => [...prev, errorResponse]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mobile-container bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Smart Dinner Planner</h1>
          <p className="text-sm text-slate-600 mt-1">Your AI dining assistant</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="space-y-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[280px] p-4 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white'
                    : 'bg-white text-slate-800 shadow-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 pt-0">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center p-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what you're looking for tonight..."
            className="flex-1 px-4 py-2 bg-transparent border-none outline-none resize-none text-sm text-slate-800 placeholder-slate-500"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white rounded-xl p-2 w-10 h-10 flex items-center justify-center shadow-md transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPrompt;
