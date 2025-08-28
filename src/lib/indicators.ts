import { IndicatorResult } from '@/types/trading';

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export class TechnicalIndicators {
  
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    const macdLine = emaFast - emaSlow;
    const macdHistory = prices.slice(-signalPeriod).map((_, i) => {
      const idx = prices.length - signalPeriod + i;
      return this.calculateEMA(prices.slice(0, idx + 1), fastPeriod) - 
             this.calculateEMA(prices.slice(0, idx + 1), slowPeriod);
    });
    
    const signalLine = this.calculateEMA(macdHistory, signalPeriod);
    const histogram = macdLine - signalLine;
    
    return { macdLine, signalLine, histogram };
  }

  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const relevantPrices = prices.slice(-period);
    return relevantPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  static calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const relevantPrices = prices.slice(-period);
    
    const variance = relevantPrices.reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * multiplier),
      middle: sma,
      lower: sma - (stdDev * multiplier)
    };
  }

  static calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14) {
    if (closes.length < kPeriod) return { k: 50, d: 50 };
    
    const recentHighs = highs.slice(-kPeriod);
    const recentLows = lows.slice(-kPeriod);
    const currentClose = closes[closes.length - 1];
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    // Calculate %D (3-period SMA of %K)
    const kValues = [];
    for (let i = Math.max(0, closes.length - 3); i < closes.length; i++) {
      const periodHighs = highs.slice(Math.max(0, i - kPeriod + 1), i + 1);
      const periodLows = lows.slice(Math.max(0, i - kPeriod + 1), i + 1);
      const periodClose = closes[i];
      
      const periodHighest = Math.max(...periodHighs);
      const periodLowest = Math.min(...periodLows);
      
      kValues.push(((periodClose - periodLowest) / (periodHighest - periodLowest)) * 100);
    }
    
    const d = kValues.reduce((sum, val) => sum + val, 0) / kValues.length;
    
    return { k, d };
  }

  static generateSignal(
    currentPrice: number,
    priceHistory: PriceData[],
    strategy: string
  ): IndicatorResult[] {
    const closes = priceHistory.map(p => p.close);
    const highs = priceHistory.map(p => p.high);
    const lows = priceHistory.map(p => p.low);
    
    const results: IndicatorResult[] = [];
    
    // RSI
    const rsi = this.calculateRSI(closes);
    results.push({
      name: 'RSI',
      value: rsi,
      signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'NEUTRAL',
      strength: Math.abs(50 - rsi) * 2
    });
    
    // MACD
    const macd = this.calculateMACD(closes);
    results.push({
      name: 'MACD',
      value: macd.histogram,
      signal: macd.histogram > 0 ? 'BUY' : 'SELL',
      strength: Math.min(Math.abs(macd.histogram) * 10, 100)
    });
    
    // Moving Averages
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    results.push({
      name: 'SMA Cross',
      value: sma20 - sma50,
      signal: sma20 > sma50 ? 'BUY' : 'SELL',
      strength: Math.min(Math.abs((sma20 - sma50) / sma50) * 1000, 100)
    });
    
    // Bollinger Bands
    const bb = this.calculateBollingerBands(closes);
    const bbPosition = (currentPrice - bb.lower) / (bb.upper - bb.lower);
    results.push({
      name: 'Bollinger Bands',
      value: bbPosition,
      signal: bbPosition > 0.8 ? 'SELL' : bbPosition < 0.2 ? 'BUY' : 'NEUTRAL',
      strength: bbPosition > 0.8 ? (bbPosition - 0.8) * 500 : bbPosition < 0.2 ? (0.2 - bbPosition) * 500 : 0
    });
    
    // Stochastic
    const stoch = this.calculateStochastic(highs, lows, closes);
    results.push({
      name: 'Stochastic',
      value: stoch.k,
      signal: stoch.k > 80 ? 'SELL' : stoch.k < 20 ? 'BUY' : 'NEUTRAL',
      strength: stoch.k > 80 ? stoch.k - 80 : stoch.k < 20 ? 20 - stoch.k : 0
    });
    
    return results;
  }
}