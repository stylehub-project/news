import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // @ts-ignore
  return (typeof window !== 'undefined' && window.process?.env?.API_KEY) || (import.meta as any).env.VITE_API_KEY || '';
};

export const fetchNewsFeed = async (page: number, filters: any) => {
  try {
    const apiKey = getApiKey();
    // If no API key, immediately return mock data to prevent errors in dev mode
    if (!apiKey) return getMockData(page, filters.category);
    
    const ai = new GoogleGenAI({ apiKey });
    
    const topic = filters.category === 'All' ? 'latest global news' : `${filters.category} news`;
    const filterContext = `
      Focus on: ${filters.filter || 'General'}
      Region: ${filters.state || 'Global'}
      Sort by: ${filters.sort || 'Latest'}
    `;

    const prompt = `
      Find 5 unique news articles about "${topic}".
      Context: ${filterContext}.
      Page: ${page}.
      
      Return a JSON array with these properties for each article:
      - id: string (unique)
      - title: string
      - description: string (short summary)
      - source: string
      - timeAgo: string (e.g. '2h ago')
      - category: string
      - imageUrl: string (use a placeholder if none found, prefer real high quality images)
      
      Use the googleSearch tool to find real, up-to-date information.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    source: { type: Type.STRING },
                    timeAgo: { type: Type.STRING },
                    category: { type: Type.STRING },
                    imageUrl: { type: Type.STRING }
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) return getMockData(page, filters.category);
    
    try {
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (parseError) {
        console.warn("JSON Parse Failed, using fallback data", parseError);
        return getMockData(page, filters.category);
    }

  } catch (error) {
    console.error("AI Fetch Error", error);
    // Fallback to mock data with pagination support
    return getMockData(page, filters.category);
  }
};

const getMockData = (page: number, category: string = 'General') => {
    // Generate deterministic but unique data based on page number
    // This ensures infinite scroll loads "new" data every time the page increments
    const baseSeed = page * 100;
    
    return Array.from({ length: 5 }).map((_, i) => {
        const itemSeed = baseSeed + i;
        const categories = ['Technology', 'Business', 'Science', 'Politics', 'Health', 'World'];
        const cat = category === 'All' ? categories[itemSeed % categories.length] : category;
        
        return {
            id: `news-${Date.now()}-${itemSeed}`,
            title: getHeadline(cat, itemSeed),
            description: "Detailed analysis of the current situation reveals significant shifts in the global landscape, affecting markets and consumer behavior alike. Experts suggest immediate action.",
            source: ["TechCrunch", "BBC", "CNN", "Reuters", "The Verge", "Bloomberg"][itemSeed % 6],
            timeAgo: `${(i % 12) + 1}h ago`,
            category: cat,
            // Use picsum with seed for consistent but unique images per item
            imageUrl: `https://picsum.photos/seed/${itemSeed}/800/600` 
        };
    });
};

const getHeadline = (category: string, seed: number) => {
    const templates = [
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
    return templates[seed % templates.length].replace("{cat}", category);
};