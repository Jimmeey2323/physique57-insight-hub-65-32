
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedRichTextEditorProps {
  content: string;
  onChange: (content: string, htmlContent?: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  compact?: boolean;
}

export const AdvancedRichTextEditor: React.FC<AdvancedRichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  className,
  showToolbar = true,
  compact = false
}) => {
  const [isRichMode, setIsRichMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerText, editorRef.current.innerHTML);
    }
  };

  const formatToBullets = () => {
    if (!isRichMode && textareaRef.current) {
      const text = textareaRef.current.value;
      const lines = text.split('\n').filter(line => line.trim());
      const bulletText = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
          return `• ${trimmed}`;
        }
        return trimmed;
      }).join('\n');
      onChange(bulletText);
    } else {
      executeCommand('insertUnorderedList');
    }
  };

  const formatToNumbered = () => {
    if (!isRichMode && textareaRef.current) {
      const text = textareaRef.current.value;
      const lines = text.split('\n').filter(line => line.trim());
      const numberedText = lines.map((line, index) => {
        const trimmed = line.trim();
        return `${index + 1}. ${trimmed}`;
      }).join('\n');
      onChange(numberedText);
    } else {
      executeCommand('insertOrderedList');
    }
  };

  const toggleRichMode = () => {
    if (isRichMode) {
      // Switch to plain text
      if (editorRef.current) {
        onChange(editorRef.current.innerText);
      }
    } else {
      // Switch to rich text
      const htmlContent = content.replace(/\n/g, '<br>');
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    }
    setIsRichMode(!isRichMode);
  };

  const handleRichTextChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerText, editorRef.current.innerHTML);
    }
  };

  const handlePlainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  useEffect(() => {
    if (isRichMode && editorRef.current) {
      editorRef.current.innerHTML = content.replace(/\n/g, '<br>');
    }
  }, [isRichMode]);

  return (
    <div className={cn("border rounded-lg", className)}>
      {showToolbar && (
        <div className={cn(
          "border-b p-2 bg-gray-50 flex flex-wrap items-center gap-1",
          compact && "p-1"
        )}>
          {/* Mode Toggle */}
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={toggleRichMode}
            className="gap-1"
          >
            <Type className="w-3 h-3" />
            {isRichMode ? 'Plain' : 'Rich'}
          </Button>

          {isRichMode ? (
            <>
              {/* Rich Text Controls */}
              <div className="border-l pl-2 flex gap-1">
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('bold')}
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('italic')}
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('underline')}
                >
                  <Underline className="w-3 h-3" />
                </Button>
              </div>

              <div className="border-l pl-2 flex gap-1">
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('justifyLeft')}
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('justifyCenter')}
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('justifyRight')}
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
              </div>

              <div className="border-l pl-2 flex gap-1">
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('insertUnorderedList')}
                >
                  <List className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('insertOrderedList')}
                >
                  <ListOrdered className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={() => executeCommand('formatBlock', 'blockquote')}
                >
                  <Quote className="w-3 h-3" />
                </Button>
              </div>

              {/* Color Picker */}
              <div className="border-l pl-2 flex items-center gap-1">
                <Palette className="w-3 h-3" />
                {colors.map(color => (
                  <button
                    key={color}
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      executeCommand('foreColor', color);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Plain Text Controls */}
              <div className="border-l pl-2 flex gap-1">
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={formatToBullets}
                >
                  <List className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size={compact ? "sm" : "default"}
                  onClick={formatToNumbered}
                >
                  <ListOrdered className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Editor Area */}
      <div className="p-3">
        {isRichMode ? (
          <div
            ref={editorRef}
            contentEditable
            className="min-h-20 focus:outline-none"
            onInput={handleRichTextChange}
            style={{ minHeight: compact ? '60px' : '80px' }}
            suppressContentEditableWarning={true}
          />
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handlePlainTextChange}
            placeholder={placeholder}
            className="border-none resize-none focus:ring-0 p-0"
            style={{ minHeight: compact ? '60px' : '80px' }}
          />
        )}
      </div>
    </div>
  );
};
