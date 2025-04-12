
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceIndicatorProps {
  prediction: 'increase' | 'decrease' | 'stable';
  showText?: boolean;
  className?: string;
}

const PriceIndicator = ({ prediction, showText = true, className = '' }: PriceIndicatorProps) => {
  const { translate } = useLanguage();
  
  // Get appropriate icon for price prediction
  const getIcon = () => {
    switch (prediction) {
      case 'increase':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'decrease':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get prediction text based on language
  const getPredictionText = () => {
    switch (prediction) {
      case 'increase':
        return translate("Expected to increase", "वाढण्याची शक्यता");
      case 'decrease':
        return translate("Expected to decrease", "कमी होण्याची शक्यता");
      default:
        return translate("Expected to remain stable", "स्थिर राहण्याची शक्यता");
    }
  };
  
  // Get color class for the text
  const getTextColorClass = () => {
    switch (prediction) {
      case 'increase':
        return 'text-red-600';
      case 'decrease':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            {getIcon()}
            {showText && <span className={getTextColorClass()}>{getPredictionText()}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getPredictionText()}</p>
          {prediction === 'increase' && 
            <p className="text-xs">{translate("Supply is low or demand is high", "पुरवठा कमी आहे किंवा मागणी जास्त आहे")}</p>
          }
          {prediction === 'decrease' && 
            <p className="text-xs">{translate("Supply is high or demand is low", "पुरवठा जास्त आहे किंवा मागणी कमी आहे")}</p>
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PriceIndicator;
