import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { tradingStrategies } from '@/data/tradingStrategies';
import { otcPairs } from '@/data/otcPairs';
import { TradingStrategy, OTCPair, TradingSignal, TradeSettings } from '@/types/trading';
import { TechnicalIndicators } from '@/lib/indicators';
import { PocketOptionAPI } from '@/lib/pocketOptionAPI';
import PocketOptionLogin from '@/components/PocketOptionLogin';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const Trading = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<OTCPair | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(5);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [currentSignal, setCurrentSignal] = useState<TradingSignal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [pocketAPI, setPocketAPI] = useState<PocketOptionAPI | null>(null);

  const analyzeSignal = async () => {
    if (!selectedStrategy || !selectedAsset) {
      toast({
        title: "Hiányos beállítások",
        description: "Válassz ki stratégiát és eszközt az elemzéshez!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate market data (in real implementation, fetch from API)
      const mockPriceHistory = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() - (100 - i) * 60000,
        open: 1.1000 + Math.random() * 0.01,
        high: 1.1000 + Math.random() * 0.015,
        low: 1.1000 - Math.random() * 0.015,
        close: 1.1000 + Math.random() * 0.01,
        volume: Math.random() * 1000000
      }));
      
      const currentPrice = mockPriceHistory[mockPriceHistory.length - 1].close;
      const indicators = TechnicalIndicators.generateSignal(
        currentPrice,
        mockPriceHistory,
        selectedStrategy.id
      );
      
      // Calculate overall signal based on indicators
      const buySignals = indicators.filter(i => i.signal === 'BUY').length;
      const sellSignals = indicators.filter(i => i.signal === 'SELL').length;
      const avgStrength = indicators.reduce((sum, i) => sum + i.strength, 0) / indicators.length;
      
      let finalAction: 'BUY' | 'SELL' | 'NO_TRADE' = 'NO_TRADE';
      if (buySignals > sellSignals && avgStrength > 60) {
        finalAction = 'BUY';
      } else if (sellSignals > buySignals && avgStrength > 60) {
        finalAction = 'SELL';
      }
      
      const signal: TradingSignal = {
        action: finalAction,
        confidence: Math.round(avgStrength),
        strategy: selectedStrategy.name,
        asset: selectedAsset.name,
        timeframe: selectedTimeframe,
        indicators,
        timestamp: new Date()
      };
      
      setCurrentSignal(signal);
      
      toast({
        title: "Elemzés kész",
        description: `${signal.action} signal ${signal.confidence}% magabiztossággal`,
        variant: signal.action === 'NO_TRADE' ? 'default' : 'default'
      });
      
    } catch (error) {
      toast({
        title: "Elemzési hiba",
        description: "Nem sikerült elemezni a piaci adatokat",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSignalColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600';
      case 'SELL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleConnectionChange = (connected: boolean, api?: PocketOptionAPI) => {
    setIsConnected(connected);
    setPocketAPI(api || null);
  };

  const executeTrade = async () => {
    if (!pocketAPI || !currentSignal || !selectedAsset) return;

    try {
      const direction = currentSignal.action === 'BUY' ? 'CALL' : 'PUT';
      const result = await pocketAPI.placeTrade(
        selectedAsset.symbol,
        direction,
        tradeAmount,
        selectedTimeframe * 60 // convert minutes to seconds
      );

      if (result.success) {
        toast({
          title: "Trade elküldve",
          description: `${currentSignal.action} pozíció nyitva $${tradeAmount} összeggel`,
        });
      } else {
        toast({
          title: "Trade hiba",
          description: result.error || "Nem sikerült elküldeni a trade-et",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Trade hiba",
        description: "Hálózati hiba a trade küldése során",
        variant: "destructive"
      });
    }
  };

  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="h-5 w-5" />;
      case 'SELL': return <TrendingDown className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Trading Signals</h1>
          <p className="text-muted-foreground">
            Indikátor alapú elemzés és automatikus trading signalok
          </p>
          <PocketOptionLogin onConnectionChange={handleConnectionChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Trading Stratégia</h2>
            <div className="space-y-4">
              <div>
                <Label>Stratégia választása</Label>
                <Select
                  value={selectedStrategy?.id || ''}
                  onValueChange={(value) => {
                    const strategy = tradingStrategies.find(s => s.id === value);
                    setSelectedStrategy(strategy || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz stratégiát" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradingStrategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStrategy && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedStrategy.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={selectedStrategy.type === 'scalping' ? 'default' : 'secondary'}>
                      {selectedStrategy.type}
                    </Badge>
                    <Badge variant={selectedStrategy.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                      {selectedStrategy.riskLevel} risk
                    </Badge>
                    <Badge variant="outline">
                      {selectedStrategy.winRate}% win rate
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm">Indikátorok:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStrategy.indicators.map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Asset & Timeframe Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Trading Beállítások</h2>
            <div className="space-y-4">
              <div>
                <Label>OTC Eszköz</Label>
                <Select
                  value={selectedAsset?.id || ''}
                  onValueChange={(value) => {
                    const asset = otcPairs.find(a => a.id === value);
                    setSelectedAsset(asset || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Válassz eszközt" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(
                      otcPairs.reduce((acc, pair) => {
                        if (!acc[pair.category]) acc[pair.category] = [];
                        acc[pair.category].push(pair);
                        return acc;
                      }, {} as Record<string, OTCPair[]>)
                    ).map(([category, pairs]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          {category.toUpperCase()}
                        </div>
                        {pairs.map((pair) => (
                          <SelectItem key={pair.id} value={pair.id}>
                            {pair.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Timeframe (perc)</Label>
                <Select
                  value={selectedTimeframe.toString()}
                  onValueChange={(value) => setSelectedTimeframe(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStrategy?.timeframes.map((tf) => (
                      <SelectItem key={tf} value={tf.toString()}>
                        {tf} perc
                      </SelectItem>
                    )) || [1, 2, 3, 5, 10, 15, 30].map((tf) => (
                      <SelectItem key={tf} value={tf.toString()}>
                        {tf} perc
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trade összeg ($)</Label>
                <Input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  min={selectedAsset?.minTradeAmount || 1}
                  max={selectedAsset?.maxTradeAmount || 1000}
                />
              </div>

              <Button 
                onClick={analyzeSignal}
                disabled={!selectedStrategy || !selectedAsset || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Elemzés...' : 'Jel Generálás'}
              </Button>
            </div>
          </Card>

          {/* Signal Display */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Aktuális Signal</h2>
            
            {currentSignal ? (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 text-lg font-semibold ${getSignalColor(currentSignal.action)}`}>
                  {getSignalIcon(currentSignal.action)}
                  <span>{currentSignal.action}</span>
                  <Badge variant="outline">
                    {currentSignal.confidence}%
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div><strong>Eszköz:</strong> {currentSignal.asset}</div>
                  <div><strong>Stratégia:</strong> {currentSignal.strategy}</div>
                  <div><strong>Timeframe:</strong> {currentSignal.timeframe} perc</div>
                  <div><strong>Időpont:</strong> {currentSignal.timestamp.toLocaleTimeString()}</div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Indikátor részletek:</Label>
                  <div className="space-y-2">
                    {currentSignal.indicators.map((indicator, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{indicator.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getSignalColor(indicator.signal)}`}>
                            {indicator.signal}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(indicator.strength)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSignal.action !== 'NO_TRADE' && (
                  <Button 
                    onClick={executeTrade}
                    className={`w-full ${currentSignal.action === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    disabled={!isConnected}
                  >
                    {isConnected ? `${currentSignal.action} - $${tradeAmount}` : 'PocketOption csatlakozás szükséges'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Válassz stratégiát és eszközt a signal generálásához</p>
              </div>
            )}
          </Card>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">PocketOption kapcsolat nincs beállítva</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              A trading funkciók használatához csatlakozz a PocketOption API-hoz.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Trading;