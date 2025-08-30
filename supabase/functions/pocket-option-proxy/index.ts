import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

  try {
    const { endpoint, method = 'GET', ssid, body } = await req.json();
    
    console.log('PocketOption API request:', { endpoint, method, ssid: ssid?.substring(0, 20) + '...' });
    
    // SSID feldolgozás - ha JSON formátumban van, dekódoljuk
    let cookieValue = ssid;
    if (ssid && ssid.startsWith('42[')) {
      try {
        // WebSocket message formátum dekódolása
        const parsed = JSON.parse(ssid.substring(2));
        if (parsed[0] === 'auth' && parsed[1]?.sessionToken) {
          cookieValue = parsed[1].sessionToken;
          console.log('Extracted session token from SSID');
        }
      } catch (e) {
        console.log('Failed to parse SSID, using as is');
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://po.trade/cabinet/demo-quick-high-low',
    };
    
    if (cookieValue) {
      headers['Cookie'] = `ssid=${cookieValue}`;
    }

    const response = await fetch(`https://po.trade${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('PocketOption API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PocketOption API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `API Error: ${response.status} - ${errorText.substring(0, 200)}...`,
        status: response.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: response.ok,
      data,
      status: response.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in pocket-option-proxy function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});