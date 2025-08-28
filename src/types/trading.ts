export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  timeframes: number[]; // in minutes
  indicators: string[];
  type: 'scalping' | 'swing' | 'day';
  riskLevel: 'low' | 'medium' | 'high';
  winRate: number; // percentage
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  confidence: number; // 0-100
  strategy: string;
  asset: string;
  timeframe: number;
  indicators: IndicatorResult[];
  timestamp: Date;
}

export interface IndicatorResult {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number; // 0-100
}

export interface OTCPair {
  id: string;
  name: string;
  symbol: string;
  category: 'forex' | 'crypto' | 'commodities' | 'indices';
  minTradeAmount: number;
  maxTradeAmount: number;
  isActive: boolean;
}

export interface TradeSettings {
  asset: string;
  timeframe: number; // in minutes
  strategy: string;
  amount: number;
}

export interface PocketOptionCredentials {
  ssid: string;
  demo: boolean;
}