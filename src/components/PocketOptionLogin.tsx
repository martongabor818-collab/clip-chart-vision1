import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { PocketOptionAPI } from '@/lib/pocketOptionAPI';
import { PocketOptionWebSocket } from '@/lib/pocketOptionWebSocket';
import { PocketOptionCredentials } from '@/types/trading';
import { toast } from '@/hooks/use-toast';

interface PocketOptionLoginProps {
  onConnectionChange: (connected: boolean, api?: PocketOptionAPI | PocketOptionWebSocket) => void;
}

const PocketOptionLogin = ({ onConnectionChange }: PocketOptionLoginProps) => {
  const [ssid, setSsid] = useState('');
  const [isDemo, setIsDemo] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [useWebSocket, setUseWebSocket] = useState(true);

  const handleConnect = async () => {
    if (!ssid.trim()) {
      toast({
        title: "Hiányzó SSID",
        description: "Kérlek add meg az SSID-t!",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      const credentials: PocketOptionCredentials = {
        ssid: ssid.trim(),
        demo: isDemo
      };

      let api: PocketOptionAPI | PocketOptionWebSocket;
      let connected = false;

      if (useWebSocket || ssid.startsWith('42[')) {
        // WebSocket alapú kapcsolat
        console.log('Using WebSocket connection...');
        api = new PocketOptionWebSocket(credentials);
        connected = await (api as PocketOptionWebSocket).connect();
      } else {
        // HTTP alapú kapcsolat
        console.log('Using HTTP connection...');
        api = new PocketOptionAPI(credentials);
        connected = await (api as PocketOptionAPI).validateConnection();
      }

      if (connected) {
        setIsConnected(true);
        
        // Balance lekérése
        const balance = await api.getBalance();
        setCurrentBalance(balance);

        onConnectionChange(true, api);
        
        toast({
          title: "Sikeres csatlakozás!",
          description: `Csatlakozva ${isDemo ? 'demo' : 'live'} módban. Egyenleg: $${balance}`,
        });
      } else {
        throw new Error('Sikertelen kapcsolódás');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Kapcsolódási hiba",
        description: "Nem sikerült csatlakozni a PocketOption-höz. Ellenőrizd az SSID-t!",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setCurrentBalance(null);
    setSsid('');
    onConnectionChange(false);
    
    toast({
      title: "Kapcsolat bontva",
      description: "PocketOption kapcsolat megszakítva",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={isConnected ? "default" : "outline"} 
          className={isConnected ? "bg-gradient-primary text-primary-foreground shadow-glow-success" : ""}
        >
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 mr-2" />
              Csatlakozva
              {currentBalance !== null && (
                <Badge variant="secondary" className="ml-2">
                  ${currentBalance.toFixed(2)} ({isDemo ? 'Demo' : 'Live'})
                </Badge>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 mr-2" />
              PocketOption Bejelentkezés
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PocketOption API Kapcsolat</DialogTitle>
          <DialogDescription>
            Csatlakozz a PocketOption fiókodhoz az SSID használatával
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isConnected ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="ssid">SSID Token</Label>
                <Input
                  id="ssid"
                  type="password"
                  placeholder="Másold be a PocketOption SSID-t vagy WebSocket auth üzenetet"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="demo-mode"
                  checked={isDemo}
                  onCheckedChange={setIsDemo}
                />
                <Label htmlFor="demo-mode">Demo mód</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="websocket-mode"
                  checked={useWebSocket}
                  onCheckedChange={setUseWebSocket}
                />
                <Label htmlFor="websocket-mode">WebSocket kapcsolat</Label>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">SSID megszerzése:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Jelentkezz be a <a href="https://po.trade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PocketOption</a> weboldalára</li>
                  <li>Nyisd meg a böngésző fejlesztői eszközöket (F12)</li>
                  <li>Menj az Application/Storage → Cookies oldalra</li>
                  <li>Keresd meg az "ssid" cookie-t és másold ki az értékét</li>
                  <li className="text-xs italic">Alternatíva: Network fülön keress WebSocket auth üzeneteket (42["auth",...]) és másold ki a teljes üzenetet</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://po.trade', '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PocketOption megnyitása
                </Button>
              </div>
              
              <Button 
                onClick={handleConnect}
                disabled={isConnecting || !ssid.trim()}
                className="w-full"
              >
                {isConnecting ? 'Csatlakozás...' : 'Csatlakozás'}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Sikeres kapcsolat</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Mód:</span>
                  <span className="text-sm font-medium">{isDemo ? 'Demo' : 'Live'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Típus:</span>
                  <span className="text-sm font-medium">{useWebSocket ? 'WebSocket' : 'HTTP'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Egyenleg:</span>
                  <span className="text-sm font-medium">
                    ${currentBalance?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Kapcsolat bontása
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PocketOptionLogin;