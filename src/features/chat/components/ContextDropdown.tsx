"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import type { ContextItem } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

interface ContextDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContextCategory {
  id: string;
  icon: string;
  title: string;
  items?: ContextItem[];
}

const contextCategories: ContextCategory[] = [
  {
    id: 'general',
    icon: '🌐',
    title: 'General Assistant (no specific context)',
  },
  {
    id: 'documents',
    icon: '📄',
    title: 'Documents',
    items: [], // Will be populated from API
  },
  {
    id: 'knowledge-bases',
    icon: '📚',
    title: 'Knowledge Bases',
    items: [], // Will be populated from API
  },
  {
    id: 'projects',
    icon: '📁',
    title: 'Projects',
    items: [], // Will be populated from API
  },
];

const currentPageContext: ContextItem = {
  id: 'current-page',
  type: 'document',
  icon: '📄',
  title: '3D Printing Report',
  description: 'Current Page',
};

export const ContextDropdown = ({ isOpen, onClose }: ContextDropdownProps) => {
  const { activeContexts, addContext, clearContexts } = useChatContext();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['documents']);
  const [documents, setDocuments] = useState<ContextItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [projects, setProjects] = useState<ContextItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<ContextItem[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(false);
  const [knowledgeBasesFetched, setKnowledgeBasesFetched] = useState(false);

  // Fetch documents, projects, and knowledge bases when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (documents.length === 0 && !loadingDocuments) {
        fetchDocuments();
      }
      if (projects.length === 0 && !loadingProjects) {
        fetchProjects();
      }
      if (knowledgeBases.length === 0 && !loadingKnowledgeBases && !knowledgeBasesFetched) {
        fetchKnowledgeBases();
      }
    }
  }, [isOpen, documents.length, loadingDocuments, projects.length, loadingProjects, knowledgeBases.length, loadingKnowledgeBases, knowledgeBasesFetched]);

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await fetch('/api/chat/documents');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error fetching documents:', errorData);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const documentItems: ContextItem[] = data.map((doc: any) => ({
          id: doc.id,
          type: 'document' as const,
          icon: '📄',
          title: doc.title || 'Untitled Document',
          description: `${doc.chunk_count || 0} chunks available`,
          metadata: doc.chunk_count ? `${doc.chunk_count} chunks` : undefined,
        }));
        setDocuments(documentItems);
        
        // Update the documents category
        const documentsCategory = contextCategories.find(cat => cat.id === 'documents');
        if (documentsCategory) {
          documentsCategory.items = documentItems;
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/chat/projects');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error fetching projects:', errorData);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const projectItems: ContextItem[] = data.map((project: any) => ({
          id: project.id,
          type: 'project' as const,
          icon: '📁',
          title: project.name || 'Untitled Project',
          description: project.description,
          metadata: project.document_count ? `${project.document_count} documents` : undefined,
        }));
        setProjects(projectItems);
        
        // Update the projects category
        const projectsCategory = contextCategories.find(cat => cat.id === 'projects');
        if (projectsCategory) {
          projectsCategory.items = projectItems;
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchKnowledgeBases = async () => {
    setLoadingKnowledgeBases(true);
    setKnowledgeBasesFetched(true); // Mark as fetched to prevent loops
    try {
      const response = await fetch('/api/chat/knowledge-bases');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error fetching knowledge bases:', errorData);
        // Set empty array to prevent infinite loop
        setKnowledgeBases([]);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const kbItems: ContextItem[] = data.map((kb: any) => ({
          id: kb.id,
          type: 'knowledgeBase' as const,
          icon: '📚',
          title: kb.title || 'Untitled Knowledge Base',
          description: kb.description,
          metadata: kb.metadata,
        }));
        setKnowledgeBases(kbItems);
        
        // Update the knowledge bases category
        const kbCategory = contextCategories.find(cat => cat.id === 'knowledge-bases');
        if (kbCategory) {
          kbCategory.items = kbItems;
        }
      } else {
        setKnowledgeBases([]);
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
      // Set empty array to prevent infinite loop
      setKnowledgeBases([]);
    } finally {
      setLoadingKnowledgeBases(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectContext = (context: ContextItem) => {
    if (context.id === 'general') {
      clearContexts();
    } else {
      addContext(context);
    }
    onClose();
  };

  const isSelected = (id: string, type?: string) => {
    return activeContexts.some(
      (ctx) => ctx.id === id && (type ? ctx.type === type : true)
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 right-4 top-full mt-2 z-[80] bg-card border border-border rounded-xl chat-shadow-lg overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {/* Current Page - Selected */}
              <button
                onClick={() =>
                  selectContext({
                    ...currentPageContext,
                    title: '3D Printing Service Providers Report',
                    description: 'Context includes: Report content (8 sections), 47 source URLs, Market data',
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{currentPageContext.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      Current Page - {currentPageContext.title}
                    </div>
                    <div className="text-xs text-muted-foreground">Active document</div>
                  </div>
                </div>
                {isSelected('current-page', 'document') && (
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>

              {/* General Assistant */}
              <button
                onClick={() =>
                  selectContext({
                    id: 'general',
                    type: 'general',
                    icon: '🌐',
                    title: 'General Assistant',
                    description: 'No specific context - general AI assistance',
                  })
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🌐</span>
                  <span className="text-sm font-medium text-foreground">
                    General Assistant (no specific context)
                  </span>
                </div>
                {activeContexts.length === 0 && (
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>

              {/* Expandable Categories */}
              {contextCategories.slice(1).map((category) => {
                // Use fetched documents/projects/knowledge bases for respective categories
                let categoryItems: ContextItem[] | undefined;
                if (category.id === 'documents') {
                  categoryItems = documents;
                } else if (category.id === 'projects') {
                  categoryItems = projects;
                } else if (category.id === 'knowledge-bases') {
                  categoryItems = knowledgeBases;
                } else {
                  categoryItems = category.items;
                }
                return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{category.icon}</span>
                      <span className="text-sm font-medium text-foreground">
                        {category.title}
                      </span>
                      {(category.id === 'documents' && loadingDocuments) || 
                       (category.id === 'projects' && loadingProjects) ||
                       (category.id === 'knowledge-bases' && loadingKnowledgeBases) ? (
                        <span className="text-xs text-muted-foreground">Loading...</span>
                      ) : null}
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedCategories.includes(category.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedCategories.includes(category.id) && categoryItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-muted/30"
                      >
                        {categoryItems.length === 0 && category.id === 'documents' && !loadingDocuments && (
                          <div className="pl-12 pr-4 py-3 text-sm text-muted-foreground">
                            No documents with chunks available
                          </div>
                        )}
                        {categoryItems.length === 0 && category.id === 'projects' && !loadingProjects && (
                          <div className="pl-12 pr-4 py-3 text-sm text-muted-foreground">
                            No projects with documents available
                          </div>
                        )}
                        {categoryItems.length === 0 && category.id === 'knowledge-bases' && !loadingKnowledgeBases && (
                          <div className="pl-12 pr-4 py-3 text-sm text-muted-foreground">
                            No knowledge bases with documents available
                          </div>
                        )}
                        {categoryItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => selectContext(item)}
                            className="w-full flex items-center justify-between pl-12 pr-4 py-2.5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.icon}</span>
                              <span className="text-sm text-foreground">{item.title}</span>
                              {item.metadata && (
                                <span className="text-xs text-muted-foreground">
                                  ({item.metadata})
                                </span>
                              )}
                            </div>
                            {isSelected(item.id, item.type) && (
                              <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

