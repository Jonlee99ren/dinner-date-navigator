
import React, { useState } from 'react';
import SmartPrompt from '@/components/SmartPrompt';
import Suggestions from '@/components/Suggestions';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'prompt' | 'suggestions'>('prompt');

  const handleFindSpots = () => {
    setCurrentScreen('suggestions');
  };

  const handleBack = () => {
    setCurrentScreen('prompt');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentScreen === 'prompt' ? (
        <SmartPrompt onFindSpots={handleFindSpots} />
      ) : (
        <Suggestions onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;
