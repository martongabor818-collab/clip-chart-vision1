import { OTCPair } from '@/types/trading';

export const otcPairs: OTCPair[] = [
  // Forex pairs
  {
    id: 'eurusd-otc',
    name: 'EUR/USD (OTC)',
    symbol: 'EURUSD_OTC',
    category: 'forex',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'gbpusd-otc',
    name: 'GBP/USD (OTC)',
    symbol: 'GBPUSD_OTC',
    category: 'forex',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'usdjpy-otc',
    name: 'USD/JPY (OTC)',
    symbol: 'USDJPY_OTC',
    category: 'forex',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'audusd-otc',
    name: 'AUD/USD (OTC)',
    symbol: 'AUDUSD_OTC',
    category: 'forex',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  
  // Crypto pairs
  {
    id: 'btcusd-otc',
    name: 'Bitcoin (OTC)',
    symbol: 'BTCUSD_OTC',
    category: 'crypto',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'ethusd-otc',
    name: 'Ethereum (OTC)',
    symbol: 'ETHUSD_OTC',
    category: 'crypto',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'ltcusd-otc',
    name: 'Litecoin (OTC)',
    symbol: 'LTCUSD_OTC',
    category: 'crypto',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  
  // Commodities
  {
    id: 'gold-otc',
    name: 'Gold (OTC)',
    symbol: 'GOLD_OTC',
    category: 'commodities',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'silver-otc',
    name: 'Silver (OTC)',
    symbol: 'SILVER_OTC',
    category: 'commodities',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'oil-otc',
    name: 'Oil (OTC)',
    symbol: 'OIL_OTC',
    category: 'commodities',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  
  // Indices
  {
    id: 'spx500-otc',
    name: 'S&P 500 (OTC)',
    symbol: 'SPX500_OTC',
    category: 'indices',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  },
  {
    id: 'nas100-otc',
    name: 'NASDAQ 100 (OTC)',
    symbol: 'NAS100_OTC',
    category: 'indices',
    minTradeAmount: 1,
    maxTradeAmount: 1000,
    isActive: true
  }
];