import { TemplateManager } from '@/components/TemplateManager';

const Templates = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Template Administration</h1>
              <p className="text-muted-foreground">
                Configure and manage your trading pattern templates
              </p>
            </div>
            <a 
              href="/" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Analysis
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <TemplateManager />
      </main>
    </div>
  );
};

export default Templates;