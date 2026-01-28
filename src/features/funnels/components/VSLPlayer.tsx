"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MediaRenderer } from "@/components/MediaRenderer";
import { trackEvent } from "@/lib/analytics";
import { hslToHex } from "@/lib/color-utils";
import type { MediaWithSection } from "@/features/page-builder/media/types";
import type { Media } from "@/features/page-builder/media/types";

function getWistiaVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9]{10}$/.test(url)) return url;
  const patterns = [
    /wistia\.com\/medias\/([a-zA-Z0-9]{10})/,
    /wi\.st\/([a-zA-Z0-9]{10})/,
    /fast\.wistia\.com\/embed\/iframe\/([a-zA-Z0-9]{10})/,
    /fast\.wistia\.com\/embed\/medias\/([a-zA-Z0-9]{10})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function VideoPlayerWithTracking({
  media,
  onFirstPlay,
}: {
  media: Media;
  onFirstPlay: (mediaId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (media.source_type === "wistia") return;
    const el = videoRef.current;
    if (!el) return;
    const key = `video_play_tracked_${media.id}`;
    const handlePlay = () => {
      try {
        if (!!sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "true");
      } catch {
        return;
      }
      onFirstPlay(media.id);
    };
    el.addEventListener("play", handlePlay);
    return () => el.removeEventListener("play", handlePlay);
  }, [media.id, media.source_type, onFirstPlay]);

  if (media.source_type === "wistia") {
    return (
      <MediaRenderer
        media={media}
        className="w-full h-full object-cover"
        autoPlay={false}
        muted={false}
        loop={false}
        controls
        priority
      />
    );
  }
  if (media.source_type === "upload" && media.type === "video" && media.url) {
    return (
      <video
        ref={videoRef}
        src={media.url}
        poster={media.thumbnail_url || undefined}
        className="w-full h-full object-cover"
        autoPlay={false}
        muted={false}
        loop={false}
        controls
        playsInline
      />
    );
  }
  if (media.source_type === "external_url" && media.url) {
    const lower = media.url.toLowerCase();
    if (/\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(lower)) {
      return (
        <video
          ref={videoRef}
          src={media.url}
          poster={media.thumbnail_url || undefined}
          className="w-full h-full object-cover"
          autoPlay={false}
          muted={false}
          loop={false}
          controls
          playsInline
        />
      );
    }
  }
  return (
    <MediaRenderer
      media={media}
      className="w-full h-full object-cover"
      autoPlay={false}
      muted={false}
      loop={false}
      controls
      priority
    />
  );
}

const WISTIA_QUEUE_SCRIPT = (videoId: string) => `
(function() {
  window._wq = window._wq || [];
  var vid = '${videoId}';
  var useCustom = false;
  var custom = '0a7afa';
  var color = '0a7afa';
  if (!useCustom) {
    try {
      var root = document.documentElement;
      var cs = getComputedStyle(root);
      var pv = cs.getPropertyValue('--primary').trim();
      var h, s, l;
      if (pv) {
        var mp = pv.match(/(\\d+)\\s+(\\d+)%\\s+(\\d+)%/);
        if (mp) { h = parseInt(mp[1]); s = parseInt(mp[2]); l = parseInt(mp[3]); }
        else { h = parseInt(cs.getPropertyValue('--brand-h')||'212'); s = parseInt(cs.getPropertyValue('--brand-s')||'96'); l = parseInt(cs.getPropertyValue('--brand-l')||'51'); }
      } else { h = parseInt(cs.getPropertyValue('--brand-h')||'212'); s = parseInt(cs.getPropertyValue('--brand-s')||'96'); l = parseInt(cs.getPropertyValue('--brand-l')||'51'); }
      s = s / 100; l = l / 100;
      var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
      if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
      else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
      else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
      else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
      else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
      else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
      r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255);
      color = [r,g,b].map(function(n){ var hex = n.toString(16); return hex.length === 1 ? '0' + hex : hex; }).join('');
    } catch(e) {}
  } else { color = custom.replace('#', ''); }
  window._wq.push({ id: vid, options: { playerColor: color } });
})();
`;

export type VSLPlayerProps = {
  mainMedia?: MediaWithSection | null;
  videoId?: string | null;
  mediaUrl?: string | null;
  className?: string;
};

export function VSLPlayer({
  mainMedia,
  videoId: videoIdProp,
  mediaUrl,
  className = "",
}: VSLPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadWistia, setShouldLoadWistia] = useState(false);
  const isTrackingRef = useRef(false);
  const handlerBoundRef = useRef(false);

  const videoId =
    mainMedia?.embed_id ||
    (mainMedia?.source_type === "wistia" && mainMedia?.embed_id ? mainMedia.embed_id : null) ||
    videoIdProp ||
    getWistiaVideoId(mediaUrl) ||
    null;
  const mediaId = mainMedia?.id || videoId || "unknown";

  const handleVideoPlay = (id: string) => {
    if (isTrackingRef.current) return;
    const key = `video_play_tracked_${id}`;
    try {
      if (!!sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "true");
    } catch {
      if (isTrackingRef.current) return;
    }
    isTrackingRef.current = true;
    trackEvent({
      event_type: "link_click",
      entity_type: "media",
      entity_id: id,
      metadata: { location: "hero_section", action: "play" },
    }).finally(() => {
      isTrackingRef.current = false;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || !videoId) return;
    const getPrimaryHex = () => {
      try {
        const root = document.documentElement;
        const cs = getComputedStyle(root);
        const pv = cs.getPropertyValue("--primary").trim();
        let h: number, s: number, l: number;
        if (pv) {
          const match = pv.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          if (match) {
            h = parseInt(match[1]);
            s = parseInt(match[2]);
            l = parseInt(match[3]);
          } else {
            h = parseInt(cs.getPropertyValue("--brand-h").trim() || "212");
            s = parseInt(cs.getPropertyValue("--brand-s").trim() || "96");
            l = parseInt(cs.getPropertyValue("--brand-l").trim() || "51");
          }
        } else {
          h = parseInt(cs.getPropertyValue("--brand-h").trim() || "212");
          s = parseInt(cs.getPropertyValue("--brand-s").trim() || "96");
          l = parseInt(cs.getPropertyValue("--brand-l").trim() || "51");
        }
        return hslToHex(h, s, l);
      } catch {
        return "#0a7afa";
      }
    };
    const hex = getPrimaryHex();
    const hexNoHash = hex.replace("#", "");
    (window as any)._wq = (window as any)._wq || [];
    (window as any)._wq = (window as any)._wq.filter((item: any) => item.id !== videoId);
    const handlerKey = `wistia_handler_bound_${videoId}`;
    const trackingKey = `video_play_tracked_${mediaId}`;
    (window as any)._wq.push({
      id: videoId,
      options: { playerColor: hexNoHash, playerColorFade: false },
      onReady(video: any) {
        try {
          if (typeof video.playerColor === "function") video.playerColor(hexNoHash);
        } catch {}
        try {
          let hasTracked = false;
          let handlerBound = false;
          try {
            hasTracked = !!sessionStorage.getItem(trackingKey);
            handlerBound = !!sessionStorage.getItem(handlerKey);
          } catch {}
          if (!hasTracked && !handlerBound) {
            try {
              sessionStorage.setItem(handlerKey, "true");
            } catch {}
            handlerBoundRef.current = true;
            try {
              video.unbind("play");
            } catch {}
            video.bind("play", () => handleVideoPlay(mediaId));
          }
        } catch {}
      },
    });
  }, [videoId, mediaId]);

  useEffect(() => {
    if (!containerRef.current || !videoId) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadWistia(true);
          obs.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [videoId]);

  if (mainMedia && !videoId) {
    return (
      <div ref={containerRef} className={`w-full h-full overflow-hidden rounded-lg ${className}`.trim()}>
        <VideoPlayerWithTracking media={mainMedia} onFirstPlay={handleVideoPlay} />
      </div>
    );
  }

  if (videoId) {
    return (
      <>
        <Script
          key={`wistia-queue-vsl-${videoId}`}
          id={`wistia-queue-vsl-${videoId}`}
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: WISTIA_QUEUE_SCRIPT(videoId) }}
        />
        {shouldLoadWistia && (
          <>
            <Script
              key={`wistia-media-vsl-${videoId}`}
              src={`https://fast.wistia.com/embed/medias/${videoId}.jsonp`}
              strategy="lazyOnload"
            />
            <Script
              key="wistia-external-vsl"
              src="https://fast.wistia.com/assets/external/E-v1.js"
              strategy="lazyOnload"
            />
          </>
        )}
        <div
          ref={containerRef}
          className={`wistia_responsive_padding relative w-full overflow-hidden rounded-lg ${className}`.trim()}
          style={{ padding: "56.25% 0 0 0", position: "relative" }}
        >
          <div
            className="wistia_responsive_wrapper"
            style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}
          >
            <div
              className={`wistia_embed wistia_async_${videoId} seo=false videoFoam=true`}
              style={{ height: "100%", position: "relative", width: "100%" }}
            />
          </div>
        </div>
      </>
    );
  }

  return null;
}
