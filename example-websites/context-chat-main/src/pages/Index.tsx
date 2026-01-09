import { ChatProvider, ChatEdgeIndicator, ChatSidebar, useChatContext } from '@/components/chat';
import { SampleReport } from '@/components/SampleReport';

const MainContent = () => {
  const { isOpen, isExpanded } = useChatContext();
  
  const sidebarWidth = isOpen ? (isExpanded ? 700 : 500) : 0;

  return (
    <main
      className="min-h-screen bg-background transition-all duration-300 ease-out"
      style={{ marginRight: sidebarWidth }}
    >
      <SampleReport />
    </main>
  );
};

const Index = () => {
  return (
    <ChatProvider>
      <div className="relative min-h-screen">
        <MainContent />
        <ChatEdgeIndicator />
        <ChatSidebar />
      </div>
    </ChatProvider>
  );
};

export default Index;
