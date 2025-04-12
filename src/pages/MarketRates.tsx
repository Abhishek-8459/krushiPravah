
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, RefreshCw, TrendingUp, TrendingDown, Minus, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { fetchMarketRates, MarketItem } from '@/services/marketService';
import { useLanguage } from '@/contexts/LanguageContext';

const MarketRates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, translate } = useLanguage();
  
  // Fetch market data using React Query
  const { data: marketData, isLoading, error, refetch } = useQuery({
    queryKey: ['marketRates'],
    queryFn: fetchMarketRates,
  });

  // Filter data based on search term
  const filteredData = marketData?.filter(item => 
    item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.commodityMarathi && item.commodityMarathi.includes(searchTerm))
  );

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
    toast({
      title: translate("Refreshing market rates", "बाजार दर रिफ्रेश करत आहे"),
      description: translate("Getting the latest market rates for you...", "तुमच्यासाठी नवीनतम बाजार दर मिळवत आहे..."),
    });
  };

  // Convert price to preferred format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get appropriate icon for price prediction
  const getPredictionIcon = (prediction: string) => {
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
  const getPredictionText = (prediction: string) => {
    switch (prediction) {
      case 'increase':
        return translate("Expected to increase", "वाढण्याची शक्यता");
      case 'decrease':
        return translate("Expected to decrease", "कमी होण्याची शक्यता");
      default:
        return translate("Expected to remain stable", "स्थिर राहण्याची शक्यता");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/10 via-white to-green-500/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with logo */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="hover:bg-orange-100"
            >
              <ArrowLeft className="h-5 w-5 text-orange-600" />
            </Button>
            <img 
              src="/lovable-uploads/11a2e067-18df-4937-a667-2822b345b388.png" 
              alt="Krushi Pravah Logo" 
              className="h-16 w-16 object-contain"
            />
            <h1 className="text-2xl md:text-3xl font-bold">
              <span className="text-green-700">{translate("Market Rates", "बाजार भाव")}</span>
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/language')}
            className="text-green-700 border-green-600 hover:bg-green-50"
          >
            {language === 'english' ? 'मराठी' : 'English'}
          </Button>
        </div>

        {/* Search and refresh controls */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-orange-100">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={translate("Search vegetables...", "भाज्या शोधा...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-orange-200 focus-visible:ring-green-500"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="text-orange-600 border-orange-300 hover:bg-orange-50 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {translate('Refresh', 'ताजे करा')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Date information */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {translate(
              `Pune APMC Market Rates for ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
              `पुणे एपीएमसी बाजार भाव - ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
            )}
          </p>
          <p className="text-xs text-green-700 flex items-center gap-1">
            <BarChart size={14} />
            {translate("Live data with predictions", "लाईव्ह डेटा आणि अंदाज")}
          </p>
        </div>

        {/* Market rates table */}
        <Card className="bg-white/90 backdrop-blur-sm border-green-100 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">{translate('Loading data...', 'डेटा लोड करत आहे...')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center text-red-500">
                  <p>{translate('Error loading data. Please try again.', 'डेटा लोड करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.')}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-green-50">
                    <TableRow>
                      <TableHead className="text-green-800 font-bold">{translate('Commodity', 'भाजी')}</TableHead>
                      <TableHead className="text-green-800 font-bold text-right">{translate('Min Price', 'किमान भाव')}</TableHead>
                      <TableHead className="text-green-800 font-bold text-right">{translate('Max Price', 'कमाल भाव')}</TableHead>
                      <TableHead className="text-green-800 font-bold text-right">{translate('Modal Price', 'सामान्य भाव')}</TableHead>
                      <TableHead className="text-green-800 font-bold text-right">{translate('Supply', 'आवक')}</TableHead>
                      <TableHead className="text-green-800 font-bold text-right">{translate('Prediction', 'अंदाज')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData && filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-green-50/50">
                          <TableCell className="font-medium">
                            {language === 'english' ? item.commodity : item.commodityMarathi || item.commodity}
                          </TableCell>
                          <TableCell className="text-right">{formatPrice(item.min)}</TableCell>
                          <TableCell className="text-right">{formatPrice(item.max)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatPrice(item.modal)}</TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat('en-IN').format(item.arrival)} {translate('Qtl', 'क्विंटल')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {getPredictionIcon(item.prediction)}
                              <span className={
                                item.prediction === 'increase' ? 'text-red-600' : 
                                item.prediction === 'decrease' ? 'text-green-600' : 
                                'text-gray-600'
                              }>
                                {getPredictionText(item.prediction)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchTerm 
                            ? translate('No results found for your search.', 'आपल्या शोधासाठी कोणतेही परिणाम सापडले नाहीत.') 
                            : translate('No market data available.', 'बाजार डेटा उपलब्ध नाही.')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information section */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              {translate('About Market Rates', 'बाजार भावांबद्दल')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {translate(
                'These rates are sourced from the Pune Agricultural Produce Market Committee (APMC). Prices may vary based on quality and time of day. The modal price represents the most common trading price. Price predictions are based on supply and demand analysis.',
                'हे दर पुणे कृषी उत्पन्न बाजार समिती (एपीएमसी) कडून घेतले आहेत. गुणवत्ता आणि दिवसाच्या वेळेनुसार किंमती बदलू शकतात. सामान्य किंमत ही सर्वात सामान्य व्यापारी किंमत दर्शवते. किंमत अंदाज मागणी आणि पुरवठा विश्लेषणावर आधारित आहेत.'
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketRates;
