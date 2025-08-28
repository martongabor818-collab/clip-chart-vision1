import { PocketOptionCredentials, TradingSignal, OTCPair } from '@/types/trading';

export class PocketOptionAPI {
  private ssid: string;
  private demo: boolean;
  private baseUrl: string = 'https://po.trade';

  constructor(credentials: PocketOptionCredentials) {
    this.ssid = credentials.ssid;
    this.demo = credentials.demo;
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test connection with the provided SSID
      const response = await fetch(`${this.baseUrl}/api/v2/profile`, {
        method: 'GET',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('PocketOption connection failed:', error);
      return false;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/profile`, {
        method: 'GET',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch balance');
      
      const data = await response.json();
      return this.demo ? data.demo_balance : data.live_balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async placeTrade(
    asset: string, 
    direction: 'CALL' | 'PUT', 
    amount: number, 
    duration: number
  ): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/trade`, {
        method: 'POST',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset,
          direction: direction.toLowerCase(),
          amount,
          duration,
          demo: this.demo
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }
      
      const data = await response.json();
      return { success: true, tradeId: data.trade_id };
    } catch (error) {
      console.error('Failed to place trade:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async getAssetPrice(asset: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/price/${asset}`, {
        method: 'GET',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch price');
      
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error('Failed to get asset price:', error);
      throw error;
    }
  }

  async getOpenTrades(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/trades/open`, {
        method: 'GET',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch open trades');
      
      const data = await response.json();
      return data.trades || [];
    } catch (error) {
      console.error('Failed to get open trades:', error);
      return [];
    }
  }

  async getTradeHistory(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/trades/history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Cookie': `ssid=${this.ssid}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch trade history');
      
      const data = await response.json();
      return data.trades || [];
    } catch (error) {
      console.error('Failed to get trade history:', error);
      return [];
    }
  }
}