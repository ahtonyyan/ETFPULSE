import { GoogleGenAI, Type } from "@google/genai";
import { ETFData, MarketSummary, MarketTrend } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const analyzeMarket = async (etfs: ETFData[]): Promise<MarketSummary> => {
  // Filter top movers to reduce token count and focus analysis
  const topGainers = [...etfs].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...etfs].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const topVolume = [...etfs].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const dataContext = JSON.stringify({
    topGainers: topGainers.map(e => ({ s: e.symbol, p: e.changePercent, v: e.volume })),
    topLosers: topLosers.map(e => ({ s: e.symbol, p: e.changePercent, v: e.volume })),
    mostActive: topVolume.map(e => ({ s: e.symbol, v: e.volume })),
  });

  const prompt = `
    You are a senior financial analyst for a real-time trading desk. 
    Analyze the following snapshot of global ETF market data.
    
    Data: ${dataContext}
    
    Provide:
    1. The overall market trend (BULLISH, BEARISH, or NEUTRAL).
    2. A brief, professional 2-sentence summary of the market sentiment, highlighting key sectors or rotations.
    3. A list of 3 key ticker symbols that are driving the narrative today.

    Return JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING, enum: [MarketTrend.BULLISH, MarketTrend.BEARISH, MarketTrend.NEUTRAL] },
            summary: { type: Type.STRING },
            keyMovers: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["trend", "summary", "keyMovers"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MarketSummary;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      trend: MarketTrend.NEUTRAL,
      summary: "AI Analysis currently unavailable. Monitoring real-time data feeds.",
      keyMovers: ["SPY", "QQQ"],
    };
  }
};