
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
  const apiKey = getApiKey();
  
  // Explicitly fail if no key is found so the UI can report it
  if (!apiKey) {
      throw new Error("API Key is missing. Please configure VITE_API_KEY or process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let promptContext = "";
  if (type === 'url') promptContext = `Source is a URL: ${input}. Use Google Search to fetch content.`;
  else if (type === 'topic') promptContext = `Source is a Topic: ${input}. Generate educational content about this.`;
  else promptContext = `Source Content provided below.`;

  const systemPrompt = `
    You are SIPS (Smart Interactive Presentation System), an elite educational AI assistant for teachers.
    Your goal is to convert input content into a classroom-ready presentation format.
    
    Target Audience: ${advancedMode ? 'University Students / Experts' : 'School Students'}.
    Language: ${language} (Ensure all content is in this language).
    Presentation Mode: ${mode}.
    Complexity Level: ${advancedMode ? 'Advanced (Retain technical jargon and complexity)' : 'Standard (Simplify complex jargon)'}.
    
    Instructions:
    1. Extract/Generate the core content.
    2. ${advancedMode ? 'Retain and explain specific technical terminology/jargon.' : 'Simplify complex jargon unless it is a key term to learn.'}
    3. Structure the 'fullText' for clear, engaging reading aloud. Break into paragraphs using markdown headers (##).
    4. Extract 3-5 Key Terms with definitions.
    5. Create a short 3-question quiz.
    6. Generate 2 thought-provoking discussion prompts.

    Input Content:
    ${type === 'text' ? input : ''}
    ${promptContext}

    IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no introductory text.
    JSON Structure:
    {
      "headline": "Engaging Title",
      "summary": "2 sentence overview",
      "fullText": "The main content formatted for reading...",
      "keyTerms": [{"term": "Word", "definition": "Meaning"}],
      "quiz": [{"question": "Q?", "options": ["A","B","C"], "answer": "A"}],
      "discussionPrompts": ["Question 1", "Question 2"]
    }
  `;

  try {
    let response;
    
    if (type === 'image' || type === 'pdf') {
       const mimeType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';
       response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType, data: input } },
              { text: systemPrompt }
            ]
          }
       });
    } else {
       response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: systemPrompt,
          config: type === 'url' || type === 'topic' ? { tools: [{ googleSearch: {} }] } : undefined
       });
    }

    const text = response.text || "";
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(cleanText);
    }
    
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        throw new Error("AI returned invalid format. Please try again.");
    }

  } catch (error: any) {
    console.error("SIPS AI Error", error);
    
    // Throw descriptive errors instead of falling back to mock data
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
        throw new Error("AI Service is busy (Rate Limit Exceeded). Please try again in a moment.");
    }

    if (error.message && error.message.includes('API key')) {
        throw new Error("Invalid API Key. Please check your configuration.");
    }

    throw new Error(error.message || "Failed to process content");
  }
};
