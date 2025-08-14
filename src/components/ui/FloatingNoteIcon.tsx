
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdvancedNoteTaker } from './AdvancedNoteTaker';

interface FloatingNoteIconProps {
  tabId: string;
  className?: string;
}

export const FloatingNoteIcon: React.FC<FloatingNoteIconProps> = ({ 
  tabId, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "text-white border-0 transition-all duration-300 hover:scale-110",
          className
        )}
        size="icon"
      >
        <StickyNote className="w-6 h-6" />
      </Button>

      <AdvancedNoteTaker
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        tabId={tabId}
      />
    </>
  );
};
