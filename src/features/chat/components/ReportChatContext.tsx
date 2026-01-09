"use client";

import { useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import type { ContextItem } from '../types';

interface ReportChatContextProps {
  reportId: string;
  reportTitle: string;
  reportDescription?: string;
}

/**
 * Client component that sets chat context when viewing a report
 * This allows the chat to know which document/report the user is viewing
 */
export function ReportChatContext({
  reportId,
  reportTitle,
  reportDescription,
}: ReportChatContextProps) {
  const { clearContexts, addContext, removeContext } = useChatContext();
  const lastSetRef = useRef<{ reportId: string; reportTitle: string; reportDescription?: string } | null>(null);

  useEffect(() => {
    // Skip if we've already set this exact context
    if (
      lastSetRef.current?.reportId === reportId &&
      lastSetRef.current?.reportTitle === reportTitle &&
      lastSetRef.current?.reportDescription === reportDescription
    ) {
      return;
    }

    const context: ContextItem = {
      id: reportId,
      type: 'document',
      icon: '📄',
      title: reportTitle,
      description: reportDescription || `Chat about this report: ${reportTitle}`,
    };

    // Clear all existing contexts and set this as the active context
    clearContexts();
    addContext(context);
    lastSetRef.current = { reportId, reportTitle, reportDescription };
    
    // Cleanup: remove only this specific context when component unmounts
    return () => {
      removeContext(reportId, 'document');
      lastSetRef.current = null;
    };
  }, [reportId, reportTitle, reportDescription, clearContexts, addContext, removeContext]);

  return null; // This component doesn't render anything
}

