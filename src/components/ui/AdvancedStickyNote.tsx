
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  GripVertical, 
  Minimize2, 
  Maximize2, 
  Lock, 
  Unlock,
  Calendar,
  Tag,
  AlertCircle,
  Star,
  MoreVertical,
  Copy,
  Share2,
  Move3D
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdvancedRichTextEditor } from './AdvancedRichTextEditor';
import { AdvancedStickyNote as StickyNoteType } from '@/contexts/NoteTakingContext';

interface AdvancedStickyNoteProps {
  note: StickyNoteType;
  onUpdate: (updates: Partial<StickyNoteType>) => void;
  onDelete: () => void;
  isActive?: boolean;
  onActivate: () => void;
}

const COLORS = [
  { name: 'Yellow', value: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900' },
  { name: 'Pink', value: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'Blue', value: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'Green', value: 'bg-green-200', border: 'border-green-300', text: 'text-green-900' },
  { name: 'Purple', value: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-900' },
  { name: 'Orange', value: 'bg-orange-200', border: 'border-orange-300', text: 'text-orange-900' },
  { name: 'Red', value: 'bg-red-200', border: 'border-red-300', text: 'text-red-900' },
  { name: 'Gray', value: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-900' },
];

export const AdvancedStickyNote: React.FC<AdvancedStickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  isActive,
  onActivate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showActions, setShowActions] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const colorConfig = COLORS.find(c => c.value === note.color) || COLORS[0];
  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  // Auto-format text to bullet points
  const autoFormatToBullets = (text: string): string => {
    if (!text.trim()) return text;
    
    const lines = text.split('\n').filter(line => line.trim());
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      // Only add bullet if it doesn't already have one
      if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*') && !trimmed.match(/^\d+\./)) {
        return `• ${trimmed}`;
      }
      return trimmed;
    });
    
    return formattedLines.join('\n');
  };

  // Auto-save functionality
  const handleAutoSave = (content: string, htmlContent?: string) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      const formattedContent = autoFormatToBullets(content);
      onUpdate({ 
        content: formattedContent, 
        htmlContent,
        isRichText: !!htmlContent 
      });
    }, 1000); // Auto-save after 1 second of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'resize') => {
    e.preventDefault();
    onActivate();
    
    if (note.isLocked && type === 'drag') return;
    
    if (type === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - note.position.x,
        y: e.clientY - note.position.y
      });
    } else {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !note.isLocked) {
      onUpdate({
        position: {
          x: Math.max(0, e.clientX - dragStart.x),
          y: Math.max(0, e.clientY - dragStart.y)
        }
      });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      onUpdate({
        size: {
          width: Math.max(200, note.size.width + deltaX),
          height: Math.max(150, note.size.height + deltaY)
        }
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, note.position, note.size]);

  // Cleanup auto-save timeout on component unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleContentChange = (content: string, htmlContent?: string) => {
    handleAutoSave(content, htmlContent);
  };

  const toggleLock = () => {
    onUpdate({ isLocked: !note.isLocked });
  };

  const toggleCollapse = () => {
    onUpdate({ isCollapsed: !note.isCollapsed });
  };

  const updateColor = (newColor: string) => {
    onUpdate({ color: newColor });
  };

  const updatePriority = (priority: 'low' | 'medium' | 'high') => {
    onUpdate({ priority });
  };

  const copyNote = () => {
    navigator.clipboard.writeText(note.content);
  };

  const shareNote = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sticky Note',
        text: note.content
      });
    }
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "absolute shadow-lg border-2 transition-all duration-200 select-none",
        colorConfig.value,
        colorConfig.border,
        isActive && "ring-2 ring-blue-400",
        note.isCollapsed && "cursor-pointer",
        isDragging && "scale-105 shadow-2xl rotate-1",
        isResizing && "ring-2 ring-purple-400",
        note.isLocked && "border-dashed"
      )}
      style={{
        left: note.position.x,
        top: note.position.y,
        width: note.isCollapsed ? 60 : note.size.width,
        height: note.isCollapsed ? 60 : note.size.height,
        zIndex: note.zIndex,
        transform: isDragging ? 'rotate(-2deg)' : 'rotate(1deg)'
      }}
      onClick={() => {
        onActivate();
        if (note.isCollapsed) toggleCollapse();
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {note.isCollapsed ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          <Minimize2 className="w-4 h-4 text-gray-600 mb-1" />
          <div className="text-xs text-center truncate w-full">
            {note.content.substring(0, 10)}...
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div 
            className="p-2 bg-black/10 rounded-t cursor-move flex items-center justify-between"
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            <div className="flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-gray-600" />
              {note.priority !== 'low' && (
                <AlertCircle className={cn("w-3 h-3", priorityColors[note.priority])} />
              )}
              {note.tags.length > 0 && (
                <Tag className="w-3 h-3 text-gray-600" />
              )}
              {note.dueDate && (
                <Calendar className="w-3 h-3 text-blue-600" />
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Priority Buttons */}
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <button
                    key={priority}
                    className={cn(
                      "w-2 h-2 rounded-full border",
                      note.priority === priority ? priorityColors[priority] : 'bg-gray-300'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePriority(priority);
                    }}
                    style={{
                      backgroundColor: note.priority === priority ? 
                        (priority === 'low' ? '#10B981' : 
                         priority === 'medium' ? '#F59E0B' : '#EF4444') : 
                        undefined
                    }}
                  />
                ))}
              </div>

              {/* Color Picker */}
              <div className="flex gap-1">
                {COLORS.slice(0, 4).map(color => (
                  <button
                    key={color.name}
                    className={cn("w-2 h-2 rounded-full border", color.border)}
                    style={{ backgroundColor: color.value.includes('yellow') ? '#FEF3C7' : 
                             color.value.includes('pink') ? '#FCE7F3' :
                             color.value.includes('blue') ? '#DBEAFE' : '#D1FAE5' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateColor(color.value);
                    }}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-white/50"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock();
                }}
              >
                {note.isLocked ? <Lock className="w-2 h-2" /> : <Unlock className="w-2 h-2" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-white/50"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse();
                }}
              >
                <Minimize2 className="w-2 h-2" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <X className="w-2 h-2" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="px-2 py-1 flex flex-wrap gap-1">
              {note.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-2" onClick={(e) => e.stopPropagation()}>
            <AdvancedRichTextEditor
              content={note.content}
              onChange={handleContentChange}
              placeholder="Start typing... (auto-formats to bullet points)"
              className="border-none shadow-none bg-transparent"
              showToolbar={isActive && showActions}
              compact={true}
            />
          </div>

          {/* Footer */}
          <div className="px-2 py-1 text-xs text-gray-500 bg-black/5 rounded-b flex justify-between items-center">
            <span>{note.lastModified.toLocaleTimeString()}</span>
            {showActions && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={copyNote}
                >
                  <Copy className="w-2 h-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={shareNote}
                >
                  <Share2 className="w-2 h-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Resize Handle */}
          {!note.isLocked && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 flex items-center justify-center"
              onMouseDown={(e) => handleMouseDown(e, 'resize')}
            >
              <Move3D className="w-3 h-3 text-gray-600" />
            </div>
          )}
        </>
      )}
    </Card>
  );
};
