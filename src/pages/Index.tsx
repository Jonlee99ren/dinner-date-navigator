
import React, { useState } from 'react';
import ChatPrompt from '@/components/ChatPrompt';
import PreferencesConfirm from '@/components/PreferencesConfirm';
import Suggestions from '@/components/Suggestions';
import BookingOptions from '@/components/BookingOptions';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'chat' | 'confirm' | 'suggestions' | 'booking'>('chat');
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
    setCurrentScreen('suggestions');
  };

  const handleContinueToBooking = () => {
    setCurrentScreen('booking');
  };

  const handleBack = () => {
    if (currentScreen === 'confirm') {
      setCurrentScreen('chat');
    } else if (currentScreen === 'suggestions') {
      setCurrentScreen('confirm');
    } else if (currentScreen === 'booking') {
      setCurrentScreen('suggestions');
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
      )}      {currentScreen === 'suggestions' && (
        <Suggestions 
          preferences={userPreferences}
          onBack={handleBack}
          onContinueToBooking={handleContinueToBooking}
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
