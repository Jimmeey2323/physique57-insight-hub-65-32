import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  BookOpen,
  Tag,
  Calendar,
  Star,
  Clock,
  Archive,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNoteTaking } from '@/contexts/NoteTakingContext';
import { AdvancedRichTextEditor } from './AdvancedRichTextEditor';
import { AdvancedStickyNote } from './AdvancedStickyNote';

interface AdvancedNoteTakerProps {
  className?: string;
  currentTabId?: string;
}

export const AdvancedNoteTaker: React.FC<AdvancedNoteTakerProps> = ({ 
  className, 
  currentTabId = 'default' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showStickyDialog, setShowStickyDialog] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

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
    getNotesbyCategory,
    exportNotes,
    importNotes
  } = useNoteTaking();

  const currentStickyNotes = getStickyNotesForTab(currentTabId);
  const filteredNotes = searchQuery ? searchNotes(searchQuery) : 
                       selectedCategory !== 'all' ? getNotesbyCategory(selectedCategory) : notes;

  const categories = Array.from(new Set(notes.map(note => note.category)));

  const isDashboardTab = currentTabId !== 'default' && currentTabId !== 'notes';

  const createStickyNote = () => {
    const colors = ['bg-yellow-200', 'bg-pink-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addStickyNote({
      content: '',
      position: { 
        x: Math.random() * (window.innerWidth - 300) + 50,
        y: Math.random() * (window.innerHeight - 200) + 100
      },
      size: { width: 250, height: 200 },
      color: randomColor,
      tabId: currentTabId,
      isCollapsed: isDashboardTab,
      isRichText: false,
      priority: 'medium',
      tags: [],
      isLocked: false
    });
    setShowStickyDialog(false);
  };

  const createNote = () => {
    if (!newNoteData.content.trim()) return;
    
    addNote({
      ...newNoteData,
      isRichText: false
    });
    
    setNewNoteData({
      title: '',
      content: '',
      category: 'general',
      tags: [],
      priority: 'medium'
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };

  return (
    <>
      {/* Floating Note Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl",
          "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          "text-white border-0 transition-all duration-300 hover:scale-110",
          className
        )}
        size="icon"
      >
        <BookOpen className="w-6 h-6" />
      </Button>

      {/* Sticky Notes for Current Tab */}
      {currentStickyNotes.map((note) => (
        <AdvancedStickyNote
          key={note.id}
          note={note}
          onUpdate={(updates) => updateStickyNote(note.id, updates)}
          onDelete={() => deleteStickyNote(note.id)}
          isActive={activeNoteId === note.id}
          onActivate={() => setActiveNoteId(note.id)}
        />
      ))}

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Advanced Notes & Sticky Notes
              <Badge variant="outline">{notes.length + stickyNotes.length} total</Badge>
              {isDashboardTab && (
                <Badge variant="secondary" className="ml-2">
                  Dashboard Mode: Notes collapsed by default
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notes" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="sticky" className="gap-2">
                <StickyNote className="w-4 h-4" />
                Sticky ({currentStickyNotes.length})
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-2">
                <Search className="w-4 h-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="manage" className="gap-2">
                <Settings className="w-4 h-4" />
                Manage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Create New Note */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Create New Note</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Note title (optional)"
                        value={newNoteData.title}
                        onChange={(e) => setNewNoteData(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <select
                        className="px-3 py-2 border rounded-md"
                        value={newNoteData.category}
                        onChange={(e) => setNewNoteData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General</option>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="ideas">Ideas</option>
                        <option value="todo">To-Do</option>
                      </select>
                    </div>
                    
                    <AdvancedRichTextEditor
                      content={newNoteData.content}
                      onChange={(content) => setNewNoteData(prev => ({ ...prev, content }))}
                      placeholder="Write your note here..."
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Priority:</span>
                        {(['low', 'medium', 'high'] as const).map(priority => (
                          <Button
                            key={priority}
                            variant={newNoteData.priority === priority ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewNoteData(prev => ({ ...prev, priority }))}
                            className={cn(
                              priority === 'low' && "text-green-600",
                              priority === 'medium' && "text-yellow-600", 
                              priority === 'high' && "text-red-600"
                            )}
                          >
                            {priority}
                          </Button>
                        ))}
                      </div>
                      
                      <Button onClick={createNote} disabled={!newNoteData.content.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            {note.title && (
                              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                            )}
                            <div className="prose prose-sm max-w-none mb-3">
                              {note.isRichText && note.htmlContent ? (
                                <div dangerouslySetInnerHTML={{ __html: note.htmlContent }} />
                              ) : (
                                <div className="whitespace-pre-line">{note.content}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline">{note.category}</Badge>
                              <Badge variant={note.priority === 'high' ? 'destructive' : 
                                            note.priority === 'medium' ? 'default' : 'secondary'}>
                                {note.priority}
                              </Badge>
                              <Clock className="w-3 h-3" />
                              {note.lastModified.toLocaleString()}
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteNote(note.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sticky" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Sticky Notes for Current Tab
                  {isDashboardTab && (
                    <span className="text-sm text-gray-600 ml-2">(Auto-collapsed on dashboard)</span>
                  )}
                </h3>
                <Button onClick={createStickyNote} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Sticky Note
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStickyNotes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className={cn("w-4 h-4 rounded", note.color)}></div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {note.priority}
                          </Badge>
                          {note.isCollapsed && (
                            <Badge variant="secondary" className="text-xs">
                              Collapsed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-3">
                        {note.content || 'Empty note (auto-formats to bullets)'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {note.lastModified.toLocaleString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search notes and sticky notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="space-y-2">
                      {note.title && <h4 className="font-semibold">{note.title}</h4>}
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {note.content}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline">{note.category}</Badge>
                        <span>{note.lastModified.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Export & Import</h3>
                  <div className="space-y-3">
                    <Button onClick={exportNotes} className="w-full gap-2">
                      <Download className="w-4 h-4" />
                      Export All Notes
                    </Button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                        id="import-notes"
                      />
                      <Button asChild className="w-full gap-2" variant="outline">
                        <label htmlFor="import-notes">
                          <Upload className="w-4 h-4" />
                          Import Notes
                        </label>
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Notes:</span>
                      <Badge>{notes.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sticky Notes:</span>
                      <Badge>{stickyNotes.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <Badge>{categories.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Tab:</span>
                      <Badge>{currentStickyNotes.length}</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
