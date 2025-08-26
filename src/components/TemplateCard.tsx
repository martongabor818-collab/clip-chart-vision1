import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2, Edit, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Template } from '@/types/template';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template;
  onDelete: (id: string) => void;
  onEdit?: (template: Template) => void;
}

export function TemplateCard({ template, onDelete, onEdit }: TemplateCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getSignalIcon = () => {
    switch (template.signal) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSignalColor = () => {
    switch (template.signal) {
      case 'BUY':
        return 'bg-success/10 text-success border-success/20';
      case 'SELL':
        return 'bg-danger/10 text-danger border-danger/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleDelete = () => {
    onDelete(template.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="overflow-hidden bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="aspect-video bg-muted/20 overflow-hidden">
          <img
            src={template.imageUrl}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{template.name}</h3>
              <p className="text-xs text-muted-foreground">{template.patternType}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Signal Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className={cn("text-xs border", getSignalColor())}>
              {getSignalIcon()}
              <span className="ml-1">{template.signal}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.trendDirection}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>Added: {template.createdAt.toLocaleDateString()}</p>
            {template.embedding && (
              <p>Embedding: ✓ Ready</p>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}