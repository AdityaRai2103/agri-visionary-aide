import type { AgentType } from "./types.ts";

interface RoutingResult {
  agents: AgentType[];
  shouldAskClarification: boolean;
  queryType: string;
}

// Keywords for each agent type
const AGENT_KEYWORDS: Record<AgentType, string[]> = {
  orchestrator: [], // Always active
  vision: ["image", "photo", "picture", "see", "look", "leaf", "color", "spot", "तस्वीर", "फोटो", "चित्र"],
  text: [], // Always active for text queries
  crop: [
    "crop", "plant", "grow", "harvest", "seed", "variety", "yield",
    "rice", "wheat", "cotton", "sugarcane", "soybean", "onion", "tomato",
    "फसल", "पौधा", "बीज", "उपज", "पीक", "बियाणे"
  ],
  weather: [
    "weather", "rain", "temperature", "climate", "humidity", "monsoon", "forecast", "season",
    "drought", "flood", "heat", "cold",
    "मौसम", "बारिश", "तापमान", "हवामान", "पाऊस"
  ],
  soil: [
    "soil", "ph", "npk", "moisture", "fertilizer", "nutrient", "compost", "manure",
    "irrigation", "water", "drainage",
    "मिट्टी", "खाद", "पानी", "माती", "खत", "पाणी"
  ],
  recommend: [], // Always active for recommendations
  market: [
    "price", "market", "sell", "cost", "mandi", "rate", "buyer", "profit",
    "कीमत", "बाजार", "बेचना", "भाव", "विकणे"
  ],
};

// Questions that need clarification
const AMBIGUOUS_PATTERNS = [
  /^(what|why|how|when|which|where)\s+(is|are|should|can|do)/i,
  /problem|issue|help|disease|pest/i,
  /not growing|dying|yellow|brown|wilting/i,
  // Hindi patterns
  /क्या|कैसे|कब|क्यों|कौन/i,
  // Marathi patterns
  /काय|कसे|केव्हा|का|कोण/i,
];

const SIMPLE_QUERY_PATTERNS = [
  /\bprice of\b|\bmarket rate\b|\bcurrent price\b/i,
  /\bweather forecast\b|\btemperature today\b/i,
  /\bhow to grow\b|\bhow to plant\b/i,
];

export function routeToAgents(
  message: string, 
  hasImage: boolean
): RoutingResult {
  const lowerMessage = message.toLowerCase();
  const agents: Set<AgentType> = new Set(["orchestrator", "text", "recommend"]);
  
  // Always add vision agent if image is present
  if (hasImage) {
    agents.add("vision");
    agents.add("crop");
  }

  // Check each agent's keywords
  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    if (keywords.length === 0) continue;
    
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        agents.add(agent as AgentType);
        break;
      }
    }
  }

  // Determine if clarification is needed
  let shouldAskClarification = false;
  
  // Check if it's a simple query that doesn't need clarification
  const isSimpleQuery = SIMPLE_QUERY_PATTERNS.some(pattern => pattern.test(message));
  
  if (!isSimpleQuery) {
    // Check for ambiguous patterns
    shouldAskClarification = AMBIGUOUS_PATTERNS.some(pattern => pattern.test(message));
    
    // Also ask for clarification if the message is very short and vague
    if (message.split(/\s+/).length < 5 && !hasImage) {
      shouldAskClarification = true;
    }
  }

  // Determine query type
  let queryType = "general";
  if (hasImage) queryType = "visual_diagnosis";
  else if (agents.has("weather")) queryType = "weather";
  else if (agents.has("market")) queryType = "market";
  else if (agents.has("soil")) queryType = "soil_analysis";
  else if (agents.has("crop")) queryType = "crop_advice";

  return {
    agents: Array.from(agents),
    shouldAskClarification,
    queryType,
  };
}
