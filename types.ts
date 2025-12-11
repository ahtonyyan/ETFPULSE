export interface ETFData {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number; // Dollar change
  changePercent: number; // Percentage change
  volume: number;
  history: number[]; // Array of prices for sparkline
  prevPrice: number; // To track tick direction
}

export enum MarketTrend {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
}

export interface MarketSummary {
  trend: MarketTrend;
  summary: string;
  keyMovers: string[];
}