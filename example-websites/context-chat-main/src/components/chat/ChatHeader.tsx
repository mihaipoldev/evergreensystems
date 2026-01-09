import { useChatContext } from './ChatContext';
import { Button } from '@/components/ui/button';
import { Minus, Maximize2, X, ChevronDown, Settings, RefreshCw, History } from 'lucide-react';

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  onContextClick: () => void;
  onNewChat: () => void;
}

export const ChatHeader = ({
  onSettingsClick,
  onHistoryClick,
  onContextClick,
  onNewChat,
}: ChatHeaderProps) => {
  const { setIsOpen, isExpanded, setIsExpanded, activeContext } = useChatContext();

  return (
    <div className="flex-shrink-0 border-b border-border">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h2 className="font-semibold text-foreground">Chat</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context indicator */}
      <div className="px-4 pb-3">
        <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
          <span>🎯</span>
          <span>Chatting with:</span>
        </div>
        <button
          onClick={onContextClick}
          className="w-full flex items-center justify-between p-2.5 bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{activeContext.icon}</span>
            <span className="font-medium text-sm text-foreground truncate">
              {activeContext.title}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
        </button>
        {activeContext.description && (
          <p className="text-xs text-muted-foreground mt-1.5 px-1">
            {activeContext.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={onSettingsClick}
        >
          <Settings className="h-3.5 w-3.5" />
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={onNewChat}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={onHistoryClick}
        >
          <History className="h-3.5 w-3.5" />
          History
        </Button>
      </div>
    </div>
  );
};
