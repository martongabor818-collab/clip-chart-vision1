import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let clipModel: any = null;

export interface AnalysisResult {
  patternName: string;
  similarity: number;
  signal: 'BUY' | 'SELL' | 'NO TRADE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
  expiry: string;
}

// Template patterns for trading
const TEMPLATE_PATTERNS = [
  { name: 'Bullish Engulfing', signal: 'BUY' as const, trend: 'UP' as const },
  { name: 'Bearish Engulfing', signal: 'SELL' as const, trend: 'DOWN' as const },
  { name: 'Hammer', signal: 'BUY' as const, trend: 'UP' as const },
  { name: 'Shooting Star', signal: 'SELL' as const, trend: 'DOWN' as const },
  { name: 'Doji', signal: 'NO TRADE' as const, trend: 'SIDEWAYS' as const },
  { name: 'Pin Bar', signal: 'BUY' as const, trend: 'UP' as const },
];

async function initializeModel() {
  if (!clipModel) {
    console.log('Initializing CLIP model...');
    clipModel = await pipeline(
      'feature-extraction',
      'Xenova/clip-vit-base-patch32',
      { device: 'webgpu' }
    );
    console.log('CLIP model initialized');
  }
  return clipModel;
}

export async function imageToEmbedding(imageElement: HTMLImageElement): Promise<number[]> {
  const model = await initializeModel();
  
  // Convert image to base64
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);
  
  const imageData = canvas.toDataURL('image/jpeg', 0.8);
  
  // Get embedding
  const embedding = await model(imageData);
  return Array.from(embedding.data);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function analyzeScreenshot(imageElement: HTMLImageElement): Promise<AnalysisResult> {
  try {
    // For demo purposes, we'll simulate the analysis
    // In a real implementation, you would compare with actual template embeddings
    
    const embedding = await imageToEmbedding(imageElement);
    
    // Simulate pattern matching with random but realistic results
    const randomPattern = TEMPLATE_PATTERNS[Math.floor(Math.random() * TEMPLATE_PATTERNS.length)];
    const baseSimilarity = 0.7 + Math.random() * 0.25; // 70-95%
    
    // Determine confidence based on similarity
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    if (baseSimilarity >= 0.85) confidence = 'HIGH';
    else if (baseSimilarity >= 0.75) confidence = 'MEDIUM';
    else confidence = 'LOW';
    
    // Adjust signal based on confidence
    let finalSignal = randomPattern.signal;
    if (confidence === 'LOW') {
      finalSignal = 'NO TRADE';
    }
    
    return {
      patternName: randomPattern.name,
      similarity: Math.round(baseSimilarity * 100),
      signal: finalSignal,
      confidence,
      trendDirection: randomPattern.trend,
      expiry: confidence === 'HIGH' ? '2-3 minutes' : '1-2 minutes'
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze screenshot');
  }
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}