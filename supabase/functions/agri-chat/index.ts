import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AGRICULTURAL_SOURCES = [
  "cropsap.maharashtra.gov.in",
  "krishi.maharashtra.gov.in",
  "mahaagri.gov.in",
  "plantwiseplusknowledgebank.org",
  "plantix.net",
  "aps.org",
  "icar.org.in",
];

const SYSTEM_PROMPT = `You are KrishiMitra AI, a multi-agent agricultural intelligence system designed to help Indian farmers, especially those in Maharashtra. You have access to multiple specialized agents:

1. **Vision Agent**: Analyzes crop images for diseases, pests, leaf health, and growth stages
2. **Text/NLP Agent**: Understands farmer queries in English, Hindi, and Marathi
3. **Crop Intelligence Agent**: Makes agronomic decisions, diagnoses diseases, provides crop-specific advice
4. **Weather & Climate Agent**: Provides weather forecasts and climate-based recommendations
5. **Soil & Sensor Agent**: Analyzes soil conditions, pH, NPK levels, moisture
6. **Recommendation Agent**: Generates actionable farming advice (fertilizers, pesticides, irrigation)
7. **Market & Price Agent**: Provides market trends and pricing information

GUIDELINES:
- Provide practical, actionable advice suitable for Indian farming conditions
- Consider local crop varieties and regional practices
- Mention organic/sustainable alternatives when possible
- Be specific about quantities, timings, and application methods
- If analyzing images, describe what you see and provide detailed diagnosis
- For weather queries, provide forecasts and farming recommendations
- Always recommend consulting local agricultural extension officers for severe issues
- Use simple language that farmers can understand
- When relevant, cite sources from Maharashtra Agriculture Department, ICAR, or Plantwise

RESPONSE FORMAT:
- Start with a brief summary
- Provide detailed analysis/recommendations
- Include preventive measures
- Suggest follow-up actions if needed`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  imageBase64?: string;
  hasImage: boolean;
  conversationHistory: ConversationMessage[];
}

async function searchWithTavily(query: string, apiKey: string): Promise<{ results: string[]; sources: string[] }> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} agriculture India Maharashtra crops farming`,
        search_depth: "advanced",
        include_domains: AGRICULTURAL_SOURCES,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error("Tavily search failed:", response.status);
      return { results: [], sources: [] };
    }

    const data = await response.json();
    const results = data.results?.map((r: any) => r.content) || [];
    const sources = data.results?.map((r: any) => r.url) || [];

    return { results, sources };
  } catch (error) {
    console.error("Tavily search error:", error);
    return { results: [], sources: [] };
  }
}

function needsWebSearch(message: string): boolean {
  const searchTriggers = [
    "weather", "temperature", "rain", "forecast", "climate", "humidity", "monsoon",
    "price", "market", "mandi", "rate", "cost",
    "news", "latest", "current", "today",
    "scheme", "subsidy", "government", "pm kisan",
    "where", "when", "how much",
  ];
  
  const lowerMessage = message.toLowerCase();
  return searchTriggers.some(trigger => lowerMessage.includes(trigger));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

    const body: RequestBody = await req.json();
    const { message, imageBase64, hasImage, conversationHistory } = body;

    // Prepare messages for the AI
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Check if we need web search for additional context
    let webSearchContext = "";
    let sources: string[] = [];

    if (needsWebSearch(message) && TAVILY_API_KEY) {
      console.log("Performing web search for:", message);
      const searchResults = await searchWithTavily(message, TAVILY_API_KEY);
      
      if (searchResults.results.length > 0) {
        webSearchContext = `\n\n**Web Search Results (from agricultural sources):**\n${searchResults.results.join("\n\n")}`;
        sources = searchResults.sources;
      }
    }

    // Build the user message content
    let userContent: any;

    if (hasImage && imageBase64) {
      // Vision request with image
      userContent = [
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
        {
          type: "text",
          text: message || "Please analyze this crop image for any diseases, pests, or health issues. Provide detailed diagnosis and treatment recommendations.",
        },
      ];

      if (webSearchContext) {
        userContent.push({
          type: "text",
          text: webSearchContext,
        });
      }
    } else {
      // Text-only request
      userContent = message + webSearchContext;
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    // Call Lovable AI Gateway with Gemini (supports vision + text)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        sources: sources.length > 0 ? sources : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
