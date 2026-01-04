
import { GoogleGenAI } from "@google/genai";
import { cacheService } from './cacheService';

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_API_KEY) return process.env.NEXT_PUBLIC_API_KEY;
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    // @ts-ignore
    if (process.env.API_KEY) return process.env.API_KEY;
  }

  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    if ((import.meta as any).env.VITE_API_KEY) return (import.meta as any).env.VITE_API_KEY;
    if ((import.meta as any).env.API_KEY) return (import.meta as any).env.API_KEY;
  }

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

  const cachedData = cacheService.get(cacheKey);
  if (!navigator.onLine && cachedData) {
      return cachedData;
  }

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn("No API Key found, using mock data.");
        const mock = getMockData(page, filters.category, language);
        cacheService.set(cacheKey, mock);
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
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        text = response.text || "";
    }

    if (!text) throw new Error("Empty response");
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    const arrayStart = cleanText.indexOf('[');
    const arrayEnd = cleanText.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1) {
        const jsonStr = cleanText.substring(arrayStart, arrayEnd + 1);
        const data = JSON.parse(jsonStr);
        cacheService.set(cacheKey, data);
        return data;
    }
    
    throw new Error("Invalid JSON format");

  } catch (error) {
    console.error("AI Fetch Error", error);
    try {
        const rawCache = localStorage.getItem(`nc_cache_${cacheKey}`);
        if (rawCache) {
            return JSON.parse(rawCache).value;
        }
    } catch(e) {}
    return getMockData(page, filters.category, language);
  }
};

