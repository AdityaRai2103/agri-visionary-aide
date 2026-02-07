import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { audioBase64 } = await req.json();

    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    // Convert base64 to blob
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for ElevenLabs API
    const formData = new FormData();
    formData.append("file", new Blob([bytes], { type: "audio/webm" }), "audio.webm");
    formData.append("model_id", "scribe_v2");

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    // Detect language from the transcription
    const text = data.text || "";
    const language = detectLanguage(text);

    return new Response(
      JSON.stringify({
        text,
        language,
        words: data.words || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("STT error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple language detection based on character patterns
function detectLanguage(text: string): string {
  // Hindi/Devanagari script
  const hindiPattern = /[\u0900-\u097F]/;
  // Marathi also uses Devanagari
  const marathiPattern = /[\u0900-\u097F]/;
  
  if (hindiPattern.test(text)) {
    // Check for common Marathi words/patterns
    const marathiWords = ["आहे", "आणि", "मी", "तू", "हे", "ते", "का", "कसे", "माझे"];
    const hasMarathiWords = marathiWords.some(word => text.includes(word));
    
    if (hasMarathiWords) {
      return "mr"; // Marathi
    }
    return "hi"; // Hindi
  }
  
  return "en"; // Default to English
}
