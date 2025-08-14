
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RichNote {
  id: string;
  content: string;
  htmlContent?: string;
  title?: string;
  timestamp: Date;
  lastModified: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  category: string;
  isRichText: boolean;
  attachments?: string[];
}

export interface AdvancedStickyNote {
  id: string;
  content: string;
  htmlContent?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  timestamp: Date;
  lastModified: Date;
  tabId: string;
  isCollapsed: boolean;
  isRichText: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: Date;
  isLocked: boolean;
  zIndex: number;
}

interface NoteTakingContextType {
  notes: RichNote[];
  stickyNotes: AdvancedStickyNote[];
  addNote: (note: Omit<RichNote, 'id' | 'timestamp' | 'lastModified'>) => void;
  updateNote: (id: string, updates: Partial<RichNote>) => void;
  deleteNote: (id: string) => void;
  addStickyNote: (note: Omit<AdvancedStickyNote, 'id' | 'timestamp' | 'lastModified' | 'zIndex'>) => void;
  updateStickyNote: (id: string, updates: Partial<AdvancedStickyNote>) => void;
  deleteStickyNote: (id: string) => void;
  getStickyNotesForTab: (tabId: string) => AdvancedStickyNote[];
  searchNotes: (query: string) => RichNote[];
  getNotesbyCategory: (category: string) => RichNote[];
  exportNotes: () => void;
  importNotes: (data: any) => void;
}

const NoteTakingContext = createContext<NoteTakingContextType | undefined>(undefined);

export const useNoteTaking = () => {
  const context = useContext(NoteTakingContext);
  if (!context) {
    throw new Error('useNoteTaking must be used within a NoteTakingProvider');
  }
  return context;
};

interface NoteTakingProviderProps {
  children: ReactNode;
}

export const NoteTakingProvider: React.FC<NoteTakingProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<RichNote[]>([]);
  const [stickyNotes, setStickyNotes] = useState<AdvancedStickyNote[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('advancedNoteTaker-notes');
    const savedStickyNotes = localStorage.getItem('advancedNoteTaker-stickyNotes');
    
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
          lastModified: new Date(note.lastModified)
        }));
        setNotes(parsedNotes);
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }

    if (savedStickyNotes) {
      try {
        const parsedStickyNotes = JSON.parse(savedStickyNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
          lastModified: new Date(note.lastModified),
          dueDate: note.dueDate ? new Date(note.dueDate) : undefined
        }));
        setStickyNotes(parsedStickyNotes);
      } catch (e) {
        console.error('Error loading sticky notes:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('advancedNoteTaker-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('advancedNoteTaker-stickyNotes', JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  const addNote = (noteData: Omit<RichNote, 'id' | 'timestamp' | 'lastModified'>) => {
    const newNote: RichNote = {
      ...noteData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      lastModified: new Date()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<RichNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, lastModified: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const addStickyNote = (noteData: Omit<AdvancedStickyNote, 'id' | 'timestamp' | 'lastModified' | 'zIndex'>) => {
    const maxZ = Math.max(...stickyNotes.map(n => n.zIndex), 0);
    const newStickyNote: AdvancedStickyNote = {
      ...noteData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      lastModified: new Date(),
      zIndex: maxZ + 1
    };
    setStickyNotes(prev => [...prev, newStickyNote]);
  };

  const updateStickyNote = (id: string, updates: Partial<AdvancedStickyNote>) => {
    setStickyNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, lastModified: new Date() }
        : note
    ));
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(note => note.id !== id));
  };

  const getStickyNotesForTab = (tabId: string) => {
    return stickyNotes.filter(note => note.tabId === tabId);
  };

  const searchNotes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return notes.filter(note => 
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.title?.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getNotesbyCategory = (category: string) => {
    return notes.filter(note => note.category === category);
  };

  const exportNotes = () => {
    const data = {
      notes,
      stickyNotes,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importNotes = (data: any) => {
    try {
      if (data.notes) {
        const importedNotes = data.notes.map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
          lastModified: new Date(note.lastModified)
        }));
        setNotes(prev => [...prev, ...importedNotes]);
      }
      if (data.stickyNotes) {
        const importedStickyNotes = data.stickyNotes.map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
          lastModified: new Date(note.lastModified),
          dueDate: note.dueDate ? new Date(note.dueDate) : undefined
        }));
        setStickyNotes(prev => [...prev, ...importedStickyNotes]);
      }
    } catch (error) {
      console.error('Error importing notes:', error);
    }
  };

  return (
    <NoteTakingContext.Provider value={{
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
    }}>
      {children}
    </NoteTakingContext.Provider>
  );
};
