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
    if (!text) return getMockData();
    
    try {
        // Sanitize markdown code blocks if present (common issue even with responseMimeType)
        const cleanText = text.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (parseError) {
        console.warn("JSON Parse Failed, using fallback data", parseError);
        return getMockData();
    }

  } catch (error) {
    console.error("AI Fetch Error", error);
    return getMockData();
  }
};

const getMockData = () => [
    {
        id: `err-${Date.now()}-1`,
        title: "Global Markets Rally Amidst Tech Innovation Surge",
        description: "Major indices hit record highs as new AI regulations provide clarity for investors.",
        source: "Financial Times",
        timeAgo: "1h ago",
        category: "Business",
        imageUrl: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: `err-${Date.now()}-2`,
        title: "Breakthrough in Clean Energy Storage Announced",
        description: "Scientists have developed a new battery technology that could revolutionize solar power.",
        source: "Science Daily",
        timeAgo: "3h ago",
        category: "Science",
        imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: `err-${Date.now()}-3`,
        title: "New Space Mission to Mars Confirmed for 2026",
        description: "International space agencies announce joint venture for next-gen rover deployment.",
        source: "SpaceNews",
        timeAgo: "5h ago",
        category: "Technology",
        imageUrl: "https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: `err-${Date.now()}-4`,
        title: "AI Policy Summit Concludes with Historic Agreement",
        description: "World leaders sign first comprehensive treaty on artificial intelligence safety.",
        source: "Global Policy",
        timeAgo: "6h ago",
        category: "Politics",
        imageUrl: "https://images.unsplash.com/photo-1555421689-d68471e18963?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: `err-${Date.now()}-5`,
        title: "Health Tech: Wearables Predict Viral Outbreaks",
        description: "New study shows smartwatches can detect flu symptoms days before they appear.",
        source: "Healthline",
        timeAgo: "8h ago",
        category: "Health",
        imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop"
    }
];