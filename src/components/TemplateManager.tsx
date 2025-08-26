import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Upload, Download, Trash2, AlertCircle } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { TemplateStorage } from '@/lib/templateStorage';
import { Template, PatternType, PATTERN_DEFINITIONS } from '@/types/template';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>(() => TemplateStorage.getTemplates());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<PatternType | ''>('');
  const { toast } = useToast();

  const refreshTemplates = useCallback(() => {
    setTemplates(TemplateStorage.getTemplates());
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      if (!templateName) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setTemplateName(baseName);
      }
    }
  }, [templateName]);

  const handleAddTemplate = async () => {
    if (!selectedFile || !templateName || !selectedPattern) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select an image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const patternInfo = PATTERN_DEFINITIONS.find(p => p.name === selectedPattern);
      if (!patternInfo) throw new Error('Invalid pattern selected');

      await TemplateStorage.addTemplate(
        selectedFile,
        templateName,
        selectedPattern,
        patternInfo.signal,
        patternInfo.trendDirection
      );

      refreshTemplates();
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Template Added",
        description: `${templateName} has been successfully added and processed`,
      });
    } catch (error) {
      console.error('Failed to add template:', error);
      toast({
        title: "Error",
        description: "Failed to add template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTemplateName('');
    setSelectedPattern('');
  };

  const handleDeleteTemplate = (id: string) => {
    TemplateStorage.deleteTemplate(id);
    refreshTemplates();
    toast({
      title: "Template Deleted",
      description: "Template has been removed successfully",
    });
  };

  const handleClearAll = () => {
    TemplateStorage.clearAllTemplates();
    refreshTemplates();
    toast({
      title: "All Templates Cleared",
      description: "All templates have been removed",
    });
  };

  const handleExport = () => {
    const exportData = TemplateStorage.exportTemplates();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Templates Exported",
      description: "Template configuration has been downloaded",
    });
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.patternType]) {
      acc[template.patternType] = [];
    }
    acc[template.patternType].push(template);
    return acc;
  }, {} as Record<PatternType, Template[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Manager</h1>
          <p className="text-muted-foreground">
            Manage your trading pattern templates for CLIP analysis
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={templates.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          {templates.length > 0 && (
            <Button variant="outline" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Template</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="file">Template Image</Label>
                  <div className={cn(
                    "mt-2 border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                    selectedFile ? "border-primary bg-primary/5" : "border-muted"
                  )}>
                    <input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      {selectedFile ? (
                        <div>
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="max-h-32 mx-auto mb-2 rounded"
                          />
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Template Name */}
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Strong Bullish Engulfing Example"
                  />
                </div>

                {/* Pattern Type */}
                <div>
                  <Label>Pattern Type</Label>
                  <Select value={selectedPattern} onValueChange={(value: PatternType) => setSelectedPattern(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PATTERN_DEFINITIONS.map((pattern) => (
                        <SelectItem key={pattern.name} value={pattern.name}>
                          <div className="flex items-center gap-2">
                            <span>{pattern.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {pattern.signal}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPattern && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {PATTERN_DEFINITIONS.find(p => p.name === selectedPattern)?.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddTemplate} 
                    disabled={!selectedFile || !templateName || !selectedPattern || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? 'Processing...' : 'Add Template'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="text-2xl font-bold">{templates.length}</div>
          <div className="text-sm text-muted-foreground">Total Templates</div>
        </Card>
        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="text-2xl font-bold">{Object.keys(groupedTemplates).length}</div>
          <div className="text-sm text-muted-foreground">Pattern Types</div>
        </Card>
        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="text-2xl font-bold">
            {templates.filter(t => t.signal === 'BUY').length}
          </div>
          <div className="text-sm text-muted-foreground">Buy Signals</div>
        </Card>
        <Card className="p-4 bg-gradient-card border shadow-card">
          <div className="text-2xl font-bold">
            {templates.filter(t => t.signal === 'SELL').length}
          </div>
          <div className="text-sm text-muted-foreground">Sell Signals</div>
        </Card>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-card border shadow-card">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first trading pattern template to start using CLIP analysis
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Template
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([patternType, patternTemplates]) => (
            <div key={patternType}>
              <h3 className="text-lg font-semibold mb-3">{patternType}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {patternTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}