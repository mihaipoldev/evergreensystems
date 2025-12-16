"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { RichText } from '@/components/ui/RichText';
import { MediaRenderer } from '@/components/MediaRenderer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
} | undefined;

type StoryMedia = {
  id: string;
  type: string;
  source_type: string;
  url: string;
  embed_id?: string | null;
  name?: string | null;
  thumbnail_url?: string | null;
  duration?: number | null;
  created_at?: string;
  updated_at?: string;
  section_media: {
    id: string;
    role: string;
    sort_order: number;
    created_at: string;
  };
};

type StoriesProps = {
  section?: Section;
  media?: StoryMedia[];
};

const breakpointColumnsObj = {
  default: 2,
  640: 1,
};

export const Stories = ({ section, media = [] }: StoriesProps) => {
  const [selectedMedia, setSelectedMedia] = useState<StoryMedia | null>(null);
  
  // Use section title if available, otherwise use default
  const title = section?.title || 'Stories of [[Success]]';

  // Sort media by sort_order
  const sortedMedia = [...media].sort((a, b) => 
    a.section_media.sort_order - b.section_media.sort_order
  );

  // If no media, don't render the section
  if (sortedMedia.length === 0) {
    return null;
  }

  return (
    <>
      <section id="stories" className="py-12 md:py-20 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {section?.eyebrow && (
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {section.eyebrow}
              </span>
            )}
            <RichText
              as="h2"
              text={title}
              className="text-2xl md:text-5xl font-bold text-foreground mt-4 leading-tight"
            />
          </motion.div>

          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {sortedMedia.map((mediaItem, index) => (
              <motion.div
                key={mediaItem.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.01 }}
                className="group cursor-pointer"
                style={index === 1 ? { marginTop: '70px' } : {}}
                onClick={() => setSelectedMedia(mediaItem)}
              >
                <div className="relative rounded-md overflow-hidden aspect-video bg-gradient-to-br from-primary/20 to-muted border border-muted-foreground">
                  {/* Media Renderer - Thumbnail/Preview */}
                  <div className="absolute inset-0">
                    <MediaRenderer
                      media={mediaItem as any}
                      className="w-full h-full"
                      autoPlay={false}
                      muted={true}
                      loop={false}
                      controls={false}
                      playsInline={true}
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-card/60 group-hover:bg-card/40 transition-colors" />
                  
                  {/* Play Button - YouTube Style */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <motion.div
                      className="w-32 h-20 rounded-[4px] flex items-center justify-center shadow-lg transition-all duration-100 bg-primary/30 group-hover:bg-primary/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
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

      {/* Video Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="max-w-4xl w-full p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{selectedMedia.name || "Video"}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden p-6 pt-0">
              <MediaRenderer
                media={selectedMedia as any}
                className="w-full h-full"
                autoPlay={true}
                muted={false}
                loop={false}
                controls={true}
                playsInline={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

