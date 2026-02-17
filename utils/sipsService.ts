
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

const getMockSipsContent = (topic: string): SipsContent => ({
  headline: `Guide to ${topic || "Selected Topic"} (Mock)`,
  summary: "This is a generated fallback lesson plan because the AI service is currently busy or offline. It demonstrates the structure of a SIPS presentation.",
  fullText: `
    ## Introduction
    Welcome to this lesson on ${topic || "the topic"}. In this session, we will explore the fundamental concepts and understand why this subject matters in today's world.

    ## Core Concepts
    At the heart of this subject lies a set of principles that govern how it functions. Understanding these core ideas is essential for mastering the topic. We will break down complex jargon into simple, digestible parts.

    ## Real-World Application
    Theory is important, but application is key. We see examples of this in various industries, from technology to healthcare. For instance, recent studies show that applying these principles can improve efficiency by up to 25%.

    ## Conclusion
    To wrap up, remember that this field is constantly evolving. Staying curious and continuing to learn is the best way to stay ahead.
  `,
  keyTerms: [
    { term: "Concept A", definition: "A fundamental building block of the theory." },
    { term: "Mechanism", definition: "The process by which the system operates." },
    { term: "Outcome", definition: "The final result or consequence of the process." }
  ],
  quiz: [
    { question: "What is the main focus of this lesson?", options: ["History", "Core Concepts", "Mathematics"], answer: "Core Concepts" },
    { question: "How much can efficiency improve?", options: ["10%", "25%", "50%"], answer: "25%" },
    { question: "What is key to staying ahead?", options: ["Staying curious", "Sleeping", "Eating"], answer: "Staying curious" }
  ],
  discussionPrompts: [
    "How would you apply these concepts in your daily life?",
    "What are the potential risks associated with this technology?"
  ]
});

export const processSipsContent = async (
  input: string, 
  type: 'text' | 'image' | 'url' | 'topic' | 'pdf',
  language: string,
  mode: string,
  advancedMode: boolean = false
): Promise<SipsContent> => {
  const apiKey = getApiKey();
  
  // Fallback immediately if no key
  if (!apiKey) {
      console.warn("No API Key, using mock data.");
      return new Promise(resolve => setTimeout(() => resolve(getMockSipsContent(type === 'topic' ? input : 'Uploaded Content')), 1500));
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
       // Input is base64 string without header
       // For PDF, we treat it similarly using the appropriate mime type if model supports it, 
       // otherwise we rely on text extraction or multimodal vision if converted to image.
       // Here we assume multimodal support for 'application/pdf' or 'image/jpeg'
       const mimeType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';
       
       // Use gemini-2.5-flash-image for visual/document tasks
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
       // Use gemini-3-flash-preview for text/search tasks
       response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: systemPrompt,
          config: type === 'url' || type === 'topic' ? { tools: [{ googleSearch: {} }] } : undefined
       });
    }

    const text = response.text || "";
    // Robust cleaning: Remove markdown code blocks and any text before/after JSON
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
    
    // Check for Quota Exceeded (429) or other API errors
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
        console.warn("Quota exceeded, falling back to mock data.");
        // Return mock data to keep app usable
        return getMockSipsContent(type === 'topic' ? input : 'Content');
    }

    throw new Error(error.message || "Failed to process content");
  }
};
