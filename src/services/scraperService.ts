// This service fetches and parses data from the Pune APMC website

interface PuneAPMCRate {
  commodity: string;
  commodityMarathi: string; // Added Marathi commodity name
  arrival: number; // Supply
  minRate: number;
  maxRate: number;
  modalRate: number; // Most common rate
  date: string;
}

export interface PriceWithPrediction {
  commodity: string;
  commodityMarathi?: string;
  min: number;
  max: number;
  modal: number;
  unit: string;
  date: string;
  arrival: number; // Supply
  prediction: 'increase' | 'decrease' | 'stable';
  previousModal?: number;
}

// Function to parse the HTML table from Pune APMC website
const parseAPMCHtml = (html: string): PuneAPMCRate[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Try different table selectors since the website might have various structures
  const tables = doc.querySelectorAll('table');
  let ratesTable = null;
  
  // Find the right table containing rate data
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const firstRow = table.querySelector('tr');
    if (firstRow) {
      const headerText = firstRow.textContent?.toLowerCase() || '';
      if (headerText.includes('commodity') || headerText.includes('arrival') || 
          headerText.includes('भाजीपाला') || headerText.includes('आवक')) {
        ratesTable = table;
        break;
      }
    }
  }
  
  if (!ratesTable) {
    console.error('Could not find rate table in the HTML');
    return [];
  }
  
  const rows = ratesTable.querySelectorAll('tr');
  const rates: PuneAPMCRate[] = [];
  
  // Skip the header row(s)
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length >= 5) {
      try {
        // Extract both Marathi and English commodity names
        const commodityCell = cells[0].textContent?.trim() || '';
        let commodity = '';
        let commodityMarathi = '';
        
        // Handle case where commodity might be in mixed language
        if (/[a-zA-Z]/.test(commodityCell) && /[\u0900-\u097F]/.test(commodityCell)) {
          // Has both English and Marathi chars
          const parts = commodityCell.split(/(?=[\u0900-\u097F])|(?<=[a-zA-Z])(?=[\u0900-\u097F])/).map(p => p.trim());
          commodity = parts.find(p => /[a-zA-Z]/.test(p)) || commodityCell;
          commodityMarathi = parts.find(p => /[\u0900-\u097F]/.test(p)) || '';
        } else if (/[a-zA-Z]/.test(commodityCell)) {
          // Only English
          commodity = commodityCell;
          commodityMarathi = getMarathiTranslation(commodityCell);
        } else {
          // Only Marathi or other
          commodityMarathi = commodityCell;
          commodity = getEnglishTranslation(commodityCell);
        }
        
        const rate: PuneAPMCRate = {
          commodity: commodity,
          commodityMarathi: commodityMarathi,
          arrival: parseFloat((cells[1].textContent?.trim() || '0').replace(/,/g, '')),
          minRate: parseFloat((cells[2].textContent?.trim() || '0').replace(/,/g, '')),
          maxRate: parseFloat((cells[3].textContent?.trim() || '0').replace(/,/g, '')),
          modalRate: parseFloat((cells[4].textContent?.trim() || '0').replace(/,/g, '')),
          date: new Date().toISOString().split('T')[0],
        };
        
        // Only add valid entries
        if ((rate.commodity || rate.commodityMarathi) && !isNaN(rate.modalRate)) {
          rates.push(rate);
        }
      } catch (error) {
        console.error('Error parsing row:', error);
      }
    }
  }
  
  return rates;
};

// Function to fetch the Pune APMC data
export const fetchPuneAPMCRates = async (): Promise<PriceWithPrediction[]> => {
  try {
    console.log('Fetching data from backend server');
    
    const response = await fetch('http://localhost:3000/api/market-rates');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const rates = await response.json();
    console.log('Successfully received rates from backend:', rates.length, 'items');
    
    // Fetch historical data to compare for predictions
    const historicalRates = await fetchHistoricalRates();
    
    return generatePredictions(rates, historicalRates);
  } catch (error) {
    console.error('Error fetching Pune APMC rates:', error);
    // Only use mock data as a last resort
    console.warn('Falling back to mock data due to error');
    return generatePredictions(getMockAPMCData());
  }
};

