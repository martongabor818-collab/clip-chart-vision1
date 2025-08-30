import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const ssid = url.searchParams.get('ssid');
    
    if (!ssid) {
      return new Response("SSID required", { status: 400 });
    }

    console.log('WebSocket connection request with SSID:', ssid.substring(0, 20) + '...');

    const { socket, response } = Deno.upgradeWebSocket(req);
    
    // PocketOption WebSocket kapcsolat
    const pocketSocket = new WebSocket("wss://po.trade/socket.io/?EIO=4&transport=websocket");
    
    pocketSocket.onopen = () => {
      console.log('Connected to PocketOption WebSocket');
      
      // Ha az SSID WebSocket formátumban van, küldjük el
      if (ssid.startsWith('42[')) {
        pocketSocket.send(ssid);
      } else {
        // Hagyományos auth üzenet küldése
        const authMessage = `42["auth",{"sessionToken":"${ssid}","uid":"","lang":"en","currentUrl":"cabinet/demo-quick-high-low","isChart":1}]`;
        pocketSocket.send(authMessage);
      }
      
      // Ping message küldése a kapcsolat fenntartásához
      setInterval(() => {
        if (pocketSocket.readyState === WebSocket.OPEN) {
          pocketSocket.send('2');
        }
      }, 25000);
    };

    pocketSocket.onmessage = (event) => {
      console.log('PocketOption message:', event.data);
      
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'pocketoption_message',
          data: event.data
        }));
      }
    };

    pocketSocket.onerror = (error) => {
      console.error('PocketOption WebSocket error:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          error: 'PocketOption connection failed'
        }));
      }
    };

    pocketSocket.onclose = () => {
      console.log('PocketOption WebSocket closed');
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Client message:', message);
        
        // Üzenet továbbítása a PocketOption-hez
        if (pocketSocket.readyState === WebSocket.OPEN) {
          if (message.type === 'ping') {
            pocketSocket.send('2');
          } else if (message.data) {
            pocketSocket.send(message.data);
          }
        }
      } catch (error) {
        console.error('Error parsing client message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Client WebSocket closed');
      if (pocketSocket.readyState === WebSocket.OPEN) {
        pocketSocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
    };

    return response;
  } catch (error) {
    console.error('Error in WebSocket handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});