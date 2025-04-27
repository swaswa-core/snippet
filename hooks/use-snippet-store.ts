'use client';

import { create } from 'zustand';
import { Snippet } from '@/types/snippet';
import { detectLanguage, extractUniqueTags, handleSnippetError, organizeSnippets } from '@/lib/snippet-util';
import { toast } from 'sonner';

interface SnippetState {
  // Data
  snippets: Snippet[];
  filteredSnippets: Snippet[];
  allTags: string[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterTag: string | null;
  copied: string | null;
  expandedSnippet: string | null;
  
  // Form state
  editingSnippet: Snippet | null;
  isEditingName: boolean;
  isEditingTags: boolean;
  viewingSnippet: Snippet | null;
  isDeleteConfirmOpen: boolean;
  snippetToDelete: string | null;
  
  // CRUD operations
  fetchSnippets: () => Promise<void>;
  createSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Snippet | null>;
  updateSnippet: (updatedSnippet: Snippet) => Promise<Snippet | null>;
  deleteSnippet: (id: string) => Promise<void>;
  togglePinStatus: (id: string, isPinned: boolean) => Promise<void>;
  
  // UI actions
  setSearchQuery: (query: string) => void;
  setFilterTag: (tag: string | null) => void;
  copyToClipboard: (id: string, content: string) => void;
  toggleExpand: (id: string, e: React.MouseEvent) => void;
  
  // Modal handling
  setEditingSnippet: (snippet: Snippet | null) => void;
  setIsEditingName: (isEditing: boolean) => void;
  setIsEditingTags: (isEditing: boolean) => void;
  setViewingSnippet: (snippet: Snippet | null) => void;
  confirmDelete: (id: string) => void;
  cancelDelete: () => void;
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  // Initial state
  snippets: [],
  filteredSnippets: [],
  allTags: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterTag: null,
  copied: null,
  expandedSnippet: null,
  editingSnippet: null,
  isEditingName: false,
  isEditingTags: false,
  viewingSnippet: null,
  isDeleteConfirmOpen: false,
  snippetToDelete: null,
  
  // CRUD operations
  fetchSnippets: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/snippets');
      if (!response.ok) throw new Error('Failed to fetch snippets');
      
      const data = await response.json();
      set({ 
        snippets: data, 
        filteredSnippets: data,
        allTags: extractUniqueTags(data),
        error: null 
      });
    } catch (error) {
      set({ error: handleSnippetError(error, 'Failed to load snippets.') });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createSnippet: async (snippetData) => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...snippetData,
          language: detectLanguage(snippetData.content)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create snippet');
      }
      
      const newSnippet = await response.json();
      set((state) => ({ 
        snippets: [newSnippet, ...state.snippets],
        allTags: extractUniqueTags([...state.snippets, newSnippet])
      }));
      
      toast.success("Snippet created successfully");
      return newSnippet;
    } catch (error) {
      toast.error(handleSnippetError(error, "Failed to create snippet."));
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateSnippet: async (updatedSnippet) => {
    try {
      const response = await fetch(`/api/snippets/${updatedSnippet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedSnippet,
          language: detectLanguage(updatedSnippet.content)
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update snippet');
      
      const result = await response.json();
      set((state) => ({
        snippets: state.snippets.map(s => s.id === updatedSnippet.id ? result : s),
        allTags: extractUniqueTags(state.snippets.map(s => s.id === updatedSnippet.id ? result : s))
      }));
      
      toast.success("Snippet updated successfully!");
      return result;
    } catch (error) {
      toast.error(handleSnippetError(error, "Failed to update snippet."));
      return null;
    }
  },
  
  deleteSnippet: async (id) => {
    try {
      const response = await fetch(`/api/snippets/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete snippet');
      
      set((state) => ({ 
        snippets: state.snippets.filter(s => s.id !== id),
        allTags: extractUniqueTags(state.snippets.filter(s => s.id !== id)),
        snippetToDelete: null,
        isDeleteConfirmOpen: false
      }));
      
      toast.success("Snippet deleted successfully");
    } catch (error) {
      toast.error(handleSnippetError(error, "Failed to delete snippet."));
      throw error;
    }
  },
  
  togglePinStatus: async (id, isPinned) => {
    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned }),
      });
      
      if (!response.ok) throw new Error('Failed to update pin status');
      
      const updatedSnippet = await response.json();
      set((state) => ({
        snippets: state.snippets.map(s => s.id === id ? updatedSnippet : s)
      }));
      
      toast.success(isPinned ? "Snippet pinned" : "Snippet unpinned");
    } catch (error) {
      toast.error(handleSnippetError(error, "Failed to update pin status."));
      throw error;
    }
  },
  
  // UI actions
  setSearchQuery: (query) => {
    set((state) => {
      const { snippets, filterTag } = state;
      const filtered = snippets.filter(snippet => {
        const matchesSearch =
          !query ||
          snippet.content.toLowerCase().includes(query.toLowerCase()) ||
          snippet.name.toLowerCase().includes(query.toLowerCase()) ||
          snippet.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesTag = !filterTag || snippet.tags.includes(filterTag);
        
        return matchesSearch && matchesTag;
      });
      
      return {
        searchQuery: query,
        filteredSnippets: filtered
      };
    });
  },
  
  setFilterTag: (tag) => {
    set((state) => {
      const { snippets, searchQuery } = state;
      const filtered = snippets.filter(snippet => {
        const matchesSearch =
          !searchQuery ||
          snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          snippet.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesTag = !tag || snippet.tags.includes(tag);
        
        return matchesSearch && matchesTag;
      });
      
      return {
        filterTag: tag,
        filteredSnippets: filtered
      };
    });
  },
  
  copyToClipboard: (id, content) => {
    navigator.clipboard.writeText(content);
    set({ copied: id });
    toast.success("Snippet copied to clipboard!");
    
    // Reset copied status after 2 seconds
    setTimeout(() => set({ copied: null }), 2000);
  },
  
  toggleExpand: (id, e) => {
    e.stopPropagation();
    set((state) => ({ expandedSnippet: state.expandedSnippet === id ? null : id }));
  },
  
  // Modal handling
  setEditingSnippet: (snippet) => {
    set({ editingSnippet: snippet });
  },
  
  setIsEditingName: (isEditing) => {
    set({ isEditingName: isEditing });
  },
  
  setIsEditingTags: (isEditing) => {
    set({ isEditingTags: isEditing });
  },
  
  setViewingSnippet: (snippet) => {
    set({ viewingSnippet: snippet });
  },
  
  confirmDelete: (id) => {
    set({ 
      snippetToDelete: id,
      isDeleteConfirmOpen: true
    });
  },
  
  cancelDelete: () => {
    set({ 
      snippetToDelete: null,
      isDeleteConfirmOpen: false
    });
  }
}));