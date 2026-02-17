
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
  fullText: string; // The simplified, structured reading text
  keyTerms: { term: string; definition: string }[];
  quiz: { question: string; options: string[]; answer: string }[];
  discussionPrompts: string[];
}

export const processSipsContent = async (
  input: string, 
  type: 'text' | 'image' | 'url' | 'topic',
  language: string,
  mode: string,
  advancedMode: boolean = false
): Promise<SipsContent> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  let promptContext = "";
  if (type === 'url') promptContext = `Source is a URL: ${input}. Use Google Search to fetch content.`;
  else if (type === 'topic') promptContext = `Source is a Topic: ${input}. Generate educational content about this.`;
  else promptContext = `Source Content provided below.`;

  const systemPrompt = `
    You are SIPS (Smart Interactive Presentation System), an elite educational AI assistant for teachers.
    Your goal is to convert input content into a classroom-ready presentation format.
    
    Target Audience: ${advancedMode ? 'University Students / Experts' : 'School Students'}.
    Language: ${language}.
    Presentation Mode: ${mode}.
    Complexity Level: ${advancedMode ? 'Advanced (Retain technical jargon and complexity)' : 'Standard (Simplify complex jargon)'}.
    
    Instructions:
    1. Extract/Generate the core content.
    2. ${advancedMode ? 'Retain and explain specific technical terminology/jargon.' : 'Simplify complex jargon unless it is a key term to learn.'}
    3. Structure the 'fullText' for clear, engaging reading aloud. Break into paragraphs.
    4. Extract 3-5 Key Terms with definitions.
    5. Create a short 3-question quiz.
    6. Generate 2 thought-provoking discussion prompts.

    Input Content:
    ${type === 'text' ? input : ''}
    ${promptContext}

    Output strictly as JSON:
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
    if (type === 'image') {
       // Input is base64 string without header
       response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: input } },
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
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(cleanText.substring(jsonStart, jsonEnd + 1));
    }
    throw new Error("Invalid JSON response from AI");

  } catch (error: any) {
    console.error("SIPS AI Error", error);
    throw new Error(error.message || "Failed to process content");
  }
};
