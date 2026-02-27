
import { GoogleGenAI, Type } from "@google/genai";

export interface SipsContent {
  headline: string;
  summary: string;
  fullText: string;
  keyTerms: { term: string; definition: string }[];
  quiz: { question: string; options: string[]; answer: string }[];
  discussionPrompts: string[];
}

export const processSipsContent = async (
  input: string, 
  type: 'text' | 'image' | 'url' | 'topic' | 'pdf',
  language: string,
  mode: string,
  advancedMode: boolean = false
): Promise<SipsContent> => {
  // Robust API Key Retrieval
  let apiKey = '';
  
  // 1. Check Vite environment variables (Vercel/Netlify/Local)
  if (import.meta.env.VITE_GEMINI_API_KEY) apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  else if (import.meta.env.VITE_API_KEY) apiKey = import.meta.env.VITE_API_KEY;
  
  // 2. Check process.env (in case of define replacement or Node env)
  else if (typeof process !== 'undefined' && process.env) {
      if (process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY;
      else if (process.env.API_KEY) apiKey = process.env.API_KEY;
      else if (process.env.NEXT_PUBLIC_API_KEY) apiKey = process.env.NEXT_PUBLIC_API_KEY;
  }

  // 3. Check window shim
  if (!apiKey && (window as any).process?.env?.API_KEY) {
      apiKey = (window as any).process.env.API_KEY;
  }

  if (!apiKey) throw new Error("AI Configuration Error: API Key Missing. Please check your environment variables (VITE_GEMINI_API_KEY).");
  
  const ai = new GoogleGenAI({ apiKey });

  let promptContext = "";
  if (type === 'url') promptContext = `Source is a URL: ${input}. Search for the content of this page.`;
  else if (type === 'topic') promptContext = `Source is a Topic: ${input}. Generate deep educational content about this.`;
  else promptContext = `Source Content provided in input.`;

  const systemInstruction = `
    You are SIPS (Smart Interactive Presentation System), an elite educational AI assistant.
    Target Audience: ${advancedMode ? 'University Students / Experts' : 'School Students'}.
    Language: ${language}.
    Presentation Mode: ${mode}.
    Complexity Level: ${advancedMode ? 'Advanced (Technical terminology)' : 'Standard (Simplified for students)'}.
    
    Convert input content into a structured lesson plan. 
    1. 'headline': An engaging title.
    2. 'summary': 2-sentence overview.
    3. 'fullText': The main body formatted in Markdown for clear reading.
    4. 'keyTerms': 3-5 crucial terms with definitions.
    5. 'quiz': 3 multiple-choice questions.
    6. 'discussionPrompts': 2 thought-provoking questions.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      summary: { type: Type.STRING },
      fullText: { type: Type.STRING },
      keyTerms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            definition: { type: Type.STRING }
          },
          required: ["term", "definition"]
        }
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING }
          },
          required: ["question", "options", "answer"]
        }
      },
      discussionPrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["headline", "summary", "fullText", "keyTerms", "quiz", "discussionPrompts"]
  };

  try {
    let response;
    
    if (type === 'image' || type === 'pdf') {
       const mimeType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';
       response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType, data: input } },
              { text: `Process this document as SIPS. ${systemInstruction}` }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema
          }
       });
    } else {
       response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `${systemInstruction}\n\nInput: ${input}\n${promptContext}`,
          config: {
            responseMimeType: "application/json",
            responseSchema,
            tools: type === 'url' || type === 'topic' ? [{ googleSearch: {} }] : undefined
          }
       });
    }

    const text = response.text;
    if (!text) throw new Error("AI returned no content.");
    
    return JSON.parse(text) as SipsContent;

  } catch (error: any) {
    console.error("SIPS AI Error:", error);
    
    if (error.status === 429 || error.message?.includes('429')) {
        throw new Error("AI Service is busy. Please wait a moment before trying again.");
    }

    if (error.message?.includes('API key')) {
        throw new Error("Configuration Error: The AI service could not be authenticated.");
    }

    throw new Error(error.message || "The lesson could not be prepared at this time.");
  }
};
