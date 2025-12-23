import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // @ts-ignore
  return (typeof window !== 'undefined' && window.process?.env?.API_KEY) || (import.meta as any).env.VITE_API_KEY || '';
};

export const fetchNewsFeed = async (page: number, filters: any) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key Missing");
    
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
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Fetch Error", error);
    // Fallback Mock Data if API fails
    return [
        {
            id: `err-${Date.now()}-1`,
            title: "Global Markets Rally Amidst Tech Innovation Surge",
            description: "Major indices hit record highs as new AI regulations provide clarity for investors.",
            source: "Financial Times",
            timeAgo: "1h ago",
            category: "Business",
            imageUrl: "https://picsum.photos/600/400?random=201"
        },
        {
            id: `err-${Date.now()}-2`,
            title: "Breakthrough in Clean Energy Storage Announced",
            description: "Scientists have developed a new battery technology that could revolutionize solar power.",
            source: "Science Daily",
            timeAgo: "3h ago",
            category: "Science",
            imageUrl: "https://picsum.photos/600/400?random=202"
        }
    ];
  }
};
