
import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AdvancedNoteTakerProps {
  isVisible: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  tabId?: string;
}

const noteColors = ['#F0F4C3', '#DCEDC8', '#C8E6C9', '#B2DFDB', '#80CBC4', '#4DB6AC'];

export const AdvancedNoteTaker: React.FC<AdvancedNoteTakerProps> = ({ 
  isVisible, 
  onClose, 
  initialPosition, 
  tabId 
}) => {
  const { addNote } = useNotes();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [size, setSize] = useState({ width: 300, height: 250 });
  const [color, setColor] = useState(noteColors[0]);
  const rndRef = useRef<Rnd>(null);

  useEffect(() => {
    if (isVisible) {
      setPosition(initialPosition || { x: 100, y: 100 });
    }
  }, [isVisible, initialPosition]);

  const handleResize = (e: any, dir: any, ref: any, delta: any, position: any) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPosition(position);
  };

  const handleDrag = (e: any, d: any) => {
    setPosition({ x: d.x, y: d.y });
  };

  const saveNote = async () => {
    const noteToSave: Omit<Note, 'id'> = {
      title: title,
      content: content,
      position: position,
      size: size,
      color: color,
      tabId: tabId || 'default',
      isCollapsed: false,
      priority: 'medium' as const,
      tags: [],
      isLocked: false,
      isRichText: false
    };

    addNote(noteToSave);
    setTitle('');
    setContent('');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Rnd
      ref={rndRef}
      style={{
        display: 'block',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      minWidth={200}
      minHeight={150}
      bounds="body"
      onResize={handleResize}
      onDrag={handleDrag}
    >
      <div
        className="relative flex flex-col rounded-md shadow-md overflow-hidden h-full"
        style={{ backgroundColor: color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-opacity-80 backdrop-blur-sm border-b">
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-transparent shadow-none"
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={saveNote}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 flex-grow">
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-transparent shadow-none resize-none h-full"
          />
        </div>
      </div>
    </Rnd>
  );
};
