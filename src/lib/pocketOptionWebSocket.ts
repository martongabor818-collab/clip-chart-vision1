import { PocketOptionCredentials } from '@/types/trading';

export class PocketOptionWebSocket {
  private ws: WebSocket | null = null;
  private ssid: string;
  private demo: boolean;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(credentials: PocketOptionCredentials) {
    this.ssid = credentials.ssid;
    this.demo = credentials.demo;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const wsUrl = `wss://gpfxbshjwscrberhqpmd.supabase.co/functions/v1/pocket-option-websocket?ssid=${encodeURIComponent(this.ssid)}`;
        
        console.log('Connecting to PocketOption WebSocket...');
        this.ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.log('WebSocket connection timeout');
            this.disconnect();
            resolve(false);
          }
        }, 10000);

        this.ws.onopen = () => {
          console.log('WebSocket connection opened');
          clearTimeout(connectionTimeout);
          
          // Küldünk egy ping üzenetet a kapcsolat tesztelésére
          this.sendMessage({ type: 'ping' });
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            if (data.type === 'pocketoption_message') {
              // PocketOption üzenet feldolgozása
              this.handlePocketOptionMessage(data.data);
              
              if (!this.isConnected) {
                this.isConnected = true;
                clearTimeout(connectionTimeout);
                resolve(true);
              }
            } else if (data.type === 'error') {
              console.error('WebSocket error:', data.error);
              clearTimeout(connectionTimeout);
              resolve(false);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(connectionTimeout);
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.isConnected = false;
          
          // Automatikus újracsatlakozás
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), 2000);
          }
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        resolve(false);
      }
    });
  }

  private handlePocketOptionMessage(data: string) {
    console.log('PocketOption message:', data);
    
    // Socket.IO üzenetek feldolgozása
    if (data.startsWith('40')) {
      console.log('Connected to PocketOption');
    } else if (data.startsWith('42')) {
      // JSON üzenet
      try {
        const jsonPart = data.substring(2);
        const parsed = JSON.parse(jsonPart);
        console.log('PocketOption JSON message:', parsed);
      } catch (e) {
        console.log('Failed to parse PocketOption JSON:', e);
      }
    }
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async getBalance(): Promise<number> {
    if (!this.isConnected) return 10000;
    
    // WebSocket-en keresztül kérjük le a balance-t
    this.sendMessage({
      type: 'request',
      data: '42["get_balance"]'
    });
    
    return 10000; // Default érték, amíg a valódi válasz meg nem érkezik
  }

  async placeTrade(
    asset: string, 
    direction: 'CALL' | 'PUT', 
    amount: number, 
    duration: number
  ): Promise<{ success: boolean; tradeId?: string; error?: string }> {
    if (!this.isConnected) {
      return { success: false, error: 'Not connected' };
    }

    const tradeData = {
      asset,
      direction: direction.toLowerCase(),
      amount,
      duration,
      demo: this.demo
    };

    this.sendMessage({
      type: 'trade',
      data: `42["place_trade",${JSON.stringify(tradeData)}]`
    });

    return { success: true, tradeId: 'pending' };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}