
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.process?.env?.API_KEY) {
    // @ts-ignore
    return window.process.env.API_KEY;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.VITE_API_KEY || (import.meta as any).env.API_KEY;
  }
  return '';
};

export interface ParsedNews {
  headline: string;
  summary: string;
  fullText: string;
  keyFacts: string[];
  category: string;
  reliability: string;
  language: string;
}

export const parseUserSource = async (content: string, type: 'text' | 'image_base64'): Promise<ParsedNews> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following ${type === 'image_base64' ? 'image of a news article' : 'news text'}.
    Extract the following structured data:
    1. Headline (Catchy but accurate)
    2. Summary (2-3 sentences)
    3. Full Body Text (Cleaned up, organized)
    4. Key Facts (Bullet points)
    5. Category (e.g., Politics, Tech, Health)
    6. Reliability Assessment (e.g., "Verified Source", "User Provided - Unverified", "Opinion Piece")
    7. Language (e.g., English, Hindi)

    Return the result strictly as a JSON object with keys: headline, summary, fullText, keyFacts (array), category, reliability, language.
  `;

  try {
    let response;
    if (type === 'image_base64') {
       response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: content } },
              { text: prompt }
            ]
          }
       });
    } else {
       response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
       });
    }

    const text = response.text || "";
    // Clean markdown json if present
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    return data as ParsedNews;

  } catch (error) {
    console.error("Source parsing failed:", error);
    // Fallback
    return {
        headline: "Analysis Failed",
        summary: "Could not process the source.",
        fullText: content.substring(0, 500),
        keyFacts: [],
        category: "Unknown",
        reliability: "Unknown",
        language: "Detected"
    };
  }
};
