
import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // @ts-ignore
  return (typeof window !== 'undefined' && window.process?.env?.API_KEY) || (import.meta as any).env.VITE_API_KEY || '';
};

export const fetchNewsFeed = async (page: number, filters: any) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return getMockData(page, filters.category);
    
    const ai = new GoogleGenAI({ apiKey });
    
    const topic = filters.category === 'All' ? 'latest global news' : `${filters.category} news`;
    const language = filters.language || 'English';

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
      
      Return a JSON array with these properties for each article:
      - id: string (unique)
      - title: string (Translate to ${language})
      - description: string (Short summary in ${language})
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
    return getMockData(page, filters.category);
  }
};

export const modifyText = async (text: string, instruction: string) => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            // Mock Fallback behavior if no API key
            await new Promise(r => setTimeout(r, 1000));
            if (instruction.includes('Simplify')) return "Here is a simplified version of the text. It uses easier words.";
            if (instruction.includes('Catchier')) return "SHOCKING UPDATE: " + text.substring(0, 20) + "...";
            return text + " (Edited)";
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Original Text: "${text}"\n\nInstruction: ${instruction}. Return only the modified text, nothing else.`
        });
        return response.text || text;
    } catch (e) {
        console.error(e);
        return text;
    }
};

const getMockData = (page: number, category: string = 'General') => {
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

export const fetchNewspaperContent = async (title: string, config: any) => {
    // This mocks the generation of a full newspaper structure
    // In a real app, this would use Gemini to generate the specific sections based on the 'scope'
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate extra latency

    return {
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
};
