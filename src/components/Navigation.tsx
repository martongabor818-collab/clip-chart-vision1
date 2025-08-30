import { Button } from '@/components/ui/button';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <a href="/" className="hover:text-primary transition-colors">
                  PocketOption Trading Bot
                </a>
              </h1>
              <p className="text-sm text-muted-foreground">Automatikus trading signalok</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <Button 
              asChild 
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              size="sm"
            >
              <a href="/">Főoldal</a>
            </Button>
            
            <Button 
              asChild 
              variant={location.pathname === '/templates' ? 'secondary' : 'ghost'}
              size="sm"
            >
              <a href="/templates">Template-ek</a>
            </Button>
            
            <Button 
              asChild 
              variant={location.pathname === '/trading' ? 'default' : 'outline'}
              size="sm"
              className={location.pathname === '/trading' ? 'bg-gradient-primary text-primary-foreground shadow-glow-success' : ''}
            >
              <a href="/trading" className="flex items-center gap-2">
                Trading
                {location.pathname !== '/trading' && <ArrowRight className="w-3 h-3" />}
              </a>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;