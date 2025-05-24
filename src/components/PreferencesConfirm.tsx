
import React from 'react';
import { ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreferencesConfirmProps {
  preferences: {
    location: string;
    time: string;
    budget: string;
    preferences: string[];
  };
  onConfirm: () => void;
  onBack: () => void;
}

const PreferencesConfirm: React.FC<PreferencesConfirmProps> = ({ preferences, onConfirm, onBack }) => {
  return (
    <div className="mobile-container bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={onBack}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-6 transition-colors duration-200"
          >
            <ArrowDown className="w-5 h-5 mr-2 rotate-90" />
            Back to chat
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-3">
              Let me confirm your preferences
            </h1>
            <p className="text-slate-600 text-sm">
              Here's what I understood from our conversation:
            </p>
          </div>
        </div>

        {/* AI Message */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-slate-800 text-sm leading-relaxed mb-4">
              Perfect! Based on our chat, here are your dining preferences for tonight:
            </p>
            
            {/* Preferences Summary */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">📍 Location</span>
                <span className="text-slate-800 font-medium text-sm">{preferences.location}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">🕐 Time</span>
                <span className="text-slate-800 font-medium text-sm">{preferences.time}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600 text-sm">💰 Budget</span>
                <span className="text-slate-800 font-medium text-sm">{preferences.budget}</span>
              </div>
              
              <div className="py-3">
                <span className="text-slate-600 text-sm block mb-3">✨ Preferences</span>
                <div className="flex flex-wrap gap-2">
                  {preferences.preferences.map((pref, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-ocean-50 to-ocean-100 text-ocean-700 text-xs font-medium rounded-full border border-ocean-200"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Question */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-slate-800 text-sm leading-relaxed text-center">
              Would you like me to find restaurants that match these preferences? 
              I'll show you places available for booking tonight at 7 PM! 🍽️
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={onConfirm}
            className="w-full py-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            <Check className="w-5 h-5 mr-2" />
            Yes, find restaurants for me!
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full py-4 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl font-medium transition-all duration-200"
          >
            Let me change something
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesConfirm;
