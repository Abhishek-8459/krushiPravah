
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { fetchPuneAPMCRates, PriceWithPrediction } from './scraperService';

// Define the structure of market data
export interface MarketItem extends PriceWithPrediction {
  id: number;
}

// Function to fetch market data from the API and store in Supabase
export const fetchMarketRates = async (): Promise<MarketItem[]> => {
  try {
    // Try to fetch from Supabase first if the data is less than 3 hours old
    if (isSupabaseConfigured()) {
      const threeHoursAgo = new Date();
      threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
      
      const { data, error } = await supabase
        .from('market_rates')
        .select('*, created_at')
        .gt('created_at', threeHoursAgo.toISOString())
        .order('commodity', { ascending: true });
        
      if (error) {
        console.error('Error fetching market rates from Supabase:', error);
      } else if (data && data.length > 0) {
        console.log('Using recent data from Supabase');
        return data.map(({ created_at, ...item }) => item);
      }
    }

    // If Supabase fails or data is stale, fetch from the scraper
    console.log('Fetching live data from Pune APMC website');
    const scrapedData = await fetchPuneAPMCRates();
    
    // Log the actually fetched data for debugging
    console.log('Scraped data from Pune APMC:', scrapedData);
    
    // Add IDs to the data
    const marketData: MarketItem[] = scrapedData.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    
    // If Supabase is configured, store the data for next time
    if (isSupabaseConfigured()) {
      try {
        // First clear the table
        await supabase.from('market_rates').delete().neq('id', 0);
        
        // Then insert new data
        const { error } = await supabase.from('market_rates').insert(
          marketData.map(item => ({
            ...item,
            created_at: new Date().toISOString()
          }))
        );
        
        if (error) {
          console.error('Error storing market rates in Supabase:', error);
        } else {
          console.log('Successfully stored market data in Supabase');
        }
      } catch (storeError) {
        console.error('Failed to store market data in Supabase:', storeError);
      }
    }
    
    return marketData;
  } catch (error) {
    console.error('Unexpected error fetching market data:', error);
    // Return mock data as a fallback
    return getMockMarketData();
  }
};

// Mock data for development or when the API is not available
export const getMockMarketData = (): MarketItem[] => {
  return [
    { id: 1, commodity: 'Tomato', commodityMarathi: 'टोमॅटो', min: 1000, max: 2500, modal: 1800, unit: 'Quintal', date: '2025-04-12', arrival: 9500, prediction: 'decrease', previousModal: 2000 },
    { id: 2, commodity: 'Potato', commodityMarathi: 'बटाटा', min: 800, max: 1500, modal: 1200, unit: 'Quintal', date: '2025-04-12', arrival: 15000, prediction: 'increase', previousModal: 1100 },
    { id: 3, commodity: 'Onion', commodityMarathi: 'कांदा', min: 1200, max: 2000, modal: 1700, unit: 'Quintal', date: '2025-04-12', arrival: 12000, prediction: 'decrease', previousModal: 1800 },
    { id: 4, commodity: 'Lady Finger', commodityMarathi: 'भेंडी', min: 2000, max: 3500, modal: 2800, unit: 'Quintal', date: '2025-04-12', arrival: 1500, prediction: 'increase', previousModal: 3000 },
    { id: 5, commodity: 'Cauliflower', commodityMarathi: 'फूलकोबी', min: 1500, max: 2500, modal: 2000, unit: 'Quintal', date: '2025-04-12', arrival: 3000, prediction: 'stable', previousModal: 2100 },
    { id: 6, commodity: 'Cabbage', commodityMarathi: 'कोबी', min: 800, max: 1200, modal: 1000, unit: 'Quintal', date: '2025-04-12', arrival: 10000, prediction: 'increase', previousModal: 950 },
    { id: 7, commodity: 'Brinjal', commodityMarathi: 'वांगे', min: 1800, max: 2800, modal: 2200, unit: 'Quintal', date: '2025-04-12', arrival: 4000, prediction: 'decrease', previousModal: 2300 },
    { id: 8, commodity: 'Cucumber', commodityMarathi: 'काकडी', min: 1200, max: 1800, modal: 1500, unit: 'Quintal', date: '2025-04-12', arrival: 7000, prediction: 'increase', previousModal: 1400 },
    { id: 9, commodity: 'Carrot', commodityMarathi: 'गाजर', min: 1500, max: 2200, modal: 1800, unit: 'Quintal', date: '2025-04-12', arrival: 3500, prediction: 'decrease', previousModal: 1900 },
    { id: 10, commodity: 'Spinach', commodityMarathi: 'पालक', min: 1000, max: 1800, modal: 1400, unit: 'Quintal', date: '2025-04-12', arrival: 2000, prediction: 'increase', previousModal: 1300 },
  ];
};

// Function to add a new market rate entry (for admin use)
export const addMarketRate = async (marketItem: Omit<MarketItem, 'id'>): Promise<MarketItem | null> => {
  try {
    const { data, error } = await supabase
      .from('market_rates')
      .insert([marketItem])
      .select();
      
    if (error) {
      console.error('Error adding market rate:', error);
      throw new Error('Failed to add market rate');
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// Function to update an existing market rate (for admin use)
export const updateMarketRate = async (id: number, updates: Partial<MarketItem>): Promise<MarketItem | null> => {
  try {
    const { data, error } = await supabase
      .from('market_rates')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating market rate:', error);
      throw new Error('Failed to update market rate');
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};