export const modifyText = async (text: string, instruction: string) => {
    const cacheKey = `mod_${text.substring(0, 20)}_${instruction}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 500));
            return text;
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
        return text;
    }
};

export const fetchNewspaperContent = async (title: string, config: any) => {
    const { scope, language, pages } = config;
    const cacheKey = `newspaper_${title}_${scope}_${language}_${pages}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    // Define content length based on 'pages' config
    const isFullIssue = pages === 'Full Issue' || pages === '3 Pages';

    try {
        const apiKey = getApiKey();
        const sectionCount = isFullIssue ? 18 : 6; // 18 sections for roughly 5-6 pages (3 sections per page)
        
        // If API Key exists, generate REAL content
        if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `
                You are the Editor-in-Chief of a prestigious newspaper.
                Generate a complete JSON object for a new edition.
                
                Configuration:
                - Newspaper Title: "${title}"
                - Topic Scope: ${scope} (Focus exclusively on this)
                - Language: ${language} (CRITICAL: All titles, content, and captions MUST be in ${language})
                - Edition Size: ${pages} (Generate exactly ${sectionCount} distinct content sections)
                
                JSON Structure:
                {
                    "title": "${title}",
                    "date": "Today's Date in ${language}",
                    "issueNumber": "Random Vol/Issue",
                    "price": "Currency in ${language} context",
                    "sections": [
                        {
                            "type": "headline",
                            "title": "Main Headline in ${language}",
                            "content": null
                        },
                        {
                            "type": "images",
                            "content": ["placeholder_url"],
                            "imageCaption": "Caption in ${language}"
                        },
                        {
                            "type": "text",
                            "title": "Article Headline in ${language}",
                            "content": "Full article body (approx 150 words) in ${language}."
                        },
                        ... more sections based on count ...
                    ]
                }

                Requirements:
                1. Vary the 'type' of sections. Use 'text' for articles, 'graph' for data, 'timeline' for history.
                2. Use the 'googleSearch' tool to find REAL, current news matching the Scope.
                3. The first section must always be a 'headline'.
                4. Include at least one 'images' section using 'https://picsum.photos/seed/{random}/800/400' as the content URL.
                5. Output strictly JSON.
            `;

            let text = "";
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { tools: [{ googleSearch: {} }] }
                });
                text = response.text || "";
            } catch (e) {
                // Fallback without search tools
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt
                });
                text = response.text || "";
            }

            const cleanText = text.replace(/```json|```/g, '').trim();
            const jsonStart = cleanText.indexOf('{');
            const jsonEnd = cleanText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
                const data = JSON.parse(jsonStr);
                cacheService.set(cacheKey, data);
                return data;
            }
        }
    } catch (e) {
        console.error("Newspaper generation failed, falling back to mock", e);
    }

    // --- FALLBACK MOCK (Offline or Error) ---
    // Simulates the request structure even without AI
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const isHindi = language === 'Hindi';
    const isSpanish = language === 'Spanish';
    
    // Simple localized strings for mock
    const t = (en: string, hi: string, es: string) => {
        if (isHindi) return hi;
        if (isSpanish) return es;
        return en;
    };

    const mockSections: any[] = [
        {
            type: 'headline',
            title: t(
                `${scope} Markets Rally to New Highs`, 
                `${scope} बाजार नई ऊंचाइयों पर पहुंचा`,
                `Los mercados de ${scope} alcanzan nuevos máximos`
            ),
            content: null
        },
        {
            type: 'images',
            content: ['https://picsum.photos/seed/news_hero/800/400'],
            imageCaption: t(
                "Experts gather at the global summit.",
                "विशेषज्ञ वैश्विक शिखर सम्मेलन में एकत्र हुए।",
                "Expertos se reúnen en la cumbre mundial."
            )
        },
        {
            type: 'text',
            title: t("Main Story", "मुख्य खबर", "Historia Principal"),
            content: t(
                "In a surprising turn of events, global indicators suggest a massive shift in trends. Analysts are calling this a pivotal moment for the industry.",
                "घटनाओं के एक आश्चर्यजनक मोड़ में, वैश्विक संकेतकों ने रुझानों में बड़े बदलाव का सुझाव दिया है। विश्लेषक इसे उद्योग के लिए एक महत्वपूर्ण क्षण बता रहे हैं।",
                "En un giro sorprendente de los acontecimientos, los indicadores globales sugieren un cambio masivo en las tendencias. Los analistas llaman a esto un momento crucial."
            )
        }
    ];

    if (isFullIssue) {
        mockSections.push(
            {
                type: 'text',
                title: t("Editorial", "संपादकीय", "Editorial"),
                content: t(
                    "We must consider the long-term implications of these changes. Sustainability and ethics should be at the forefront of this revolution.",
                    "हमें इन परिवर्तनों के दीर्घकालिक प्रभावों पर विचार करना चाहिए। स्थिरता और नैतिकता इस क्रांति में सबसे आगे होनी चाहिए।",
                    "Debemos considerar las implicaciones a largo plazo de estos cambios. La sostenibilidad y la ética deben estar a la vanguardia."
                )
            },
            {
                type: 'graph',
                title: t("Market Data", "बाजार के आंकड़े", "Datos de Mercado"),
                content: [
                    { label: 'A', value: 85 },
                    { label: 'B', value: 45 },
                    { label: 'C', value: 60 }
                ]
            },
            {
                type: 'text',
                title: t("Local Updates", "स्थानीय अपडेट", "Actualizaciones Locales"),
                content: t(
                    "Community leaders met yesterday to discuss the new infrastructure projects planned for the city center.",
                    "शहर के केंद्र के लिए नियोजित नई बुनियादी ढांचा परियोजनाओं पर चर्चा करने के लिए कल समुदाय के नेताओं की बैठक हुई।",
                    "Los líderes comunitarios se reunieron ayer para discutir los nuevos proyectos de infraestructura planeados."
                )
            }
        );
    }

    const result = {
        title: title || t("The Daily News", "दैनिक समाचार", "El Diario"),
        date: new Date().toLocaleDateString(),
        issueNumber: `${Math.floor(Math.random() * 500) + 100}`,
        price: t("$2.50", "₹10.00", "€2.50"),
        sections: mockSections
    };
    
    cacheService.set(cacheKey, result);
    return result;
};

export const fetchCategoryInsight = async (query: string) => {
    const cacheKey = `cat_insight_${query}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
        const apiKey = getApiKey();
        if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                Analyze the current news landscape for the category: "${query}".
                Provide a brief summary (max 2 sentences) of what is happening right now in this field.
                Provide 4 short trending keywords or hashtags related to this category.

                Output strictly as JSON:
                {
                  "summary": "string",
                  "keywords": ["string", "string", "string", "string"]
                }
            `;
            
            let text = "";
            try {
                 const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: { tools: [{ googleSearch: {} }] }
                });
                text = response.text || "";
            } catch(e) {
                 const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt
                });
                text = response.text || "";
            }

            const cleanText = text.replace(/```json|```/g, '').trim();
            const jsonStart = cleanText.indexOf('{');
            const jsonEnd = cleanText.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
                const data = JSON.parse(jsonStr);
                cacheService.set(cacheKey, data);
                return data;
            }
        }
    } catch (error) {
        console.error("AI Insight Error", error);
    }

    // Mock Fallback
    const mock = {
        summary: `Recent developments in ${query} highlight significant shifts in global markets and innovation. Experts are monitoring these changes closely.`,
        keywords: ["Innovation", "Global Impact", "Future Trends", "Regulation"]
    };
    cacheService.set(cacheKey, mock);
    return mock;
};
