import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useNotes } from '@/contexts/NotesContext';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Lock, Unlock, Edit, Save, History, Link, Plus, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { ColorPicker } from '@/components/ui/color-picker';
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTags } from '@/contexts/TagsContext';
import { Tag } from '@/types/tag';
import { v4 as uuidv4 } from 'uuid';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateTimePicker } from './date-time-picker';
import { Editor } from "@tiptap/react";
import { Tiptap } from './tiptap';

interface AdvancedNoteTakerProps {
  isVisible: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  tabId?: string;
}

const noteColors = ['#F0F4C3', '#DCEDC8', '#C8E6C9', '#B2DFDB', '#80CBC4', '#4DB6AC', '#26A69A', '#009688', '#00897B', '#00796B'];

export const AdvancedNoteTaker: React.FC<AdvancedNoteTakerProps> = ({ 
  isVisible, 
  onClose, 
  initialPosition, 
  tabId 
}) => {
  const { addNote, updateNote, deleteNote, notes } = useNotes();
  const { tags, addTag, updateTag, deleteTag } = useTags();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [size, setSize] = useState({ width: 250, height: 200 });
  const [color, setColor] = useState(noteColors[0]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isRichText, setIsRichText] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [showPriorityPopover, setShowPriorityPopover] = useState(false);
  const [showLockPopover, setShowLockPopover] = useState(false);
  const [showDueDatePopover, setShowDueDatePopover] = useState(false);
  const [showMoreOptionsPopover, setShowMoreOptionsPopover] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showHistoryPopover, setShowHistoryPopover] = useState(false);
  const [showTagEditPopover, setShowTagEditPopover] = useState(false);
  const [showRichTextPopover, setShowRichTextPopover] = useState(false);
  const [showCollapsePopover, setShowCollapsePopover] = useState(false);
  const [showTitlePopover, setShowTitlePopover] = useState(false);
  const [showContentPopover, setShowContentPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showSizePopover, setShowSizePopover] = useState(false);
  const [showPositionPopover, setShowPositionPopover] = useState(false);
  const [showIsLockedPopover, setShowIsLockedPopover] = useState(false);
  const [showIsCollapsedPopover, setShowIsCollapsedPopover] = useState(false);
  const [showIsRichTextPopover, setShowIsRichTextPopover] = useState(false);
  const [showSelectedTagsPopover, setShowSelectedTagsPopover] = useState(false);
  const [showNewTagNamePopover, setShowNewTagNamePopover] = useState(false);
  const [showIsEditingTagsPopover, setShowIsEditingTagsPopover] = useState(false);
  const [showEditorPopover, setShowEditorPopover] = useState(false);
  const [showDueDateCalendarPopover, setShowDueDateCalendarPopover] = useState(false);
  const [showHistoryListPopover, setShowHistoryListPopover] = useState(false);
  const [showIsSavingPopover, setShowIsSavingPopover] = useState(false);
  const [showIsDirtyPopover, setShowIsDirtyPopover] = useState(false);
  const [showLastSavedContentPopover, setShowLastSavedContentPopover] = useState(false);
  const [showDateTimePickerPopover, setShowDateTimePickerPopover] = useState(false);
  const [showColorPickerPopover, setShowColorPickerPopover] = useState(false);
  const [showTagPopoverPopover, setShowTagPopoverPopover] = useState(false);
  const [showPriorityPopoverPopover, setShowPriorityPopoverPopover] = useState(false);
  const [showLockPopoverPopover, setShowLockPopoverPopover] = useState(false);
  const [showDueDatePopoverPopover, setShowDueDatePopoverPopover] = useState(false);
  const [showMoreOptionsPopoverPopover, setShowMoreOptionsPopoverPopover] = useState(false);
  const [showDeleteConfirmationPopover, setShowDeleteConfirmationPopover] = useState(false);
  const [showHistoryPopoverPopover, setShowHistoryPopoverPopover] = useState(false);
  const [showTagEditPopoverPopover, setShowTagEditPopoverPopover] = useState(false);
  const [showRichTextPopoverPopover, setShowRichTextPopoverPopover] = useState(false);
  const [showCollapsePopoverPopover, setShowCollapsePopoverPopover] = useState(false);
  const [showTitlePopoverPopover, setShowTitlePopoverPopover] = useState(false);
  const [showContentPopoverPopover, setShowContentPopoverPopover] = useState(false);
  const [showColorPopoverPopover, setShowColorPopoverPopover] = useState(false);
  const [showSizePopoverPopover, setShowSizePopoverPopover] = useState(false);
  const [showPositionPopoverPopover, setShowPositionPopoverPopover] = useState(false);
  const [showIsLockedPopoverPopover, setShowIsLockedPopoverPopover] = useState(false);
  const [showIsCollapsedPopoverPopover, setShowIsCollapsedPopoverPopover] = useState(false);
  const [showIsRichTextPopoverPopover, setShowIsRichTextPopoverPopover] = useState(false);
  const [showSelectedTagsPopoverPopover, setShowSelectedTagsPopoverPopover] = useState(false);
  const [showNewTagNamePopoverPopover, setShowNewTagNamePopoverPopover] = useState(false);
  const [showIsEditingTagsPopoverPopover, setShowIsEditingTagsPopoverPopover] = useState(false);
  const [showEditorPopoverPopover, setShowEditorPopoverPopover] = useState(false);
  const [showDueDateCalendarPopoverPopover, setShowDueDateCalendarPopoverPopover] = useState(false);
  const [showHistoryListPopoverPopover, setShowHistoryListPopoverPopover] = useState(false);
  const [showIsSavingPopoverPopover, setShowIsSavingPopoverPopover] = useState(false);
  const [showIsDirtyPopoverPopover, setShowIsDirtyPopoverPopover] = useState(false);
  const [showLastSavedContentPopoverPopover, setShowLastSavedContentPopoverPopover] = useState(false);
  const [showDateTimePickerPopoverPopover, setShowDateTimePickerPopoverPopover] = useState(false);
  const [showColorPickerPopoverPopover, setShowColorPickerPopoverPopover] = useState(false);
  const [showTagPopoverPopoverPopover, setShowTagPopoverPopoverPopover] = useState(false);
  const [debouncedContent, setDebouncedContent] = useDebounce(content, 500);
  const { setLoading } = useGlobalLoading();
  const { theme } = useTheme();
  const rndRef = useRef<Rnd>(null);

  useEffect(() => {
    if (isVisible) {
      setPosition(initialPosition || { x: 100, y: 100 });
    }
  }, [isVisible, initialPosition]);

  useEffect(() => {
    if (debouncedContent !== lastSavedContent) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [debouncedContent, lastSavedContent]);

  useEffect(() => {
    if (content) {
      setHistory(prevHistory => [content, ...prevHistory.slice(0, 9)]);
    }
  }, [content]);

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

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagId)) {
        return prevTags.filter(id => id !== tagId);
      } else {
        return [...prevTags, tagId];
      }
    });
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    setSelectedPriority(priority);
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
  };

  const handleRichTextToggle = () => {
    setIsRichText(!isRichText);
  };

  const handleEditorChange = (html: string) => {
    setContent(html);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
  };

  const createNote = (content: string = '') => {
    const newNote = {
      content,
      position: { 
        x: Math.random() * (window.innerWidth - 300), 
        y: Math.random() * (window.innerHeight - 200) 
      },
      size: { width: 250, height: 200 },
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      tabId: tabId || 'default',
      isCollapsed: false,
      priority: 'medium' as const,
      tags: [],
      isLocked: false,
      isRichText: false
    };
    
    addNote(newNote);
  };

  const saveNote = async () => {
    setIsSaving(true);
    setLoading(true, 'Saving note...');
    
    const noteToSave: Note = {
      id: uuidv4(),
      title: title,
      content: debouncedContent,
      position: position,
      size: size,
      color: color,
      tabId: tabId || 'default',
      isCollapsed: isCollapsed,
      priority: selectedPriority,
      tags: selectedTags,
      isLocked: isLocked,
      isRichText: isRichText,
      dueDate: dueDate?.toISOString() || undefined
    };

    addNote(noteToSave);
    setLastSavedContent(debouncedContent);
    setIsSaving(false);
    setLoading(false);
    onClose();
  };

  return (
    <Rnd
      ref={rndRef}
      style={{
        display: isVisible ? 'block' : 'none',
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
      disableDragging={isLocked}
    >
      <div
        className="relative flex flex-col rounded-md shadow-md overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-opacity-80 backdrop-blur-sm border-b">
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-transparent shadow-none"
          />
          <div>
            <Button variant="ghost" size="icon" onClick={saveNote}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-2 flex-grow overflow-auto">
          {isRichText ? (
            <Tiptap editor={editor} setEditor={setEditor} onChange={handleEditorChange} initialContent={content} />
          ) : (
            <Textarea
              placeholder="Add your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-sm bg-transparent border-none focus-visible:ring-0 focus-visible:ring-transparent shadow-none resize-none"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-2 bg-opacity-80 backdrop-blur-sm border-t">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p>Add a new tag:</p>
                <Input
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={() => {
                  const newTag = { id: uuidv4(), name: newTagName, color: '#ccc' };
                  addTag(newTag);
                  setNewTagName('');
                }}>Create Tag</Button>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p>Select tags:</p>
                <ScrollArea className="max-h-[200px] pr-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`}>{tag.name}</Label>
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p>Toggle Rich Text:</p>
                <Button onClick={handleRichTextToggle}>
                  {isRichText ? 'Disable Rich Text' : 'Enable Rich Text'}
                </Button>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p>Note History:</p>
                <ScrollArea className="max-h-[200px] pr-2">
                  {history.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {item}
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2">
            <ColorPicker color={color} onColorChange={handleColorChange} />
          </div>
        </div>
      </div>
    </Rnd>
  );
};
