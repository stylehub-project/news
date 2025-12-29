
import { GoogleGenAI } from "@google/genai";
import { cacheService } from './cacheService';

const getApiKey = () => {
  // Check standard Vercel/Next.js environment variables
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    // @ts-ignore
    if (process.env.API_KEY) return process.env.API_KEY;
  }

  // Check Vite environment variables
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    if ((import.meta as any).env.API_KEY) return (import.meta as any).env.API_KEY;
  }

  // Check Window Shim (from index.html)
  // @ts-ignore
  if (typeof window !== 'undefined' && window.process?.env?.API_KEY) {
    // @ts-ignore
    return window.process.env.API_KEY;
  }

  return '';
};

// Mock data generator for offline/fallback scenarios
const getMockData = (page: number, category: string = 'General', language: string = 'English') => {
    const baseSeed = page * 100;
    const isHindi = language === 'Hindi';

    return Array.from({ length: 5 }).map((_, i) => {
        const itemSeed = baseSeed + i;
        const categories = ['Technology', 'Business', 'Science', 'Politics', 'Health', 'World'];
        const cat = category === 'All' ? categories[itemSeed % categories.length] : category;
        
        const descriptionEn = "Detailed analysis of the current situation reveals significant shifts in the global landscape, affecting markets and consumer behavior alike. Experts suggest immediate action.";
        const descriptionHi = "वर्तमान स्थिति का विस्तृत विश्लेषण वैश्विक परिदृश्य में महत्वपूर्ण बदलावों को दर्शाता है, जो बाजारों और उपभोक्ता व्यवहार को समान रूप से प्रभावित कर रहा है। विशेषज्ञ तत्काल कार्रवाई का सुझाव देते हैं।";

        return {
            id: `news-${Date.now()}-${itemSeed}`,
            title: getHeadline(cat, itemSeed, isHindi),
            description: isHindi ? descriptionHi : descriptionEn,
            source: ["TechCrunch", "BBC", "CNN", "Reuters", "The Verge", "Bloomberg"][itemSeed % 6],
            timeAgo: isHindi ? `${(i % 12) + 1} घंटे पहले` : `${(i % 12) + 1}h ago`,
            category: cat,
            imageUrl: `https://picsum.photos/seed/${itemSeed}/800/600` 
        };
    });
};

const getHeadline = (category: string, seed: number, isHindi: boolean) => {
    if (isHindi) {
        const templatesHi = [
            "{cat} में बड़ी सफलता ने उद्योग विशेषज्ञों को चौंका दिया",
            "वैश्विक {cat} शिखर सम्मेलन में ऐतिहासिक समझौता",
            "क्यों {cat} अगला बड़ा निवेश अवसर है",
            "2025 में देखने के लिए {cat} का भविष्य: रुझान",
            "विवादास्पद {cat} नीति पर दुनिया भर में बहस छिड़ी",
            "शीर्ष 10 {cat} नवाचार जो आपको जानने चाहिए",
            "{cat} दिग्गज ने आश्चर्यजनक विलय की घोषणा की",
            "वैश्विक {cat} परिवर्तनों का स्थानीय प्रभाव",
            "नई रिपोर्ट में {cat} क्षेत्र में छिपे जोखिमों का खुलासा",
            "विशेष: {cat} क्रांति के अंदर"
        ];
        // Simple mapping for category names to Hindi
        const catMap: Record<string, string> = {
            'Technology': 'तकनीक',
            'Business': 'व्यापार',
            'Science': 'विज्ञान',
            'Politics': 'राजनीति',
            'Health': 'स्वास्थ्य',
            'World': 'दुनिया',
            'General': 'सामान्य'
        };
        const displayCat = catMap[category] || category;
        return templatesHi[seed % templatesHi.length].replace("{cat}", displayCat);
    }

    const templatesEn = [
        "Major Breakthrough in {cat} Shocks Industry Experts",
        "Global {cat} Summit Reaches Historic Agreement",
        "Why {cat} is the Next Big Investment Opportunity",
        "The Future of {cat}: Trends to Watch in 2025",
        "Controversial {cat} Policy Sparks Debate Worldwide",
        "Top 10 Innovations in {cat} You Need to Know",
        "{cat} Giant Announces Surprise Merger",
        "Local Impact of Global {cat} Changes",
        "New Report Reveals Hidden Risks in {cat} Sector",
        "Exclusive: Inside the {cat} Revolution"
    ];
    return templatesEn[seed % templatesEn.length].replace("{cat}", category);
};

