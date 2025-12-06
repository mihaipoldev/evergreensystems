"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";
import type { Media } from "@/features/media/types";

type MediaRendererProps = {
  media: Media;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
};

export function MediaRenderer({
  media,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  playsInline = true,
}: MediaRendererProps) {
  const wistiaContainerRef = useRef<HTMLDivElement>(null);

  // Wistia rendering
  if (media.source_type === "wistia" && media.embed_id) {
    return (
      <>
        <Script
          id={`wistia-media-${media.embed_id}`}
          src={`https://fast.wistia.com/embed/medias/${media.embed_id}.jsonp`}
          strategy="afterInteractive"
        />
        <Script
          id="wistia-external"
          src="https://fast.wistia.com/assets/external/E-v1.js"
          strategy="afterInteractive"
        />
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
      <img
        src={media.url}
        alt={media.name || undefined}
        className={cn("w-full h-full object-cover", className)}
      />
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
        <img
          src={media.url}
          alt={media.name || undefined}
          className={cn("w-full h-full object-cover", className)}
        />
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
