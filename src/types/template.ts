export interface Template {
  id: string;
  name: string;
  patternType: PatternType;
  imageUrl: string;
  embedding?: number[];
  signal: 'BUY' | 'SELL' | 'NO TRADE';
  trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
  createdAt: Date;
}

export type PatternType = 
  | 'Bullish Engulfing'
  | 'Bearish Engulfing'
  | 'Hammer'
  | 'Shooting Star'
  | 'Pin Bar'
  | 'Doji'
  | 'Morning Star'
  | 'Evening Star'
  | 'Harami'
  | 'Dark Cloud Cover';

export interface PatternInfo {
  name: PatternType;
  signal: 'BUY' | 'SELL' | 'NO TRADE';
  trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
  description: string;
}

export const PATTERN_DEFINITIONS: PatternInfo[] = [
  {
    name: 'Bullish Engulfing',
    signal: 'BUY',
    trendDirection: 'UP',
    description: 'Strong bullish reversal pattern where a large green candle engulfs the previous red candle'
  },
  {
    name: 'Bearish Engulfing',
    signal: 'SELL',
    trendDirection: 'DOWN',
    description: 'Strong bearish reversal pattern where a large red candle engulfs the previous green candle'
  },
  {
    name: 'Hammer',
    signal: 'BUY',
    trendDirection: 'UP',
    description: 'Bullish reversal pattern with small body and long lower shadow'
  },
  {
    name: 'Shooting Star',
    signal: 'SELL',
    trendDirection: 'DOWN',
    description: 'Bearish reversal pattern with small body and long upper shadow'
  },
  {
    name: 'Pin Bar',
    signal: 'BUY',
    trendDirection: 'UP',
    description: 'Reversal pattern with small body and one long wick'
  },
  {
    name: 'Doji',
    signal: 'NO TRADE',
    trendDirection: 'SIDEWAYS',
    description: 'Indecision pattern where open and close prices are nearly equal'
  },
  {
    name: 'Morning Star',
    signal: 'BUY',
    trendDirection: 'UP',
    description: 'Three-candle bullish reversal pattern'
  },
  {
    name: 'Evening Star',
    signal: 'SELL',
    trendDirection: 'DOWN',
    description: 'Three-candle bearish reversal pattern'
  },
  {
    name: 'Harami',
    signal: 'NO TRADE',
    trendDirection: 'SIDEWAYS',
    description: 'Two-candle pattern indicating potential trend change'
  },
  {
    name: 'Dark Cloud Cover',
    signal: 'SELL',
    trendDirection: 'DOWN',
    description: 'Bearish reversal pattern with two contrasting candles'
  }
];