export const fetchNewsFeed = async (page: number, filters: any) => {
  const language = filters.language || 'English';
  const cacheKey = `feed_${filters.category}_${filters.sort}_${page}_${language}`;

  // 1. Try Cache First (Stale-while-revalidate strategy is hard in simple await, so we prioritize speed/offline)
  // If offline, this is the only source.
  const cachedData = cacheService.get(cacheKey);
  if (!navigator.onLine && cachedData) {
      console.log("Serving from offline cache");
      return cachedData;
  }

  // If online but we want to be snappy, we could return cache, but let's try fresh first
  
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("No API Key found, using mock data.");
        const mock = getMockData(page, filters.category, language);
        cacheService.set(cacheKey, mock); // Cache the mock too for consistency
        return mock;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const topic = filters.category === 'All' ? 'latest global news' : `${filters.category} news`;

    const filterContext = `
      Focus on: ${filters.filter || 'General'}
      Region: ${filters.state || 'Global'}
      Sort by: ${filters.sort || 'Latest'}
      Output Language: ${language}
    `;

    const prompt = `
      Find 5 unique news articles about "${topic}".
      Context: ${filterContext}.
      Page: ${page}.
      
      You have access to Google Search. Use it to find real, up-to-date information.
      
      IMPORTANT: Output the result strictly as a JSON Array. Do not wrap in markdown code blocks.
      
      JSON Structure:
      [
        {
          "id": "unique_string",
          "title": "Translated Headline",
          "description": "Short summary",
          "source": "Publisher Name",
          "timeAgo": "e.g. 2h ago",
          "category": "Category",
          "imageUrl": "URL or placeholder"
        }
      ]
    `;

    let text = "";

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
          }
        });
        text = response.text || "";
    } catch (toolError) {
        console.warn("Tool execution failed, retrying without tools...", toolError);
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        text = response.text || "";
    }

    if (!text) throw new Error("Empty response");
    
    // Robust cleaning
    const cleanText = text.replace(/```json|```/g, '').trim();
    const arrayStart = cleanText.indexOf('[');
    const arrayEnd = cleanText.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1) {
        const jsonStr = cleanText.substring(arrayStart, arrayEnd + 1);
        const data = JSON.parse(jsonStr);
        
        // Success - Cache it
        cacheService.set(cacheKey, data);
        return data;
    }
    
    throw new Error("Invalid JSON format");

  } catch (error) {
    console.error("AI Fetch Error", error);
    
    // Fallback: Return Cache if available (even if expired, better than nothing)
    // Here we use raw localStorage to bypass expiry check if network failed
    try {
        const rawCache = localStorage.getItem(`nc_cache_${cacheKey}`);
        if (rawCache) {
            return JSON.parse(rawCache).value;
        }
    } catch(e) {}

    // Ultimate Fallback: Mock Data
    return getMockData(page, filters.category, language);
  }
};

export const modifyText = async (text: string, instruction: string) => {
    // Modify text is rarely cached as it's interactive, but we can try
    const cacheKey = `mod_${text.substring(0, 20)}_${instruction}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 500));
            return text + " (AI unavailable - Offline Edited)";
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Original Text: "${text}"\n\nInstruction: ${instruction}. Return only the modified text, nothing else.`
        });
        const result = response.text || text;
        cacheService.set(cacheKey, result);
        return result;
    } catch (e) {
        console.error(e);
        return text;
    }
};

export const fetchNewspaperContent = async (title: string, config: any) => {
    // This is a heavy operation, definitely cache the 'config' signature
    const cacheKey = `newspaper_${title}_${JSON.stringify(config)}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    // Simulation logic remains, but we cache the result
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const result = {
        title: title || "The Daily News",
        date: new Date().toLocaleDateString(),
        issueNumber: `${Math.floor(Math.random() * 500) + 100}`,
        price: "$2.50",
        sections: [
            {
                type: 'headline',
                title: `${config.scope || 'World'} Markets React to New AI Developments`,
                content: null
            },
            {
                type: 'images',
                content: ['https://picsum.photos/seed/news_hero/800/400'],
                imageCaption: "Global leaders gather for the annual technology summit in Geneva."
            },
            {
                type: 'text',
                title: 'Main Story',
                content: "In a stunning turn of events, major tech conglomerates have announced a unified framework for artificial intelligence safety.\n\nThe agreement, signed by industry titans, promises to standardize ethical guidelines across borders. 'This is a monumental step for humanity,' said one spokesperson. \n\nMarkets responded immediately, with tech stocks surging 5% in pre-market trading. However, critics argue that self-regulation may not be enough."
            },
            {
                type: 'text',
                title: 'Editorial',
                content: "As we move into this new era, the question remains: who watches the watchmen? While the new framework is promising, government oversight remains a critical piece of the puzzle. We must remain vigilant."
            },
            {
                type: 'graph',
                title: 'Market Trends',
                content: [
                    { label: 'Tech', value: 85 },
                    { label: 'Energy', value: 45 },
                    { label: 'Retail', value: 60 }
                ]
            }
        ]
    };
    
    cacheService.set(cacheKey, result);
    return result;
};
