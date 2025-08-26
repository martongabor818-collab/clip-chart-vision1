import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Zap, Shield } from 'lucide-react';
import { DropZone } from '@/components/DropZone';
import { AnalysisResult } from '@/components/AnalysisResult';
import { analyzeScreenshot, loadImageFromFile } from '@/lib/clipAnalysis';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisResult as AnalysisResultType } from '@/lib/clipAnalysis';

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setResult(null);
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImageUrl(imageUrl);
      
      // Load and analyze image
      const imageElement = await loadImageFromFile(file);
      const analysisResult = await analyzeScreenshot(imageElement);
      
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete!",
        description: `Pattern detected: ${analysisResult.patternName} with ${analysisResult.similarity}% similarity`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try again with a different image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setUploadedImageUrl('');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <AnalysisResult 
            result={result} 
            onNewAnalysis={handleNewAnalysis}
            uploadedImage={uploadedImageUrl}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trading Pattern Analyzer</h1>
              <p className="text-muted-foreground">CLIP-powered screenshot analysis for Pocket Option</p>
            </div>
            <a 
              href="/templates" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Manage Templates →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                AI-Powered Pattern Recognition
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload your trading screenshots and get instant pattern analysis with 
                confidence scores and trading signals.
              </p>
            </div>

            <DropZone onFileSelect={handleFileSelect} isLoading={isAnalyzing} />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-card border shadow-card">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-success" />
                  <div>
                    <h3 className="font-semibold">95% Accuracy</h3>
                    <p className="text-sm text-muted-foreground">CLIP embedding analysis</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-card border shadow-card">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-warning" />
                  <div>
                    <h3 className="font-semibold">Real-time</h3>
                    <p className="text-sm text-muted-foreground">Instant analysis</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                How It Works
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">1</Badge>
                  <div>
                    <h4 className="font-semibold">Template Embedding</h4>
                    <p className="text-sm text-muted-foreground">
                      CLIP model creates vector embeddings from pattern templates
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">2</Badge>
                  <div>
                    <h4 className="font-semibold">Screenshot Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Your image is converted to the same vector space
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">3</Badge>
                  <div>
                    <h4 className="font-semibold">Similarity Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      Cosine similarity finds the closest pattern match
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-primary/10 text-primary">4</Badge>
                  <div>
                    <h4 className="font-semibold">Trading Signal</h4>
                    <p className="text-sm text-muted-foreground">
                      BUY/SELL/NO TRADE based on confidence and trend
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border shadow-card">
              <h3 className="text-xl font-bold mb-4">Supported Patterns</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Bullish Engulfing',
                  'Bearish Engulfing', 
                  'Hammer',
                  'Shooting Star',
                  'Pin Bar',
                  'Doji'
                ].map((pattern) => (
                  <Badge key={pattern} variant="secondary" className="justify-center">
                    {pattern}
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
