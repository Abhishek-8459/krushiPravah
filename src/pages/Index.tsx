
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const navigate = useNavigate();
  const { translate } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/20 via-white to-green-500/20 p-4">
      <div className="text-center max-w-2xl flex flex-col items-center">
        <img 
          src="/lovable-uploads/11a2e067-18df-4937-a667-2822b345b388.png" 
          alt="Krushi Pravah Logo" 
          className="h-40 w-40 object-contain mb-6"
        />
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          {translate("Krushi Pravah", "कृषी प्रवाह")}
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          {translate(
            "Jai Jawan, Jai Kisan - Empowering Farmers with Real-Time Market Insights",
            "जय जवान, जय किसान - शेतकऱ्यांना प्रत्यक्ष बाजार माहितीसह सक्षम करणे"
          )}
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full bg-green-600 text-white hover:bg-green-700"
            onClick={() => navigate('/market-rates')}
          >
            {translate("View Live Market Rates", "लाईव्ह बाजार भाव पहा")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
