import { TradingStrategy } from '@/types/trading';

export const tradingStrategies: TradingStrategy[] = [
  {
    id: 'scalping-rsi-bb',
    name: 'RSI + Bollinger Bands Scalping',
    description: 'Gyors scalping stratégia RSI és Bollinger Bands alapján 1-3 perces timeframe-eken',
    timeframes: [1, 2, 3],
    indicators: ['RSI', 'Bollinger Bands', 'Moving Average'],
    type: 'scalping',
    riskLevel: 'high',
    winRate: 68
  },
  {
    id: 'scalping-ema-macd',
    name: 'EMA + MACD Scalping',
    description: 'Exponenciális mozgóátlag és MACD kereszteződések alapján',
    timeframes: [1, 2, 3],
    indicators: ['EMA 9', 'EMA 21', 'MACD'],
    type: 'scalping',
    riskLevel: 'high',
    winRate: 72
  },
  {
    id: 'swing-sma-rsi',
    name: 'SMA + RSI Swing Trading',
    description: 'Középtávú swing trading stratégia 5-15 perces timeframe-eken',
    timeframes: [5, 10, 15],
    indicators: ['SMA 20', 'SMA 50', 'RSI', 'Stochastic'],
    type: 'swing',
    riskLevel: 'medium',
    winRate: 65
  },
  {
    id: 'day-trend-following',
    name: 'Trend Following Strategy',
    description: 'Trend követő stratégia több timeframe elemzéssel',
    timeframes: [5, 10, 15, 30],
    indicators: ['SMA 50', 'SMA 200', 'ADX', 'MACD'],
    type: 'day',
    riskLevel: 'low',
    winRate: 58
  },
  {
    id: 'scalping-stoch-bb',
    name: 'Stochastic + Bollinger Scalping',
    description: 'Stochastic oszcillátor és Bollinger Bands kombinációja',
    timeframes: [1, 2, 3],
    indicators: ['Stochastic', 'Bollinger Bands', 'Volume'],
    type: 'scalping',
    riskLevel: 'high',
    winRate: 70
  },
  {
    id: 'swing-fibonacci',
    name: 'Fibonacci Retracement Swing',
    description: 'Fibonacci szintek és támasz-ellenállás alapú swing trading',
    timeframes: [5, 10, 15],
    indicators: ['Fibonacci', 'Support/Resistance', 'RSI'],
    type: 'swing',
    riskLevel: 'medium',
    winRate: 63
  }
];