// Function to fetch historical rates for prediction purposes
const fetchHistoricalRates = async (): Promise<PuneAPMCRate[]> => {
  try {
    // Try to get historical data (from a week ago)
    const corsProxy = "https://api.allorigins.win/raw?url=";
    const url = encodeURIComponent("http://www.puneapmc.org/history.aspx?id=Rates4315");
    
    const response = await fetch(`${corsProxy}${url}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const parsedRates = parseAPMCHtml(html);
    
    if (parsedRates.length === 0) {
      return getHistoricalRates(); // fallback to mock historical data
    }
    
    return parsedRates;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    return getHistoricalRates(); // fallback to mock historical data
  }
};

// Function to predict price trends based on supply (arrival) and current rates
export const generatePredictions = (
  rates: PuneAPMCRate[], 
  historicalRates: PuneAPMCRate[] = getHistoricalRates()
): PriceWithPrediction[] => {
  return rates.map(rate => {
    // Find historical data for this commodity by matching commodity name or Marathi name
    const historical = historicalRates.find(h => 
      h.commodity === rate.commodity || 
      h.commodityMarathi === rate.commodityMarathi
    );
    
    let prediction: 'increase' | 'decrease' | 'stable' = 'stable';
    
    if (historical) {
      const supplyChange = rate.arrival - historical.arrival;
      const priceChange = rate.modalRate - historical.modalRate;
      
      // Basic supply and demand economics:
      // - If supply increases and price is already decreasing, likely to decrease further
      // - If supply decreases and price is already increasing, likely to increase further
      // - Otherwise, analyze the ratio of changes
      
      if (supplyChange > 0 && priceChange < 0) {
        prediction = 'decrease'; // More supply, already decreasing price
      } else if (supplyChange < 0 && priceChange > 0) {
        prediction = 'increase'; // Less supply, already increasing price
      } else {
        // Calculate predicted price change based on supply elasticity
        // This is a simplified model; a real model would be more complex
        const supplyElasticity = -0.5; // Assumed negative elasticity for agricultural products
        const predictedPriceChange = (supplyChange / historical.arrival) * supplyElasticity * rate.modalRate;
        
        if (predictedPriceChange > rate.modalRate * 0.02) {
          prediction = 'increase'; // Predicted increase > 2%
        } else if (predictedPriceChange < -rate.modalRate * 0.02) {
          prediction = 'decrease'; // Predicted decrease > 2%
        } else {
          prediction = 'stable'; // Change within ±2%
        }
      }
    } else {
      // No historical data, use supply as indicator
      // High supply typically means lower prices
      if (rate.arrival > 10000) {
        prediction = 'decrease';
      } else if (rate.arrival < 1000) {
        prediction = 'increase';
      }
    }
    
    // Map to our application's expected format
    return {
      commodity: rate.commodity || getEnglishTranslation(rate.commodityMarathi),
      commodityMarathi: rate.commodityMarathi || getMarathiTranslation(rate.commodity),
      min: rate.minRate,
      max: rate.maxRate,
      modal: rate.modalRate,
      unit: 'Quintal',
      date: rate.date,
      arrival: rate.arrival,
      prediction: prediction,
      previousModal: historical?.modalRate
    };
  });
};

// Helper function to get Marathi translations
const getMarathiTranslation = (commodity: string): string => {
  const translations: Record<string, string> = {
    'Tomato': 'टोमॅटो',
    'Potato': 'बटाटा',
    'Onion': 'कांदा',
    'Lady Finger': 'भेंडी',
    'Cauliflower': 'फूलकोबी',
    'Cabbage': 'कोबी',
    'Brinjal': 'वांगे',
    'Cucumber': 'काकडी',
    'Carrot': 'गाजर',
    'Spinach': 'पालक',
    'Bitter Gourd': 'कारले',
    'Bottle Gourd': 'दुधी भोपळा',
    'Capsicum': 'शिमला मिरची',
    'Coriander': 'कोथिंबीर',
    'Fenugreek': 'मेथी',
    'Garlic': 'लसूण',
    'Ginger': 'आले',
    'Green Chilli': 'हिरवी मिरची',
    'Green Peas': 'हिरवे वाटाणे',
    'Lemon': 'लिंबू',
    'Radish': 'मुळा',
    'Ridge Gourd': 'दोडका',
    'Pumpkin': 'भोपळा',
    'Mushroom': 'मशरूम',
    'Strawberry': 'स्ट्रॉबेरी',
    'Sponge Gourd': 'परवल',
    'Cluster Beans': 'गवार',
  };
  
  return translations[commodity] || commodity;
};

// Helper function to get English translations
const getEnglishTranslation = (marathiCommodity: string): string => {
  const translations: Record<string, string> = {
    'टोमॅटो': 'Tomato',
    'बटाटा': 'Potato',
    'कांदा': 'Onion',
    'भेंडी': 'Lady Finger',
    'फूलकोबी': 'Cauliflower',
    'कोबी': 'Cabbage',
    'वांगे': 'Brinjal',
    'काकडी': 'Cucumber',
    'गाजर': 'Carrot',
    'पालक': 'Spinach',
    'कारले': 'Bitter Gourd',
    'दुधी भोपळा': 'Bottle Gourd',
    'शिमला मिरची': 'Capsicum',
    'कोथिंबीर': 'Coriander',
    'मेथी': 'Fenugreek',
    'लसूण': 'Garlic',
    'आले': 'Ginger',
    'हिरवी मिरची': 'Green Chilli',
    'हिरवे वाटाणे': 'Green Peas',
    'लिंबू': 'Lemon',
    'मुळा': 'Radish',
    'दोडका': 'Ridge Gourd',
    'भोपळा': 'Pumpkin',
    'मशरूम': 'Mushroom',
    'स्ट्रॉबेरी': 'Strawberry',
    'परवल': 'Sponge Gourd',
    'गवार': 'Cluster Beans',
  };
  
  return translations[marathiCommodity] || marathiCommodity;
};

// Mock historical data (one week ago) for comparison when API fails
const getHistoricalRates = (): PuneAPMCRate[] => {
  return [
    { commodity: 'Tomato', commodityMarathi: 'टोमॅटो', arrival: 8500, minRate: 1200, maxRate: 2700, modalRate: 2000, date: '2025-04-05' },
    { commodity: 'Potato', commodityMarathi: 'बटाटा', arrival: 12000, minRate: 750, maxRate: 1400, modalRate: 1100, date: '2025-04-05' },
    { commodity: 'Onion', commodityMarathi: 'कांदा', arrival: 15000, minRate: 1300, maxRate: 2100, modalRate: 1800, date: '2025-04-05' },
    { commodity: 'Lady Finger', commodityMarathi: 'भेंडी', arrival: 2000, minRate: 2200, maxRate: 3700, modalRate: 3000, date: '2025-04-05' },
    { commodity: 'Cauliflower', commodityMarathi: 'फूलकोबी', arrival: 3500, minRate: 1600, maxRate: 2600, modalRate: 2100, date: '2025-04-05' },
    { commodity: 'Cabbage', commodityMarathi: 'कोबी', arrival: 9000, minRate: 750, maxRate: 1100, modalRate: 950, date: '2025-04-05' },
    { commodity: 'Brinjal', commodityMarathi: 'वांगे', arrival: 4500, minRate: 1900, maxRate: 2900, modalRate: 2300, date: '2025-04-05' },
    { commodity: 'Cucumber', commodityMarathi: 'काकडी', arrival: 6000, minRate: 1100, maxRate: 1700, modalRate: 1400, date: '2025-04-05' },
    { commodity: 'Carrot', commodityMarathi: 'गाजर', arrival: 4000, minRate: 1600, maxRate: 2300, modalRate: 1900, date: '2025-04-05' },
    { commodity: 'Spinach', commodityMarathi: 'पालक', arrival: 2500, minRate: 950, maxRate: 1700, modalRate: 1300, date: '2025-04-05' },
  ];
};

// Mock current data with arrivals (supply) for when the API fails
const getMockAPMCData = (): PuneAPMCRate[] => {
  return [
    { commodity: 'Tomato', commodityMarathi: 'टोमॅटो', arrival: 9500, minRate: 1000, maxRate: 2500, modalRate: 1800, date: '2025-04-12' },
    { commodity: 'Potato', commodityMarathi: 'बटाटा', arrival: 15000, minRate: 800, maxRate: 1500, modalRate: 1200, date: '2025-04-12' },
    { commodity: 'Onion', commodityMarathi: 'कांदा', arrival: 12000, minRate: 1200, maxRate: 2000, modalRate: 1700, date: '2025-04-12' },
    { commodity: 'Lady Finger', commodityMarathi: 'भेंडी', arrival: 1500, minRate: 2000, maxRate: 3500, modalRate: 2800, date: '2025-04-12' },
    { commodity: 'Cauliflower', commodityMarathi: 'फूलकोबी', arrival: 3000, minRate: 1500, maxRate: 2500, modalRate: 2000, date: '2025-04-12' },
    { commodity: 'Cabbage', commodityMarathi: 'कोबी', arrival: 10000, minRate: 800, maxRate: 1200, modalRate: 1000, date: '2025-04-12' },
    { commodity: 'Brinjal', commodityMarathi: 'वांगे', arrival: 4000, minRate: 1800, maxRate: 2800, modalRate: 2200, date: '2025-04-12' },
    { commodity: 'Cucumber', commodityMarathi: 'काकडी', arrival: 7000, minRate: 1200, maxRate: 1800, modalRate: 1500, date: '2025-04-12' },
    { commodity: 'Carrot', commodityMarathi: 'गाजर', arrival: 3500, minRate: 1500, maxRate: 2200, modalRate: 1800, date: '2025-04-12' },
    { commodity: 'Spinach', commodityMarathi: 'पालक', arrival: 2000, minRate: 1000, maxRate: 1800, modalRate: 1400, date: '2025-04-12' },
  ];
};
