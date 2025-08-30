import { TemplateManager } from '@/components/TemplateManager';
import Navigation from '@/components/Navigation';

const Templates = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <TemplateManager />
      </main>
    </div>
  );
};

export default Templates;