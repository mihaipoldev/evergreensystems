"use client";

import { useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import type { ContextItem } from '../types';

interface ProjectChatContextProps {
  projectId: string;
  projectName: string;
}

export const ProjectChatContext = ({ projectId, projectName }: ProjectChatContextProps) => {
  const { clearContexts, addContext, removeContext } = useChatContext();
  const lastSetRef = useRef<{ projectId: string; projectName: string } | null>(null);

  useEffect(() => {
    // Skip if we've already set this exact context
    if (
      lastSetRef.current?.projectId === projectId &&
      lastSetRef.current?.projectName === projectName
    ) {
      return;
    }

    const context: ContextItem = {
      id: projectId,
      type: 'project',
      icon: '📁',
      title: projectName,
      description: `Context: Project "${projectName}"`,
    };
    
    // Clear all existing contexts and set this as the active context
    clearContexts();
    addContext(context);
    lastSetRef.current = { projectId, projectName };
    
    // Cleanup: remove only this specific context when component unmounts
    return () => {
      removeContext(projectId, 'project');
      lastSetRef.current = null;
    };
  }, [projectId, projectName, clearContexts, addContext, removeContext]);

  return null; // This component doesn't render anything
};

