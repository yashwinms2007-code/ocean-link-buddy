const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateAIResponse = async (messages: AIChatMessage[]): Promise<string> => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes("sk-or-v1")) {
     // If the key is just the prefix or placeholder, we skip
     if (OPENROUTER_API_KEY.length < 20) throw new Error("Missing API Key");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin, // Optional, for OpenRouter analytics
        "X-Title": "Mitra Marine", // Optional, for OpenRouter analytics
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: messages,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    throw new Error("Invalid response from OpenRouter");
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

export const getSystemPrompt = (lang: string, weatherData: any, satData: any): string => {
  const isHindi = lang === "hi";
  const isKannada = lang === "kn";

  return `
    You are MITRA, a highly specialized Maritime Intelligence Assistant for fishers in Karnataka, India.
    Your mission is to ensure maritime safety and maximize fishing yield using official data.

    CURRENT CONTEXT:
    - Coast: Mangalore / Karnataka
    - Weather: ${weatherData.status} (Wave: ${weatherData.waveHeight}m, Wind: ${weatherData.windSpeed}km/h)
    - Fishing Conditions: ${satData.bestFishingZone} (Confidence: ${satData.highConfidenceZones})

    GUIDELINES:
    1. Respond in ${isHindi ? "Hindi (Hindi script)" : isKannada ? "Kannada (Kannada script)" : "English"}.
    2. Be concise, professional, and helpful. Use maritime terminology correctly.
    3. If weather is DANGER/MODERATE, prioritize safety warnings.
    4. Proactively suggest PFZ (Potential Fishing Zones) coordinate checks.
    5. Mention SOS protocols (1554) if the user is in distress.
    6. Keep responses friendly but authoritative on safety.
    
    Current Date: ${new Date().toLocaleDateString()}
  `;
};
