import { useCallback, useState } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function DropZone({ onFileSelect, isLoading }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
        isDragOver ? "border-primary bg-primary/5 scale-105" : "border-muted",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "p-4 rounded-full bg-muted transition-all duration-300",
          isDragOver && "bg-primary/20 shadow-glow-success"
        )}>
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isLoading ? 'Analyzing Screenshot...' : 'Upload Trading Screenshot'}
          </h3>
          <p className="text-muted-foreground">
            {isLoading 
              ? 'CLIP model is processing your image...'
              : 'Drag & drop your Pocket Option screenshot or click to browse'
            }
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Supports PNG, JPG, JPEG
          </p>
        </div>
        
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileImage className="w-4 h-4" />
            <span>Chart screenshots work best</span>
          </div>
        )}
      </div>
    </div>
  );
}