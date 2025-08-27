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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
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
      
      const template: Template = {
        id: Date.now().toString(),
        name,
        patternType,
        imageUrl,
        // Don't store embedding - it will be computed on-demand
        signal,
        trendDirection,
        createdAt: new Date()
      };

      const templates = this.getTemplates();
      templates.push(template);
      this.saveTemplates(templates);
      
      return template;
    } catch (error) {
      console.error('Error adding template:', error);
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