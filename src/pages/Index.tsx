import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Zap, Shield, ArrowRight, Target, Clock, DollarSign } from 'lucide-react';
import { tradingStrategies } from '@/data/tradingStrategies';
import { otcPairs } from '@/data/otcPairs';
import Navigation from '@/components/Navigation';

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Automatikus Trading Bot <span className="text-primary">PocketOption</span>-höz
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Haladó technikai indikátorok és trading stratégiák alapján automatikus BUY/SELL signalok.
            Támogatja a scalping, swing és day trading módszereket.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground">
              <a href="/trading" className="flex items-center gap-2">
                Trading indítása
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/templates">Template kezelés</a>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="p-6 text-center bg-gradient-card border shadow-card">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{tradingStrategies.length}</h3>
            <p className="text-muted-foreground">Elérhető stratégia</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-card border shadow-card">
            <div className="p-3 rounded-full bg-success/10 w-fit mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{otcPairs.length}</h3>
            <p className="text-muted-foreground">OTC trading pár</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-card border shadow-card">
            <div className="p-3 rounded-full bg-warning/10 w-fit mx-auto mb-4">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-2xl font-bold mb-2">1-30</h3>
            <p className="text-muted-foreground">Perces timeframe-ek</p>
          </Card>
          
          <Card className="p-6 text-center bg-gradient-card border shadow-card">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Demo/Live</h3>
            <p className="text-muted-foreground">Trading módok</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Strategies Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Elérhető Trading Stratégiák</h3>
              <p className="text-muted-foreground mb-6">
                Válassz a különböző időtávok és kockázati szintek közül
              </p>
            </div>

            <div className="space-y-4">
              {tradingStrategies.slice(0, 3).map((strategy) => (
                <Card key={strategy.id} className="p-4 bg-gradient-card border shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{strategy.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant={strategy.type === 'scalping' ? 'destructive' : strategy.type === 'swing' ? 'secondary' : 'default'}>
                          {strategy.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {strategy.winRate}% win rate
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button asChild variant="outline" className="w-full">
              <a href="/trading">Összes stratégia megtekintése →</a>
            </Button>
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Hogyan működik?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">1</Badge>
                  <div>
                    <h4 className="font-semibold">PocketOption bejelentkezés</h4>
                    <p className="text-sm text-muted-foreground">
                      Add meg az SSID-t a PocketOption fiókodból
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">2</Badge>
                  <div>
                    <h4 className="font-semibold">Stratégia kiválasztása</h4>
                    <p className="text-sm text-muted-foreground">
                      Válassz trading stratégiát és timeframe-et
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">3</Badge>
                  <div>
                    <h4 className="font-semibold">Indikátor elemzés</h4>
                    <p className="text-sm text-muted-foreground">
                      RSI, MACD, Moving Averages, Bollinger Bands elemzése
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">4</Badge>
                  <div>
                    <h4 className="font-semibold">Automatikus trading</h4>
                    <p className="text-sm text-muted-foreground">
                      BUY/SELL signalok és automatikus trade végrehajtás
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-xl font-bold mb-4">Támogatott indikátorok</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'RSI',
                  'MACD',
                  'Moving Averages',
                  'Bollinger Bands',
                  'Stochastic',
                  'Support/Resistance'
                ].map((indicator) => (
                  <Badge key={indicator} variant="secondary" className="justify-center">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
