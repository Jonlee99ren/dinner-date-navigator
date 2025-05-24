
import React, { useState } from 'react';
import ChatPrompt from '@/components/ChatPrompt';
import PreferencesConfirm from '@/components/PreferencesConfirm';
import BookingOptions from '@/components/BookingOptions';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'chat' | 'confirm' | 'booking'>('chat');
  const [userPreferences, setUserPreferences] = useState({
    location: 'Near me',
    time: 'Tonight, 7 PM',
    budget: 'RM100–150',
    preferences: ['Beachside', 'Live Band', 'Serves Alcohol']
  });

  const handleContinueToConfirm = (preferences: any) => {
    setUserPreferences(preferences);
    setCurrentScreen('confirm');
  };

  const handleConfirmPreferences = () => {
    setCurrentScreen('booking');
  };

  const handleBack = () => {
    if (currentScreen === 'confirm') {
      setCurrentScreen('chat');
    } else if (currentScreen === 'booking') {
      setCurrentScreen('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentScreen === 'chat' && (
        <ChatPrompt onContinue={handleContinueToConfirm} />
      )}
      {currentScreen === 'confirm' && (
        <PreferencesConfirm 
          preferences={userPreferences}
          onConfirm={handleConfirmPreferences}
          onBack={handleBack}
        />
      )}
      {currentScreen === 'booking' && (
        <BookingOptions 
          preferences={userPreferences}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default Index;
