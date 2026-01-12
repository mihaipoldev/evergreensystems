"use client";

import { useChatContext } from '../contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAnglesRight, 
  faChevronDown, 
  faGear, 
  faPenToSquare, 
  faClockRotateLeft,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { ChatHistorySelector } from './ChatHistorySelector';

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
  const { setIsOpen, activeContexts } = useChatContext();

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pb-4"
    style={{
      background: 'linear-gradient(to bottom, hsl(var(--card)) 0%, hsla(var(--card) / 1) 75%, transparent 100%)'
    }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 relative z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="p-0 px-2 h-7 w-7 md:h-7 md:w-7 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-foreground hover:bg-transparent hover:text-foreground hover:scale-110 transition-all duration-300"
            onClick={onSettingsClick}
            title="Chat Settings"
          >
            <FontAwesomeIcon icon={faRobot} className="!h-6 !w-6" />
          </Button>
          <ChatHistorySelector />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-8 md:w-8 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-foreground/90 hover:text-foreground hover:bg-transparent hover:scale-110 transition-all duration-300"
            onClick={onNewChat}
            title="New Chat"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-7 md:w-7 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-foreground/90 hover:text-foreground hover:bg-transparent hover:scale-110 transition-all duration-300"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <FontAwesomeIcon icon={faAnglesRight} className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

