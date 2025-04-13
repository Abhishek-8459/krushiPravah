import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Language = () => {
  const navigate = useNavigate();
  const { setLanguage, translate } = useLanguage();

  const handleLanguageSelect = (language: 'english' | 'marathi') => {
    setLanguage(language);
    navigate('/market-rates');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500/20 via-white to-green-500/20 p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          <span className="text-orange-600">Krushi</span> 
          <span className="text-gray-800"> Pravah</span>
        </h1>
        
        <p className="text-xl text-gray-700 mb-8">
          {translate(
            "Please select your preferred language",
            "कृपया आपली पसंतीची भाषा निवडा"
          )}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-all border-orange-200 hover:border-orange-400"
            onClick={() => handleLanguageSelect('english')}
          >
            <CardContent className="flex flex-col items-center p-6">
              <img 
                src="/lovable-uploads/krushi-pravah-favicon.png" 
                alt="Krushi Pravah" 
                className="w-16 h-16 mb-4"
              />
              <h2 className="text-2xl font-semibold text-gray-800">English</h2>
              <p className="text-gray-600 mt-2">
                {translate("Continue in English", "इंग्रजीमध्ये सुरू ठेवा")}
              </p>
              
              <Button 
                variant="outline" 
                className="mt-4 bg-orange-500 text-white hover:bg-orange-600 border-none"
              >
                {translate("Select", "निवडा")}
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-all border-green-200 hover:border-green-400"
            onClick={() => handleLanguageSelect('marathi')}
          >
            <CardContent className="flex flex-col items-center p-6">
              <img 
                src="/lovable-uploads/krushi-pravah-favicon.png" 
                alt="Krushi Pravah" 
                className="w-16 h-16 mb-4"
              />
              <h2 className="text-2xl font-semibold text-gray-800">मराठी</h2>
              <p className="text-gray-600 mt-2">मराठीमध्ये सुरू ठेवा</p>
              
              <Button 
                variant="outline" 
                className="mt-4 bg-green-600 text-white hover:bg-green-700 border-none"
              >
                निवडा
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          variant="ghost" 
          className="mt-8 text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/')}
        >
          {translate("Back to Home", "मुख्यपृष्ठावर परत जा")}
        </Button>
      </div>
    </div>
  );
};

export default Language;
