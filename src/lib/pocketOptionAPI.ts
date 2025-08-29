import { PocketOptionCredentials } from '@/types/trading';
import { supabase } from '@/integrations/supabase/client';

export class PocketOptionAPI {
  private ssid: string;
  private demo: boolean;

  constructor(credentials: PocketOptionCredentials) {
    this.ssid = credentials.ssid;
    this.demo = credentials.demo;
  }

  private async callAPI(endpoint: string, method: string = 'GET', body?: any) {
    try {
      const { data, error } = await supabase.functions.invoke('pocket-option-proxy', {
        body: {
          endpoint,
          method,
          ssid: this.ssid,
          body
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      return { success: false, error: error.message };
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const result = await this.callAPI('/api/v2/profile');
      return result.success && result.data?.result;
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const result = await this.callAPI('/api/v2/profile');
      
      if (result.success && result.data) {
        return this.demo ? result.data.demo_balance : result.data.live_balance;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  async placeTrade(
    asset: string, 
    direction: 'CALL' | 'PUT', 
    amount: number, 
    duration: number
  ): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    try {
      const tradeData = {
        asset,
        direction: direction.toLowerCase(),
        amount,
        duration,
        demo: this.demo
      };

      const result = await this.callAPI('/api/v2/trade', 'POST', tradeData);
      
      if (result.success && result.data?.trade_id) {
        return { success: true, tradeId: result.data.trade_id };
      } else {
        return { 
          success: false, 
          error: result.data?.message || result.error || 'Trade failed' 
        };
      }
    } catch (error) {
      console.error('Failed to place trade:', error);
      return { success: false, error: error.message };
    }
  }

  async getAssetPrice(asset: string): Promise<number> {
    try {
      const result = await this.callAPI(`/api/v2/price/${asset}`);
      
      if (result.success && result.data) {
        return result.data.price || 0;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get asset price:', error);
      return 0;
    }
  }

  async getOpenTrades(): Promise<any[]> {
    try {
      const result = await this.callAPI('/api/v2/trades/open');
      
      if (result.success && result.data) {
        return result.data.trades || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get open trades:', error);
      return [];
    }
  }

  async getTradeHistory(limit: number = 50): Promise<any[]> {
    try {
      const result = await this.callAPI(`/api/v2/trades/history?limit=${limit}`);
      
      if (result.success && result.data) {
        return result.data.trades || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get trade history:', error);
      return [];
    }
  }
}