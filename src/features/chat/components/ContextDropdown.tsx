"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext } from '../contexts/ChatContext';
import type { ContextItem } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ContextDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}


export const ContextDropdown = ({ isOpen, onClose }: ContextDropdownProps) => {
  const { activeContexts, addContext } = useChatContext();
  const [activeTab, setActiveTab] = useState('projects'); // Default to projects
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
      // Always fetch projects (default tab)
      if (projects.length === 0 && !loadingProjects) {
        fetchProjects();
      }
      // Fetch documents when docs tab is active
      if (activeTab === 'documents' && documents.length === 0 && !loadingDocuments) {
        fetchDocuments();
      }
      // Fetch knowledge bases when KBs tab is active
      if (activeTab === 'knowledge-bases' && knowledgeBases.length === 0 && !loadingKnowledgeBases && !knowledgeBasesFetched) {
        fetchKnowledgeBases();
      }
    }
  }, [isOpen, activeTab, documents.length, loadingDocuments, projects.length, loadingProjects, knowledgeBases.length, loadingKnowledgeBases, knowledgeBasesFetched]);

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

  const selectContext = (context: ContextItem) => {
    addContext(context);
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
            className="absolute left-4 right-4 top-full mt-2 z-[80] bg-card border border-border rounded-xl chat-shadow-lg overflow-hidden w-96"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full rounded-none border-b border-border bg-transparent h-auto p-0">
                <TabsTrigger value="projects" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <span className="mr-2">📁</span>
                  Projects
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <span className="mr-2">📄</span>
                  Docs
                </TabsTrigger>
                <TabsTrigger value="knowledge-bases" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <span className="mr-2">📚</span>
                  KBs
                </TabsTrigger>
              </TabsList>

              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {/* Projects Tab */}
                <TabsContent value="projects" className="m-0 p-0">
                  {loadingProjects ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading projects...
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No projects with documents available
                    </div>
                  ) : (
                    <div className="py-2">
                      {projects.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => selectContext(item)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm flex-shrink-0">{item.icon}</span>
                            <span className="text-sm text-foreground truncate">{item.title}</span>
                            {item.metadata && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({item.metadata})
                              </span>
                            )}
                          </div>
                          {isSelected(item.id, item.type) && (
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="m-0 p-0">
                  {loadingDocuments ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading documents...
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No documents with chunks available
                    </div>
                  ) : (
                    <div className="py-2">
                      {documents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => selectContext(item)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm flex-shrink-0">{item.icon}</span>
                            <span className="text-sm text-foreground truncate">{item.title}</span>
                            {item.metadata && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({item.metadata})
                              </span>
                            )}
                          </div>
                          {isSelected(item.id, item.type) && (
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Knowledge Bases Tab */}
                <TabsContent value="knowledge-bases" className="m-0 p-0">
                  {loadingKnowledgeBases ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading knowledge bases...
                    </div>
                  ) : knowledgeBases.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No knowledge bases with documents available
                    </div>
                  ) : (
                    <div className="py-2">
                      {knowledgeBases.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => selectContext(item)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm flex-shrink-0">{item.icon}</span>
                            <span className="text-sm text-foreground truncate">{item.title}</span>
                            {item.metadata && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({item.metadata})
                              </span>
                            )}
                          </div>
                          {isSelected(item.id, item.type) && (
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

