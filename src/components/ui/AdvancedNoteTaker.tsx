
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2,
  Edit3,
  Tag,
  Calendar,
  Star
} from 'lucide-react';
import { useNoteTaking } from '@/contexts/NoteTakingContext';
import { AdvancedRichTextEditor } from './AdvancedRichTextEditor';
import { AdvancedStickyNote } from './AdvancedStickyNote';

interface AdvancedNoteTakerProps {
  isOpen: boolean;
  onClose: () => void;
  tabId: string;
}

export const AdvancedNoteTaker: React.FC<AdvancedNoteTakerProps> = ({
  isOpen,
  onClose,
  tabId
}) => {
  const {
    notes,
    stickyNotes,
    addNote,
    updateNote,
    deleteNote,
    addStickyNote,
    updateStickyNote,
    deleteStickyNote,
    getStickyNotesForTab,
    searchNotes,
    exportNotes,
    importNotes
  } = useNoteTaking();

  const [currentNote, setCurrentNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeStickyNote, setActiveStickyNote] = useState<string | null>(null);

  const tabStickyNotes = getStickyNotesForTab(tabId);
  const filteredNotes = searchQuery ? searchNotes(searchQuery) : notes;

  const categories = ['general', 'analysis', 'insights', 'todo', 'questions'];

  const createNote = () => {
    if (!currentNote.trim()) return;
    
    addNote({
      content: currentNote,
      title: currentNote.split('\n')[0].substring(0, 50) + '...',
      tags: [],
      priority: selectedPriority,
      category: selectedCategory,
      isRichText: false
    });
    
    setCurrentNote('');
  };

  const createStickyNote = () => {
    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addStickyNote({
      content: 'New sticky note...',
      position: { 
        x: Math.random() * (window.innerWidth - 300),
        y: Math.random() * (window.innerHeight - 200) + 100
      },
      size: { width: 250, height: 200 },
      color: randomColor,
      tabId,
      isCollapsed: false,
      priority: 'medium',
      tags: [],
      isLocked: false
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importNotes(data);
      } catch (error) {
        console.error('Error importing notes:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-6 h-6 text-blue-600" />
              Advanced Note Taker - {tabId}
              <Badge variant="outline" className="ml-2">
                {notes.length} notes
              </Badge>
              <Badge variant="outline">
                {tabStickyNotes.length} sticky notes
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="notes">Rich Notes</TabsTrigger>
              <TabsTrigger value="sticky">Sticky Notes</TabsTrigger>
              <TabsTrigger value="manage">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-6">
              {/* Note Creation */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                
                <AdvancedRichTextEditor
                  content={currentNote}
                  onChange={(content) => setCurrentNote(content)}
                  placeholder="Write your note here..."
                  showToolbar={true}
                />
                
                <Button onClick={createNote} disabled={!currentNote.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>

              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredNotes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notes found</p>
                ) : (
                  filteredNotes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{note.category}</Badge>
                          <Badge variant={
                            note.priority === 'high' ? 'destructive' : 
                            note.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {note.priority}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {note.content.substring(0, 200)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {note.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sticky" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sticky Notes for this tab</h3>
                <Button onClick={createStickyNote}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sticky Note
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tabStickyNotes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg bg-white shadow-sm">
                    <div className="text-sm mb-2">{note.content.substring(0, 100)}...</div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{note.lastModified.toLocaleDateString()}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteStickyNote(note.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={exportNotes}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Notes
                </Button>
                <label className="cursor-pointer">
                  <Button asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Notes
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <p>Total Notes: {notes.length}</p>
                  <p>Sticky Notes: {stickyNotes.length}</p>
                  <p>Categories: {categories.length}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Render sticky notes for this tab */}
      {tabStickyNotes.map((note) => (
        <AdvancedStickyNote
          key={note.id}
          note={note}
          onUpdate={(updates) => updateStickyNote(note.id, updates)}
          onDelete={() => deleteStickyNote(note.id)}
          isActive={activeStickyNote === note.id}
          onActivate={() => setActiveStickyNote(note.id)}
        />
      ))}
    </>
  );
};
