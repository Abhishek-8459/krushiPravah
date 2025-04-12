
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/20 via-white to-green-500/20 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">
          <span className="text-orange-600">Krushi</span> 
          <span className="text-gray-800"> Pravah</span>
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Jai Jawan, Jai Kisan - Empowering Farmers with Real-Time Market Insights
        </p>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => navigate('/market-rates')}
          >
            View Market Rates
          </Button>
          <Button 
            variant="secondary"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => navigate('/language')}
          >
            Choose Language
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
