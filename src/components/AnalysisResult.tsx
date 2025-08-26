import { TrendingUp, TrendingDown, Minus, Clock, Target, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AnalysisResult } from '@/lib/clipAnalysis';

interface AnalysisResultProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  uploadedImage?: string;
}

export function AnalysisResult({ result, onNewAnalysis, uploadedImage }: AnalysisResultProps) {
  const getSignalIcon = () => {
    switch (result.signal) {
      case 'BUY':
        return <TrendingUp className="w-6 h-6" />;
      case 'SELL':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getSignalColor = () => {
    switch (result.signal) {
      case 'BUY':
        return 'text-success bg-success/10 border-success/20 shadow-glow-success';
      case 'SELL':
        return 'text-danger bg-danger/10 border-danger/20 shadow-glow-danger';
      default:
        return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getConfidenceColor = () => {
    switch (result.confidence) {
      case 'HIGH':
        return 'bg-success text-success-foreground';
      case 'MEDIUM':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="p-6 bg-gradient-card border shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Analysis Complete</h2>
          <Badge className={getConfidenceColor()}>
            {result.confidence} Confidence
          </Badge>
        </div>

        {/* Signal Display */}
        <div className={cn(
          "flex items-center justify-center p-8 rounded-lg border transition-all duration-300",
          getSignalColor()
        )}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getSignalIcon()}
            </div>
            <h3 className="text-3xl font-bold mb-2">{result.signal}</h3>
            <p className="text-lg opacity-80">{result.patternName}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Similarity</span>
            </div>
            <p className="text-2xl font-bold">{result.similarity}%</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Trend</span>
            </div>
            <p className="text-2xl font-bold">{result.trendDirection}</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Expiry</span>
            </div>
            <p className="text-2xl font-bold">{result.expiry}</p>
          </div>
        </div>
      </Card>

      {/* Uploaded Image */}
      {uploadedImage && (
        <Card className="p-4 bg-gradient-card border shadow-card">
          <h3 className="font-semibold mb-3">Analyzed Screenshot</h3>
          <div className="relative rounded-lg overflow-hidden bg-muted/50">
            <img
              src={uploadedImage}
              alt="Uploaded screenshot"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onNewAnalysis} className="flex-1">
          Analyze New Screenshot
        </Button>
        <Button variant="outline" className="flex-1">
          View Details
        </Button>
      </div>
    </div>
  );
}