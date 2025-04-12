
import { supabase } from './supabaseClient';

// Define the structure of market data
export interface MarketItem {
  id: number;
  commodity: string;
  commodityMarathi?: string;
  min: number;
  max: number;
  modal: number;
  unit: string;
  date: string;
}

// Function to fetch market data from the database
export const fetchMarketRates = async (): Promise<MarketItem[]> => {
  try {
    const { data, error } = await supabase
      .from('market_rates')
      .select('*')
      .order('commodity', { ascending: true });
      
    if (error) {
      console.error('Error fetching market rates:', error);
      throw new Error('Failed to fetch market rates');
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return mock data for development or when there's an error
    return getMockMarketData();
  }
};

// Mock data for development or when the API is not available
export const getMockMarketData = (): MarketItem[] => {
  return [
    { id: 1, commodity: 'Tomato', commodityMarathi: 'टोमॅटो', min: 1000, max: 2500, modal: 1800, unit: 'Quintal', date: '2025-04-12' },
    { id: 2, commodity: 'Potato', commodityMarathi: 'बटाटा', min: 800, max: 1500, modal: 1200, unit: 'Quintal', date: '2025-04-12' },
    { id: 3, commodity: 'Onion', commodityMarathi: 'कांदा', min: 1200, max: 2000, modal: 1700, unit: 'Quintal', date: '2025-04-12' },
    { id: 4, commodity: 'Lady Finger', commodityMarathi: 'भेंडी', min: 2000, max: 3500, modal: 2800, unit: 'Quintal', date: '2025-04-12' },
    { id: 5, commodity: 'Cauliflower', commodityMarathi: 'फूलकोबी', min: 1500, max: 2500, modal: 2000, unit: 'Quintal', date: '2025-04-12' },
    { id: 6, commodity: 'Cabbage', commodityMarathi: 'कोबी', min: 800, max: 1200, modal: 1000, unit: 'Quintal', date: '2025-04-12' },
    { id: 7, commodity: 'Brinjal', commodityMarathi: 'वांगे', min: 1800, max: 2800, modal: 2200, unit: 'Quintal', date: '2025-04-12' },
    { id: 8, commodity: 'Cucumber', commodityMarathi: 'काकडी', min: 1200, max: 1800, modal: 1500, unit: 'Quintal', date: '2025-04-12' },
    { id: 9, commodity: 'Carrot', commodityMarathi: 'गाजर', min: 1500, max: 2200, modal: 1800, unit: 'Quintal', date: '2025-04-12' },
    { id: 10, commodity: 'Spinach', commodityMarathi: 'पालक', min: 1000, max: 1800, modal: 1400, unit: 'Quintal', date: '2025-04-12' },
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
