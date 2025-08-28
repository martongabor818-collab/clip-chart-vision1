import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PocketOptionAPI } from '@/lib/pocketOptionAPI';
import { PocketOptionCredentials } from '@/types/trading';
import { toast } from '@/hooks/use-toast';

interface PocketOptionLoginProps {
  onConnectionChange: (connected: boolean, api?: PocketOptionAPI) => void;
}

const PocketOptionLogin = ({ onConnectionChange }: PocketOptionLoginProps) => {
  const [ssid, setSsid] = useState('');
  const [isDemo, setIsDemo] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = async () => {
    if (!ssid.trim()) {
      toast({
        title: "Hiányzó SSID",
        description: "Add meg a PocketOption SSID-t!",
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
      
      const api = new PocketOptionAPI(credentials);
      const connectionValid = await api.validateConnection();
      
      if (connectionValid) {
        const balance = await api.getBalance();
        setCurrentBalance(balance);
        setIsConnected(true);
        onConnectionChange(true, api);
        setIsDialogOpen(false);
        
        toast({
          title: "Sikeres csatlakozás",
          description: `Egyenleg: $${balance.toFixed(2)} (${isDemo ? 'Demo' : 'Live'})`,
        });
      } else {
        throw new Error('Invalid SSID or connection failed');
      }
    } catch (error) {
      toast({
        title: "Kapcsolódási hiba",
        description: "Ellenőrizd az SSID-t és próbáld újra",
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isConnected ? "outline" : "default"}
          className={isConnected ? "border-green-500 text-green-600" : ""}
        >
          {isConnected ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Csatlakozva ({isDemo ? 'Demo' : 'Live'})
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
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
                  placeholder="Másold be a PocketOption SSID-t"
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
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">SSID megszerzése:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Jelentkezz be a PocketOption weboldalára</li>
                  <li>Nyisd meg a böngésző fejlesztői eszközöket (F12)</li>
                  <li>Menj az Application/Storage → Cookies oldalra</li>
                  <li>Keresd meg az "ssid" cookie-t és másold ki az értékét</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://pocketoption.com', '_blank')}
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