import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildSystemPrompt } from "./prompt-builder.ts";
import { searchWithTavily, needsWebSearch } from "./web-search.ts";
import { routeToAgents } from "./agent-router.ts";
import type { RequestBody, ChatResponse, AgentType } from "./types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { message, imageBase64, hasImage, language = "en", conversationHistory } = body;

    // Route to appropriate agents
    const routing = routeToAgents(message, hasImage);
    console.log("Routing decision:", routing);

    // Build system prompt with active agents
    const systemPrompt = buildSystemPrompt(language, routing.agents);

    // Prepare messages for the AI
    const messages: any[] = [
      { role: "system", content: systemPrompt },
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
        const languageLabel = language === "hi" ? "वेब खोज परिणाम" : 
                              language === "mr" ? "वेब शोध निकाल" : 
                              "Web Search Results";
        webSearchContext = `\n\n**${languageLabel}:**\n${searchResults.results.join("\n\n")}`;
        sources = searchResults.sources;
      }
    }

    // Build the user message content
    let userContent: any;

    if (hasImage && imageBase64) {
      // Vision request with image
      const visionPrompt = language === "hi" 
        ? "कृपया इस फसल की तस्वीर का विश्लेषण करें। किसी भी बीमारी, कीट, या स्वास्थ्य समस्या की पहचान करें।"
        : language === "mr"
        ? "कृपया या पिकाच्या प्रतिमेचे विश्लेषण करा. कोणताही रोग, कीड किंवा आरोग्य समस्या ओळखा."
        : "Please analyze this crop image for any diseases, pests, or health issues. Provide detailed diagnosis and treatment recommendations.";

      userContent = [
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
        {
          type: "text",
          text: message || visionPrompt,
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

    // Call Lovable AI Gateway with Gemini
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 3000,
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
    const assistantResponse = data.choices?.[0]?.message?.content || 
      (language === "hi" ? "क्षमा करें, मैं जवाब नहीं दे पाया। कृपया दोबारा प्रयास करें।" :
       language === "mr" ? "माफ करा, मी उत्तर देऊ शकलो नाही. कृपया पुन्हा प्रयत्न करा." :
       "I apologize, but I couldn't generate a response. Please try again.");

    // Always include reference sources - merge web search sources with default agricultural references
    const defaultSources = [
      "https://cropsap.maharashtra.gov.in",
      "https://krishi.maharashtra.gov.in",
      "https://mahaagri.gov.in",
      "https://icar.org.in",
    ];
    const allSources = sources.length > 0 
      ? [...new Set([...sources, ...defaultSources])]
      : defaultSources;

    const chatResponse: ChatResponse = {
      response: assistantResponse,
      sources: allSources,
      detectedLanguage: language,
    };

    return new Response(
      JSON.stringify(chatResponse),
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
