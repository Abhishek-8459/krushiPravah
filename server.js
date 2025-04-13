import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Function to translate text using Google Translate API
async function translateText(text) {
  try {
    // First check our translation dictionary
    if (translations[text]) {
      console.log(`Found translation in dictionary: ${text} -> ${translations[text]}`);
      return translations[text];
    }

    // If not in dictionary, use Google Translate
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
      params: {
        client: 'gtx',
        sl: 'mr', // Source language: Marathi
        tl: 'en', // Target language: English
        dt: 't',
        q: text
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Extract and clean up the translation
    const translation = response.data[0][0][0];
    const cleanTranslation = translation
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
    
    console.log(`Google translated: ${text} -> ${cleanTranslation}`);
    
    // Add to our dictionary for future use
    translations[text] = cleanTranslation;
    
    return cleanTranslation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text as fallback
  }
}

// Translation mapping for Marathi to English
const translations = {
  'कांदा': 'Onion',
  'बटाटा': 'Potato',
  'लसूण': 'Garlic',
  'आले': 'Ginger',
  'भेंडी': 'Lady Finger',
  'गवार': 'Cluster Beans',
  'टोमॅटो': 'Tomato',
  'मटार': 'Peas',
  'घेवडा': 'Ridge Gourd',
  'दोडका': 'Sponge Gourd',
  'हि.मिरची': 'Green Chilli',
  'दुधीभोपळा': 'Bottle Gourd',
  'काकडी': 'Cucumber',
  'कारली': 'Bitter Gourd',
  'डांगर': 'Yam',
  'गाजर': 'Carrot',
  'पापडी': 'Papdi',
  'पडवळ': 'Snake Gourd',
  'फ्लॉवर': 'Cauliflower',
  'कोबी': 'Cabbage',
  'वांगी': 'Brinjal',
  'ढोबळी': 'Dudhi',
  'सुरण': 'Yam',
  'तोंडली': 'Tondli',
  'बीट': 'Beetroot',
  'कोहळा': 'Pumpkin',
  'पावटा': 'Pavta',
  'वालवर': 'Valvar',
  'शेवगा': 'Drumstick',
  'कैरी': 'Raw Mango',
  'ढेमसा': 'Dhemsa',
  'नवलकोल': 'Navalkol',
  'चवळी': 'Chawli',
  'रताळी': 'Ratalee',
  'परवल': 'Parwal',
  'घोसाळी': 'Ghosali',
  'कडीपत्ता': 'Curry Leaves',
  'आरवी': 'Arvi',
  'लाल व पिवळी ढाेबळी': 'Red and Yellow Dudhi',
  'बेझील': 'Basil',
  'ब्रोकाेली': 'Broccoli',
  'पाेकचाय': 'Pokchoy',
  'चायना काेबी': 'Chinese Cabbage',
  'लाल काेबी': 'Red Cabbage',
  'बेबी काॅर्न': 'Baby Corn',
  'झुकुणी': 'Zucchini',
  'चेरी टॅामेटो': 'Cherry Tomato',
  'सॅलड': 'Salad',
  'सॅलरी': 'Celery',
  'मशरुम': 'Mushroom',
  'कमल काकडी': 'Lotus Root',
  'राेमन': 'Roman Lettuce',
  'लिफी': 'Leek',
  'चायना लसुण': 'Chinese Garlic',
  'कोथिंबीर': 'Coriander',
  'मेथी': 'Fenugreek',
  'शेपू': 'Shepu',
  'कांदापात': 'Spring Onion',
  'पालक': 'Spinach',
  'मुळा': 'Radish',
  'चवळी पाला': 'Chawli Leaves',
  'करडई': 'Karadai',
  'राजगिरा': 'Rajgira',
  'पुदीना': 'Mint',
  'अंबाडी': 'Ambadhi',
  'चुका': 'Chuka',
  'आईसबर्ग': 'Iceberg Lettuce',
  'लिंबू': 'Lemon',
  'पेरु': 'Guava',
  'फणस': 'Jackfruit',
  'पीअर': 'Pear',
  'संञा': 'Sapota',
  'अननस': 'Pineapple',
  'अंजीर': 'Fig',
  'स्ट्रॉबेरी': 'Strawberry',
  'चिक्कू': 'Chikoo',
  'डाळींब-नं.१': 'Pomegranate-No.1',
  'सफरचंद-सिमला': 'Apple-Simla',
  'कलिगङ': 'Kalingad',
  'आवळा': 'Amla',
  'केळी': 'Banana',
  'मोसंबी': 'Mosambi',
  'पपई': 'Papaya',
  'द्राक्ष - तासगांव': 'Grapes - Tasgaon'
};

// Function to parse the HTML table
const parseAPMCHtml = async (html) => {
  const $ = cheerio.load(html);
  const rates = [];
  
  console.log('Parsing HTML...');
  
  // Find all tables with rate data
  for (const table of $('table').toArray()) {
    const firstRow = $(table).find('tr').first().text().toLowerCase();
    
    // Check if this is a rates table
    if (firstRow.includes('शेतिमाल') || firstRow.includes('आवक') || 
        firstRow.includes('किमान') || firstRow.includes('कमाल')) {
      
      console.log('Found rates table');
      
      // Parse each row in the table
      for (const row of $(table).find('tr').toArray()) {
        if ($(row).is(':first-child')) continue; // Skip header row
        
        const cells = $(row).find('td');
        if (cells.length >= 5) {
          try {
            // Get commodity name from the second column (शेतिमाल)
            const commodityMarathi = $(cells[1]).text().trim();
            console.log('Original Marathi name:', commodityMarathi);
            
            // Translate the commodity name
            const commodity = await translateText(commodityMarathi);
            console.log('Translated name:', commodity);
            
            // Get arrival from the third column (आवक)
            const arrivalText = $(cells[2]).text().trim();
            // Get min rate from the fourth column (किमान)
            const minRateText = $(cells[3]).text().trim();
            // Get max rate from the fifth column (कमाल)
            const maxRateText = $(cells[4]).text().trim();
            
            // Extract numeric values from rate strings (e.g., "Rs. 600/-" -> 600)
            const extractNumber = (text) => {
              const match = text.match(/\d+/);
              return match ? parseFloat(match[0]) : 0;
            };
            
            const rate = {
              commodity: commodity, // Use translated name
              commodityMarathi: commodityMarathi, // Keep original Marathi name
              arrival: extractNumber(arrivalText),
              minRate: extractNumber(minRateText),
              maxRate: extractNumber(maxRateText),
              modalRate: Math.round((extractNumber(minRateText) + extractNumber(maxRateText)) / 2),
              date: new Date().toISOString().split('T')[0]
            };
            
            // Only add valid entries with non-zero modal rate
            if (!isNaN(rate.modalRate) && rate.modalRate > 0) {
              rates.push(rate);
              console.log('Added rate:', rate);
            }
          } catch (error) {
            console.error('Error parsing row:', error);
          }
        }
      }
    }
  }
  
  // Sort rates by English commodity name
  rates.sort((a, b) => a.commodity.localeCompare(b.commodity));
  
  console.log('Total rates parsed:', rates.length);
  return rates;
};

// Endpoint to fetch market rates
app.get('/api/market-rates', async (req, res) => {
  try {
    console.log('Fetching data from Pune APMC website...');
    const response = await axios.get('http://www.puneapmc.org/history.aspx?id=Rates4317', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8,en-IN;q=0.7'
      }
    });
    
    console.log('Response status:', response.status);
    
    const rates = await parseAPMCHtml(response.data);
    
    if (rates.length === 0) {
      throw new Error('No rates found in the response');
    }
    
    res.json(rates);
  } catch (error) {
    console.error('Error fetching market rates:', error);
    res.status(500).json({ error: 'Failed to fetch market rates' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 