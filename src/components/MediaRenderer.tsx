"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@/features/page-builder/media/types";

type MediaRendererProps = {
  media: Media;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  priority?: boolean; // For above-fold images
};

export function MediaRenderer({
  media,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  playsInline = true,
  priority = false,
}: MediaRendererProps) {
  const wistiaContainerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadWistia, setShouldLoadWistia] = useState(false);

  // Intersection Observer to lazy load Wistia scripts only when in viewport
  useEffect(() => {
    if (media.source_type !== "wistia" || !media.embed_id || !wistiaContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadWistia(true);
            observer.disconnect(); // Only load once
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(wistiaContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [media.source_type, media.embed_id]);

  // Wistia rendering
  if (media.source_type === "wistia" && media.embed_id) {
    return (
      <>
        {shouldLoadWistia && (
          <>
            <Script
              id={`wistia-media-${media.embed_id}`}
              src={`https://fast.wistia.com/embed/medias/${media.embed_id}.jsonp`}
              strategy="lazyOnload"
            />
            <Script
              id="wistia-external"
              src="https://fast.wistia.com/assets/external/E-v1.js"
              strategy="lazyOnload"
            />
          </>
        )}
        <div
          ref={wistiaContainerRef}
          className={cn(`wistia_embed wistia_async_${media.embed_id}`, className)}
        />
      </>
    );
  }

  // YouTube rendering
  if (media.source_type === "youtube" && media.embed_id) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${media.embed_id}${autoPlay ? "?autoplay=1" : ""}`}
        className={cn("w-full h-full", className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={media.name || undefined}
      />
    );
  }

  // Vimeo rendering
  if (media.source_type === "vimeo" && media.embed_id) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${media.embed_id}${autoPlay ? "?autoplay=1" : ""}`}
        className={cn("w-full h-full", className)}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={media.name || undefined}
      />
    );
  }

  // Upload rendering - video
  if (media.source_type === "upload" && media.type === "video" && media.url) {
    return (
      <video
        src={media.url}
        poster={media.thumbnail_url || undefined}
        className={cn("w-full h-full object-cover", className)}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline={playsInline}
      />
    );
  }

  // Upload rendering - image
  if (media.source_type === "upload" && media.type === "image" && media.url) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <Image
          src={media.url}
          alt={media.name || "Media"}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
      </div>
    );
  }

  // External URL rendering
  if (media.source_type === "external_url" && media.url) {
    // Try to determine if it's a video or image based on URL extension
    const urlLower = media.url.toLowerCase();
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(urlLower);
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlLower);

    if (isVideo) {
      return (
        <video
          src={media.url}
          poster={media.thumbnail_url || undefined}
          className={cn("w-full h-full object-cover", className)}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
        />
      );
    }

    if (isImage) {
      return (
        <div className={cn("relative w-full h-full", className)}>
          <Image
            src={media.url}
            alt={media.name || "Media"}
            fill
            className="object-cover"
            sizes="100vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        </div>
      );
    }

    // Default to anchor link for other external URLs
    return (
      <a
        href={media.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("text-primary hover:underline", className)}
      >
        {media.name}
      </a>
    );
  }

  // Fallback
  return (
    <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
      <p>Unable to render media: {media.name}</p>
    </div>
  );
}
