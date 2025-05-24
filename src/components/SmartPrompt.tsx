
import React, { useState } from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Preference {
  id: string;
  label: string;
  active: boolean;
}

interface SmartPromptProps {
  onFindSpots: () => void;
}

const SmartPrompt: React.FC<SmartPromptProps> = ({ onFindSpots }) => {
  const [location, setLocation] = useState('Near me');
  const [time, setTime] = useState('Tonight, 7 PM');
  const [budget, setBudget] = useState('RM100–150');
  const [preferences, setPreferences] = useState<Preference[]>([
    { id: '1', label: 'Beachside', active: true },
    { id: '2', label: 'Live Band', active: true },
    { id: '3', label: 'Serves Alcohol', active: true },
    { id: '4', label: 'Outdoor Seating', active: false },
    { id: '5', label: 'Pet Friendly', active: false },
    { id: '6', label: 'Romantic', active: false },
  ]);

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, active: !pref.active } : pref
      )
    );
  };

  return (
    <div className="mobile-container bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="px-6 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Where should we go for dinner tonight?
          </h1>
          <p className="text-slate-600 text-sm">
            Tell us your preferences and we'll find the perfect spot
          </p>
        </div>

        {/* Location */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all duration-200 text-slate-800"
              placeholder="📍 Near me"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {preferences.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pref.active
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-ocean-300 hover:bg-slate-50'
                }`}
              >
                {pref.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all duration-200 text-slate-800"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Budget
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all duration-200 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[428px] p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
        <Button
          onClick={onFindSpots}
          className="w-full py-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          Find Dinner Spots
        </Button>
      </div>
    </div>
  );
};

export default SmartPrompt;
