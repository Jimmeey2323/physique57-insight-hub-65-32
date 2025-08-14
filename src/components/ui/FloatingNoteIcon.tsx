
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StickyNote, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNoteTaking } from '@/contexts/NoteTakingContext';

interface FloatingNoteIconProps {
  tabId: string;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const FloatingNoteIcon: React.FC<FloatingNoteIconProps> = ({
  tabId,
  className,
  position = 'top-right'
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { addStickyNote, getStickyNotesForTab } = useNoteTaking();
  
  const stickyCount = getStickyNotesForTab(tabId).length;
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4', 
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const createQuickNote = () => {
    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addStickyNote({
      content: '',
      position: { 
        x: Math.random() * (window.innerWidth - 300) + 50,
        y: Math.random() * (window.innerHeight - 200) + 100
      },
      size: { width: 250, height: 200 },
      color: randomColor,
      tabId: tabId,
      isCollapsed: false,
      isRichText: false,
      priority: 'medium',
      tags: [],
      isLocked: false
    });
  };

  return (
    <div className={cn("fixed z-40", positionClasses[position], className)}>
      <div className="relative">
        <Button
          onClick={createQuickNote}
          onMouseEnter={() => setShowQuickAdd(true)}
          onMouseLeave={() => setShowQuickAdd(false)}
          className="rounded-full w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-lg transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <StickyNote className="w-5 h-5 text-white" />
          {stickyCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {stickyCount}
            </span>
          )}
        </Button>
        
        {showQuickAdd && (
          <div className="absolute top-14 right-0 bg-white rounded-lg shadow-lg p-2 border whitespace-nowrap">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Plus className="w-4 h-4" />
              Add Sticky Note
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
