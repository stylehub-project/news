
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

// Helper to recover article data from cache if page is refreshed
export const getArticleById = (id: string) => {
    try {
        // Scan all feed caches in local storage to find the article object
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('nc_cache_feed_')) {
                const raw = localStorage.getItem(key);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (data.value && Array.isArray(data.value)) {
                        const found = data.value.find((a: any) => a.id === id);
                        if (found) return found;
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Failed to recover article from cache", e);
    }
    
    // Fallback if not found (prevents crash)
    return {
        id,
        title: "News Article",
        description: "The content of this article is loading. Please wait a moment...",
        source: "News Club",
        timeAgo: "Today",
        category: "General",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop"
    };
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

// Fallback Mock Article Generator
const getMockFullArticle = (title: string, language: string) => {
    const isHindi = language === 'Hindi' || language === 'hi';
    
    if (isHindi) {
        return `
# ${title}

**नई दिल्ली:** हालिया घटनाक्रम में, "${title}" से संबंधित चर्चाएँ तेज हो गई हैं। उद्योग के विशेषज्ञों और नीति निर्माताओं का मानना है कि इसके दूरगामी परिणाम होंगे।

## मुख्य बिंदु
* **तेजी से बदलाव:** यह स्थिति तेजी से विकसित हो रही है, और अगले कुछ घंटों में नए अपडेट की उम्मीद है।
* **बाजार पर प्रभाव:** विश्लेषकों का अनुमान है कि इससे संबंधित बाजार सूचकांकों में 5-10% का बदलाव आ सकता है।
* **जनता की प्रतिक्रिया:** सोशल मीडिया पर लोगों की रुचि बढ़ रही है और बहस छिड़ गई है।

> "यह उद्योग के लिए एक महत्वपूर्ण मोड़ है," ग्लोबल इनसाइट के वरिष्ठ विश्लेषक ने कहा। "हितधारक अब कैसे प्रतिक्रिया देते हैं, यह अगले दशक की दिशा तय करेगा।"

## विस्तृत विश्लेषण
इस घटना के मूल कारणों का पता हाल ही में नियामक ढांचे और तकनीकी प्रगति में हुए बदलावों से लगाया जा सकता है। जैसे-जैसे कंपनियां इन परिवर्तनों के अनुकूल हो रही हैं, हम पूरे पारिस्थितिकी तंत्र में इसके प्रभाव को देख रहे हैं।

### भविष्य के निहितार्थ
1. **नियामक जांच:** आने वाले महीनों में कड़े नियमों की उम्मीद है।
2. **नवाचार:** यह प्रतिस्पर्धियों के बीच नवाचार की एक नई लहर को बढ़ावा दे सकता है।
3. **उपभोक्ता व्यवहार:** उपभोक्ता भावनाओं में बदलाव पहले से ही देखे जा रहे हैं।

## निष्कर्ष
जैसे-जैसे कहानी आगे बढ़ेगी, न्यूज़ क्लब आपको रीयल-टाइम अपडेट प्रदान करना जारी रखेगा। अधिक जानकारी के लिए हमारे साथ बने रहें।
        `;
    }

    return `
# ${title}

**GLOBAL UPDATE:** In a significant development regarding "${title}", industry experts and policymakers are closely monitoring the situation. Early reports suggest this could have a lasting impact on the sector.

## Key Highlights
* **Rapid Developments:** The situation is evolving quickly, with new updates expected within the hour.
* **Market Impact:** Analysts predict a 5-10% shift in related market indices.
* **Public Reaction:** Social media trends indicate growing public interest and debate.

> "This is a pivotal moment for the industry," says Jane Doe, a senior analyst at Global Insight. "How stakeholders react now will define the trajectory for the next decade."

## Deep Dive Analysis
The underlying causes of this event can be traced back to recent shifts in regulatory frameworks and technological advancements. As companies adapt to these changes, we are seeing a ripple effect across the ecosystem.

### Future Implications
1. **Regulatory Scrutiny:** Expect tighter regulations in the coming months.
2. **Innovation:** This may spur a new wave of innovation as competitors race to adapt.
3. **Consumer Behavior:** Shifts in consumer sentiment are already being observed.

## Conclusion
As the story unfolds, News Club will continue to provide real-time updates. Stay tuned for our evening broadcast where we will discuss this in further detail.
    `;
};

export const fetchNewsFeed = async (page: number, filters: any) => {
  const language = filters.language || 'English';
  // Include searchField in cache key to differentiate filtered searches
  const cacheKey = `feed_${filters.category}_${filters.sort}_${page}_${language}_${filters.searchField || 'all'}`;

  const cachedData = cacheService.get(cacheKey);
  if (!navigator.onLine && cachedData) {
      return cachedData;
  }

  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        const mock = getMockData(page, filters.category, language);
        cacheService.set(cacheKey, mock);
        return mock;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const topic = filters.category === 'All' ? 'latest global news' : `${filters.category} news`;
    const searchField = filters.searchField || 'General';

    // Enhance prompt based on the specific filter selected
    let filterInstruction = "";
    if (searchField === 'Headlines') filterInstruction = `Ensure the keywords '${filters.category}' appear specifically in the HEADLINE.`;
    else if (searchField === 'Description') filterInstruction = `Ensure the articles have details or descriptions related to '${filters.category}', even if the headline is broader.`;
    else if (searchField === 'Source') filterInstruction = `Find news specifically from the source/publisher '${filters.category}' or related entities.`;
    else if (searchField === 'Topics') filterInstruction = `Find news strictly about the topic '${filters.category}'.`;

    const filterContext = `
      Focus on: ${filters.filter || 'General'}
      Specific Search Field Constraint: ${searchField} - ${filterInstruction}
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

export const fetchFullArticle = async (title: string, language: string = 'English') => {
    const cacheKey = `article_full_${title}_${language}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
        const apiKey = getApiKey();
        
        // If no API key, use mock immediately
        if (!apiKey) {
            const mock = getMockFullArticle(title, language);
            cacheService.set(cacheKey, mock);
            return mock;
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Write a full, detailed news article based on the headline: "${title}".
            Language: ${language}.
            Tone: Professional, journalistic, objective.
            Length: Approximately 400 words.
            Structure:
            - Engaging Lead Paragraph
            - Key Details and Facts
            - Background Context
            - Quotes (simulate expert opinions)
            - Future Implications
            
            Return ONLY the article text. Use markdown for formatting (bold for key terms, new lines for paragraphs).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        const text = response.text;
        if (!text) throw new Error("Empty content generated");
        
        cacheService.set(cacheKey, text);
        return text;
    } catch (e) {
        console.warn("Error fetching full article, using mock fallback:", e);
        // Fallback to mock content instead of error message
        const mock = getMockFullArticle(title, language);
        cacheService.set(cacheKey, mock);
        return mock;
    }
};

export const fetchTopicOverview = async (topic: string, language: string = 'English') => {
    const cacheKey = `topic_overview_${topic}_${language}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return cached;

    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("No Key");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Provide a comprehensive overview and analysis of the topic: "${topic}".
            Language: ${language}.
            Output strictly as JSON:
            {
                "summary": "A concise 2-3 sentence executive summary.",
                "keyPoints": ["Point 1", "Point 2", "Point 3"],
                "tags": ["Tag1", "Tag2", "Tag3"]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        const text = response.text || "";
        const cleanText = text.replace(/```json|```/g, '').trim();
        const jsonStart = cleanText.indexOf('{');
        const jsonEnd = cleanText.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = cleanText.substring(jsonStart, jsonEnd + 1);
            const data = JSON.parse(jsonStr);
            cacheService.set(cacheKey, data);
            return data;
        }
        throw new Error("Invalid JSON");
    } catch (e) {
        return {
            summary: "Detailed overview unavailable. Please try a different search term.",
            keyPoints: [],
            tags: []
        };
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
