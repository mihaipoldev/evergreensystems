import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatTab } from '@/components/chat/ChatTab';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { BarChart3, FileText, Target, TrendingUp, Users, Zap } from 'lucide-react';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const stats = [
    { label: 'Reports Generated', value: '1,247', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { label: 'Niches Tracked', value: '89', icon: Target, color: 'from-teal-500 to-teal-600' },
    { label: 'Active Users', value: '3,412', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Insights Found', value: '15.2K', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
      
      {/* Main content */}
      <div className="relative">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-10 h-10 rounded-xl gradient-purple-blue flex items-center justify-center">
                  <Zap className="text-white" size={22} />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">NicheIntel</h1>
                  <p className="text-xs text-muted-foreground">B2B Intelligence Platform</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Reports
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Research
                </button>
                <div className="w-8 h-8 rounded-full gradient-purple-blue flex items-center justify-center text-white font-semibold text-sm">
                  U
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="container mx-auto px-6 py-16">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Unlock B2B Market
              <span className="gradient-text"> Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Analyze niches, discover opportunities, and make data-driven decisions with AI-powered research. 
              Click the chat tab to start exploring your reports with our intelligent assistant.
            </p>
            <div className="flex gap-4">
              <motion.button
                className="px-6 py-3 rounded-xl gradient-purple-blue text-white font-semibold shadow-glow-sm"
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(true)}
              >
                Start Chatting
              </motion.button>
              <motion.button
                className="px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Reports
              </motion.button>
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="p-5 rounded-2xl bg-card border border-border/50 hover-lift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="text-white" size={20} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Recent reports section */}
        <section className="container mx-auto px-6 py-12">
          <motion.h3
            className="text-xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Recent Reports
          </motion.h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: '3D Printing Service Providers', score: 68, status: 'Ready' },
              { title: 'SaaS Analytics Tools', score: 82, status: 'Ready' },
              { title: 'Healthcare AI Solutions', score: 74, status: 'Processing' },
            ].map((report, index) => (
              <motion.div
                key={report.title}
                className="p-5 rounded-2xl bg-card border border-border/50 cursor-pointer hover-lift"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -4, borderColor: 'hsl(var(--primary) / 0.3)' }}
                onClick={() => setIsChatOpen(true)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BarChart3 className="text-primary" size={24} />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    report.status === 'Ready' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-accent/10 text-accent'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <h4 className="font-semibold mb-2">{report.title}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-purple-blue"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.score}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">{report.score}/100</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Prompt to open chat */}
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-card border border-border shadow-elevated flex items-center gap-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <span className="text-2xl">💬</span>
          <span className="text-sm text-muted-foreground">
            Click the <span className="font-semibold text-foreground">Chat tab</span> on the right to explore your reports
          </span>
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Chat components */}
      <ChatTab 
        isOpen={isChatOpen} 
        onClick={() => setIsChatOpen(true)} 
        hasNotification={true}
      />
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

export default Index;
