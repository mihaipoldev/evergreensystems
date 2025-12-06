"use client";

import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
} | undefined;

type StoriesProps = {
  section?: Section;
};

const stories = [
  {
    name: 'Austin Evans',
    subtitle: 'from the',
    gradient: 'from-primary/20 to-muted',
    overlayText: '',
    overlayTextLarge: '',
  },
  {
    name: '',
    subtitle: 'not only just,',
    gradient: 'from-primary/20 to-muted',
    overlayText: '',
    overlayTextLarge: '',
  },
  {
    name: '',
    subtitle: 'manually, one by one.',
    gradient: 'from-primary/20 to-muted',
    overlayText: 'Prior to working with',
    overlayTextLarge: 'ColdIQ',
    overlayText2: 'We were sending',
    overlayText3: 'all of our messages',
    overlayTextLarge2: 'manually',
  },
  {
    name: '',
    subtitle: 'you guys.',
    gradient: 'from-primary/20 to-muted',
    overlayText: "It's",
    overlayTextLarge: 'GREAT.',
  },
  {
    name: '',
    subtitle: '',
    gradient: 'from-primary/20 to-muted',
    overlayText: '',
    overlayTextLarge: '',
  },
  {
    name: '',
    subtitle: '',
    gradient: 'from-primary/20 to-muted',
    overlayText: 'We could really get',
    overlayText2: 'more qualified',
    overlayTextLarge: 'list of people',
  },
];

const breakpointColumnsObj = {
  default: 2,
  640: 1,
};

export const Stories = ({ section }: StoriesProps) => {
  // Use section title if available, otherwise use default
  const title = section?.title || 'Stories of [[Success]]';

  return (
    <section id="stories" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <RichText
            as="h2"
            text={title}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground"
          />
        </motion.div>

        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.01 }}
              className="group cursor-pointer"
              style={index === 1 ? { marginTop: '70px' } : {}}
            >
              <div className={`relative rounded-md overflow-hidden aspect-video bg-gradient-to-br ${story.gradient} border border-muted-foreground`}>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-card/60" />
                
                {/* Text Overlays */}
                {story.overlayText && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                    <div className="text-center space-y-2">
                      {story.overlayText && (
                        <p className="text-primary text-sm font-medium drop-shadow-lg" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}>
                          {story.overlayText}
                        </p>
                      )}
                      {story.overlayTextLarge && (
                        <p className="text-primary text-2xl sm:text-3xl font-bold drop-shadow-lg" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.6)' }}>
                          {story.overlayTextLarge}
                        </p>
                      )}
                      {story.overlayText2 && (
                        <p className="text-primary text-sm font-medium drop-shadow-lg mt-2" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}>
                          {story.overlayText2}
                        </p>
                      )}
                      {story.overlayText3 && (
                        <p className="text-primary text-sm font-medium drop-shadow-lg" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}>
                          {story.overlayText3}
                        </p>
                      )}
                      {story.overlayTextLarge2 && (
                        <p className="text-primary text-2xl sm:text-3xl font-bold drop-shadow-lg mt-2" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.6)' }}>
                          {story.overlayTextLarge2}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Play Button - YouTube Style */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <motion.div
                    className="w-32 h-20 rounded-[4px] flex items-center justify-center shadow-lg transition-all duration-100 bg-primary/30 group-hover:bg-primary/30"
                  >
                    <svg
                      className="w-20 h-20 ml-1 transition-colors duration-300 text-primary-foreground fill-primary-foreground"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M9 7 L9 17 L16.5 12 Z" 
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </Masonry>
      </div>
    </section>
  );
};

