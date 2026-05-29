"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import SectionEyebrow from "./SectionEyebrow";
import type { SystemDiagramContent } from "../types";

interface SystemDiagramSectionProps {
  content: SystemDiagramContent;
}

const SystemDiagramSection = ({ content }: SystemDiagramSectionProps) => {
  return (
    <section id={content.sectionId} className="section-spacing">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center md:mb-10 mb-6">
          {content.eyebrow && <SectionEyebrow label={content.eyebrow} />}
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-foreground md:mb-4 mb-3">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="md:body-lg body-md text-foreground/80 max-w-2xl mx-auto">
              {content.subheading}
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden border border-border/70 bg-background/70 backdrop-blur-sm shadow-sm"
        >
          <Image
            src={content.imageSrc}
            alt={content.imageAlt}
            width={2000}
            height={1700}
            className="w-full h-auto block"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
            priority={false}
          />
        </motion.div>

        {content.caption && (
          <p className="text-center text-sm md:text-base text-muted-foreground mt-4 max-w-3xl mx-auto">
            {content.caption}
          </p>
        )}
      </div>
    </section>
  );
};

export default SystemDiagramSection;
