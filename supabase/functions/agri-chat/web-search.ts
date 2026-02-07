const AGRICULTURAL_SOURCES = [
  "cropsap.maharashtra.gov.in",
  "krishi.maharashtra.gov.in",
  "mahaagri.gov.in",
  "plantwiseplusknowledgebank.org",
  "plantix.net",
  "aps.org",
  "icar.org.in",
];

export interface SearchResult {
  results: string[];
  sources: string[];
}

export async function searchWithTavily(
  query: string, 
  apiKey: string
): Promise<SearchResult> {
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

export function needsWebSearch(message: string): boolean {
  const searchTriggers = [
    "weather", "temperature", "rain", "forecast", "climate", "humidity", "monsoon",
    "price", "market", "mandi", "rate", "cost",
    "news", "latest", "current", "today",
    "scheme", "subsidy", "government", "pm kisan",
    "where", "when", "how much",
    // Hindi triggers
    "मौसम", "बारिश", "तापमान", "कीमत", "बाजार",
    // Marathi triggers
    "हवामान", "पाऊस", "भाव", "बाजार",
  ];
  
  const lowerMessage = message.toLowerCase();
  return searchTriggers.some(trigger => lowerMessage.includes(trigger));
}
