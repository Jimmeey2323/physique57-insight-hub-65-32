
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tag } from '@/types/tag';

interface TagsContextType {
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};

interface TagsProviderProps {
  children: ReactNode;
}

export const TagsProvider: React.FC<TagsProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('tags');
    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags);
        setTags(parsedTags);
      } catch (e) {
        console.error('Error loading tags:', e);
      }
    }
  }, []);

  // Save to localStorage whenever tags change
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

  const addTag = (tagData: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTags(prev => [...prev, newTag]);
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  return (
    <TagsContext.Provider value={{
      tags,
      addTag,
      updateTag,
      deleteTag
    }}>
      {children}
    </TagsContext.Provider>
  );
};
