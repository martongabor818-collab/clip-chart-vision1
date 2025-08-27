import { Template, PatternType } from '@/types/template';
import { imageToEmbedding, loadImageFromFile } from './clipAnalysis';

const STORAGE_KEY = 'trading_templates';

export class TemplateStorage {
  static getTemplates(): Template[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const templates = JSON.parse(stored);
      return templates.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      }));
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  static saveTemplates(templates: Template[]): void {
    try {
      const data = JSON.stringify(templates);
      if (data.length > 4.5 * 1024 * 1024) { // 4.5MB safety limit
        throw new Error('Data too large for localStorage');
      }
      localStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
      console.error('Error saving templates:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      throw error;
    }
  }

  static async addTemplate(
    file: File, 
    name: string, 
    patternType: PatternType,
    signal: 'BUY' | 'SELL' | 'NO TRADE',
    trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS'
  ): Promise<Template> {
    try {
      // Create image URL
      const imageUrl = URL.createObjectURL(file);
      
      // Generate embedding
      const imageElement = await loadImageFromFile(file);
      const embedding = await imageToEmbedding(imageElement);
      
      // Compress embedding to save space (reduce precision)
      const compressedEmbedding = embedding.map(val => Math.round(val * 10000) / 10000);
      
      const template: Template = {
        id: Date.now().toString(),
        name,
        patternType,
        imageUrl,
        embedding: compressedEmbedding,
        signal,
        trendDirection,
        createdAt: new Date()
      };

      const templates = this.getTemplates();
      
      // Check localStorage size before adding
      const testStorage = JSON.stringify([...templates, template]);
      if (testStorage.length > 4.5 * 1024 * 1024) { // 4.5MB limit
        throw new Error('Storage quota exceeded. Please delete some templates first.');
      }
      
      templates.push(template);
      this.saveTemplates(templates);
      
      return template;
    } catch (error) {
      console.error('Error adding template:', error);
      if (error instanceof Error && error.message.includes('quota')) {
        throw new Error('Storage full. Please delete existing templates first.');
      }
      throw new Error('Failed to add template');
    }
  }

  static deleteTemplate(id: string): void {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    this.saveTemplates(filtered);
    
    // Cleanup object URL
    const template = templates.find(t => t.id === id);
    if (template?.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(template.imageUrl);
    }
  }

  static updateTemplate(id: string, updates: Partial<Template>): void {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      this.saveTemplates(templates);
    }
  }

  static getTemplatesByPattern(patternType: PatternType): Template[] {
    return this.getTemplates().filter(t => t.patternType === patternType);
  }

  static clearAllTemplates(): void {
    const templates = this.getTemplates();
    
    // Cleanup all object URLs
    templates.forEach(template => {
      if (template.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(template.imageUrl);
      }
    });
    
    localStorage.removeItem(STORAGE_KEY);
  }

  static exportTemplates(): string {
    const templates = this.getTemplates();
    // Remove embeddings and blob URLs for export (they're too large and not portable)
    const exportData = templates.map(t => ({
      name: t.name,
      patternType: t.patternType,
      signal: t.signal,
      trendDirection: t.trendDirection,
      createdAt: t.createdAt
    }));
    
    return JSON.stringify(exportData, null, 2);
  }
}