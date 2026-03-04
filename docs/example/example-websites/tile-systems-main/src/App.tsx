import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import KnowledgeBases from "./pages/KnowledgeBases";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-14 border-b border-border flex items-center px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20">
                <SidebarTrigger className="h-8 w-8" />
              </header>
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/knowledge-bases" element={<KnowledgeBases />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
