"use client";

/**
 * Hero Component with Wistia Video Embed
 * 
 * WISTIA PLAYER COLOR CUSTOMIZATION:
 * ===================================
 * The Wistia player color is automatically set based on your primary brand color.
 * The playerColor API affects BOTH the play button AND the progress bar.
 * 
 * TO CHANGE COLOR TO FOLLOW PRIMARY:
 * 1. Update your primary brand color in:
 *    - Admin: /admin/settings → Appearance → Primary Color (EASIEST)
 *    - OR CSS: src/app/globals.css (--brand-h, --brand-s, --brand-l variables)
 * 
 * TO USE A CUSTOM COLOR (different from primary):
 * 1. Open this file (Hero.tsx) and find the script around line 200-210
 * 2. Change: var useCustomColor = true;
 * 3. Set: var customColor = 'yourhexcolor'; (without # symbol)
 *    Example: var customColor = 'ff5733'; // Red
 * 
 * The color is automatically converted from HSL to hex and passed to Wistia.
 * Current setup uses Wistia Queue (_wq) to set playerColor before video loads.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { hslToHex } from '@/lib/color-utils';
import { RichText } from '@/components/ui/RichText';
import { MediaRenderer } from '@/components/MediaRenderer';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { MediaWithSection } from '@/features/page-builder/media/types';
import type { CTAButtonWithSection } from '@/features/page-builder/cta/types';
import type { Media } from '@/features/page-builder/media/types';

type HeroContent = {
  topBanner?: {
    text?: string;
    visible?: boolean;
  };
  bottomBar?: {
    text?: string;
    visible?: boolean;
  };
};

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  content: any | null;
  media_url: string | null;
  media?: MediaWithSection[];
  ctaButtons?: CTAButtonWithSection[];
} | undefined;

type HeroProps = {
  section?: Section;
  ctaButtons?: CTAButtonWithSection[];
};

// Component to wrap MediaRenderer and track first play event for non-Wistia videos
function VideoPlayerWithTracking({ 
  media, 
  onFirstPlay 
}: { 
  media: Media; 
  onFirstPlay: (mediaId: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Only track play events for non-Wistia videos (Wistia tracking is handled separately)
    if (media.source_type === 'wistia') {
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Use sessionStorage to persist tracking state
    const trackingKey = `video_play_tracked_${media.id}`;
    
    const handlePlay = () => {
      // Check if we've already tracked this video in this session
      let hasTracked = false;
      try {
        hasTracked = !!sessionStorage.getItem(trackingKey);
      } catch (e) {
        // sessionStorage might not be available
        return;
      }
      
      // Only track if we haven't already tracked a play for this video
      if (!hasTracked) {
        try {
          sessionStorage.setItem(trackingKey, 'true');
        } catch (e) {
          // If sessionStorage fails, skip tracking
          return;
        }
        onFirstPlay(media.id);
      }
    };

    videoElement.addEventListener('play', handlePlay);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
    };
  }, [media.id, media.source_type, onFirstPlay]);

  // For Wistia videos, MediaRenderer handles rendering
  // Tracking is handled separately in the parent Hero component via Wistia queue
  // So we don't set up tracking here for Wistia videos to avoid duplicates
  if (media.source_type === 'wistia') {
    return (
      <MediaRenderer
        media={media}
        className="w-full h-full"
        autoPlay={false}
        muted={false}
        loop={false}
        controls={true}
        priority={true}
      />
    );
  }

  // For uploaded videos, we need to render with a ref
  if (media.source_type === 'upload' && media.type === 'video' && media.url) {
    return (
      <video
        ref={videoRef}
        src={media.url}
        poster={media.thumbnail_url || undefined}
        className="w-full h-full object-cover"
        autoPlay={false}
        muted={false}
        loop={false}
        controls={true}
        playsInline={true}
      />
    );
  }

  // For external URL videos
  if (media.source_type === 'external_url' && media.url) {
    const urlLower = media.url.toLowerCase();
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(urlLower);
    
    if (isVideo) {
      return (
        <video
          ref={videoRef}
          src={media.url}
          poster={media.thumbnail_url || undefined}
          className="w-full h-full object-cover"
          autoPlay={false}
          muted={false}
          loop={false}
          controls={true}
          playsInline={true}
        />
      );
    }
  }

  // For YouTube/Vimeo, we can't easily track play events via iframe
  // These will rely on their own analytics or we'd need to use their APIs
  return (
    <MediaRenderer
      media={media}
      className="w-full h-full"
      autoPlay={false}
      muted={false}
      loop={false}
      controls={true}
      priority={true}
    />
  );
}

export const Hero = ({ section, ctaButtons }: HeroProps) => {
  const wistiaContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadWistia, setShouldLoadWistia] = useState(false);
  const hasTrackedPlayRef = useRef<boolean>(false); // Track if we've already recorded the first play
  const wistiaHandlerBoundRef = useRef<boolean>(false); // Track if we've already bound the Wistia handler
  const isTrackingRef = useRef<boolean>(false); // Prevent concurrent tracking calls
  const [primaryColor, setPrimaryColor] = useState<string>('hsl(var(--primary) / 0.2)');
  const [secondaryColor, setSecondaryColor] = useState<string>('hsl(var(--secondary) / 0.2)');
  
  // Use section data if available, otherwise use defaults
  const title = section?.title || 'Your Entire Outbound System\nFully Automated.';
  const subtitle = section?.subtitle || 'Built for B2B teams who want consistent meetings.';
  
  // Parse content JSON safely
  const parseHeroContent = (content: any): HeroContent | null => {
    if (!content) return null;
    
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      return {
        topBanner: parsed?.topBanner,
        bottomBar: parsed?.bottomBar,
      };
    } catch (error) {
      console.warn('Failed to parse hero content JSON:', error);
      return null;
    }
  };

  const heroContent = parseHeroContent(section?.content);

  // Debug: Log content for troubleshooting
  if (process.env.NODE_ENV === 'development' && section?.content) {
    console.log('Hero section content:', section.content);
    console.log('Parsed hero content:', heroContent);
  }

  // Top banner configuration - now uses eyebrow field from section
  const topBannerText = section?.eyebrow || 'FOR B2B COMPANIES ABOVE $100K/MO IN REVENUE';
  const topBannerVisible = !!section?.eyebrow;

  // Bottom bar configuration  
  // Show if: JSON is valid AND bottomBar exists AND (visible is not false) AND text exists
  const bottomBarText = heroContent?.bottomBar?.text || 'No pressure | Short call | See if it\'s a fit';
  const bottomBarVisible = heroContent !== null && 
                           heroContent?.bottomBar &&
                           heroContent.bottomBar.visible !== false &&
                           !!heroContent.bottomBar.text;
  
  // Get CTA buttons from props or section
  const buttons = ctaButtons || section?.ctaButtons || [];
  
  // Sort buttons by position
  const sortedButtons = [...buttons].sort((a, b) => 
    a.section_cta_button.position - b.section_cta_button.position
  );
  
  // Get main media from media array, or fall back to media_url for backward compatibility
  const mainMedia = section?.media?.find(m => m.section_media.role === 'main') || 
                    (section?.media && section.media.length > 0 ? section.media[0] : null);

  // Handle CTA button click tracking in hero section
  const handleHeroCTAClick = (button: CTAButtonWithSection) => {
    trackEvent({
      event_type: "link_click",
      entity_type: "cta_button",
      entity_id: button.id,
      metadata: {
        location: "hero_section",
        href: button.url,
        label: button.label,
      },
    });
  };

  // Handle video play tracking - only track the FIRST play event
  // Use sessionStorage to persist tracking state across re-renders and video re-initializations
  const handleVideoPlay = (mediaId: string) => {
    // Prevent concurrent calls (race condition protection)
    if (isTrackingRef.current) {
      return;
    }
    
    // Create a unique key for this video in this session
    const trackingKey = `video_play_tracked_${mediaId}`;
    
    // Check if we've already tracked this video in this session
    // Use a synchronous check to prevent race conditions
    let hasTracked = false;
    try {
      hasTracked = !!sessionStorage.getItem(trackingKey);
    } catch (e) {
      // sessionStorage might not be available (private browsing, etc.)
      // Fall back to ref-based tracking
      hasTracked = hasTrackedPlayRef.current;
    }
    
    // Double-check: if already tracked, immediately return
    if (hasTracked) {
      return;
    }
    
    // Mark as tracking to prevent concurrent calls
    isTrackingRef.current = true;
    
    // Mark as tracked IMMEDIATELY to prevent duplicate events
    try {
      sessionStorage.setItem(trackingKey, 'true');
    } catch (e) {
      // If sessionStorage fails, use ref only
    }
    hasTrackedPlayRef.current = true;
    
    // Now track the event
    trackEvent({
      event_type: "link_click",
      entity_type: "media",
      entity_id: mediaId,
      metadata: {
        location: "hero_section",
        action: "play",
      },
    }).finally(() => {
      // Reset tracking flag after event is sent
      isTrackingRef.current = false;
    });
  };
  
  // Extract Wistia video ID from media_url
  const getWistiaVideoId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    // Check if it's a direct Wistia video ID (alphanumeric string)
    if (/^[a-zA-Z0-9]{10}$/.test(url)) {
      return url;
    }
    
    // Try to extract from Wistia URL patterns
    const patterns = [
      /wistia\.com\/medias\/([a-zA-Z0-9]{10})/,
      /wi\.st\/([a-zA-Z0-9]{10})/,
      /fast\.wistia\.com\/embed\/iframe\/([a-zA-Z0-9]{10})/,
      /fast\.wistia\.com\/embed\/medias\/([a-zA-Z0-9]{10})/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };
  
  // Use media from new system if available, otherwise fall back to media_url
  const videoId = mainMedia?.embed_id || 
                  (mainMedia?.source_type === 'wistia' && mainMedia.embed_id ? mainMedia.embed_id : null) ||
                  getWistiaVideoId(section?.media_url) ||
                  null;

  useEffect(() => {
    // Get primary color from CSS variable and convert to hex
    const getPrimaryColor = () => {
      if (typeof window === 'undefined') {
        return '#0a7afa';
      }
      
      try {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        // Try to read from --primary first (supports any format)
        let primaryValue = computedStyle.getPropertyValue('--primary').trim();
        
        let h, s, l;
        
        if (primaryValue) {
          // Parse from --primary format: "H S% L%" (e.g., "108 65% 50%")
          const hslMatch = primaryValue.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
          if (hslMatch) {
            h = parseInt(hslMatch[1]);
            s = parseInt(hslMatch[2]);
            l = parseInt(hslMatch[3]);
          } else {
            // Fallback to brand variables
            h = parseInt(computedStyle.getPropertyValue('--brand-h').trim() || '212');
            s = parseInt(computedStyle.getPropertyValue('--brand-s').trim() || '96');
            l = parseInt(computedStyle.getPropertyValue('--brand-l').trim() || '51');
          }
        } else {
          // Fallback to brand variables
          h = parseInt(computedStyle.getPropertyValue('--brand-h').trim() || '212');
          s = parseInt(computedStyle.getPropertyValue('--brand-s').trim() || '96');
          l = parseInt(computedStyle.getPropertyValue('--brand-l').trim() || '51');
        }
        
        // Use the utility function for accurate conversion
        return hslToHex(h, s, l);
      } catch (e) {
        // Fallback if any error occurs
        return '#0a7afa';
      }
    };

    // Initialize Wistia Queue - simplified for mobile performance
    if (typeof window !== 'undefined' && videoId) {
      const primaryColor = getPrimaryColor();
      const hexWithoutHash = primaryColor.replace('#', '');
      const mediaId = mainMedia?.id || videoId || 'unknown';
      
      // Initialize Wistia Queue if not already initialized
      (window as any)._wq = (window as any)._wq || [];
      
      // Remove any existing queue item for this video to prevent duplicate bindings
      (window as any)._wq = (window as any)._wq.filter((item: any) => item.id !== videoId);
      
      // Note: We don't reset the handler bound flag here because we want to ensure
      // the handler is only bound once per video, even across re-renders
      // The sessionStorage check in onReady will handle this
      
      // Push player options to queue BEFORE embed - simplified
      (window as any)._wq.push({
        id: videoId,
        options: {
          playerColor: hexWithoutHash,
          playerColorFade: false,
        },
        onReady: function(video: any) {
          // Set color once when ready - no excessive retries
          try {
            if (typeof video.playerColor === 'function') {
              video.playerColor(hexWithoutHash);
            }
          } catch (e) {
            // Silently fail - don't crash the page
            console.warn('Could not set Wistia color:', e);
          }
          
          // Track video play event - only the FIRST play (not pauses/resumes)
          // Check sessionStorage BEFORE binding to prevent duplicate handlers
          try {
            const trackingKey = `video_play_tracked_${mediaId}`;
            const handlerKey = `wistia_handler_bound_${videoId}`;
            
            // Check if we've already tracked this video in this session
            let hasTracked = false;
            try {
              hasTracked = !!sessionStorage.getItem(trackingKey);
            } catch (e) {
              // sessionStorage might not be available
              hasTracked = hasTrackedPlayRef.current;
            }
            
            // Check if handler has already been bound (using sessionStorage for persistence)
            let handlerBound = false;
            try {
              handlerBound = !!sessionStorage.getItem(handlerKey);
            } catch (e) {
              handlerBound = wistiaHandlerBoundRef.current;
            }
            
            // Only bind handler once per video instance, and only if not already tracked
            if (!hasTracked && !handlerBound) {
              // Mark handler as bound immediately
              try {
                sessionStorage.setItem(handlerKey, 'true');
              } catch (e) {
                // If sessionStorage fails, use ref
              }
              wistiaHandlerBoundRef.current = true;
              
              // Unbind any existing handlers first (safety check)
              try {
                video.unbind('play');
              } catch (e) {
                // Ignore errors from unbind
              }
              
              // Bind the play event handler
              video.bind('play', function() {
                handleVideoPlay(mediaId);
              });
            }
          } catch (e) {
            console.warn('Could not bind Wistia play event:', e);
          }
        }
      });
    }
    
    // Note: We don't reset the tracking flag here because we want to persist
    // the "already tracked" state across re-renders. sessionStorage handles this.
    // The tracking will only reset when the user starts a new browser session.
    
    // No cleanup needed - Wistia queue persists
  }, [videoId, mainMedia?.id]);

  // Intersection Observer to lazy load Wistia scripts only when video is in viewport
  useEffect(() => {
    if (!videoContainerRef.current || !videoId) return;

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

    observer.observe(videoContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoId]);

  // Update glow orb colors from CSS variables
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const primary = computedStyle.getPropertyValue('--primary').trim();
      const secondary = computedStyle.getPropertyValue('--secondary').trim();
      
      // Format as hsl() with opacity
      setPrimaryColor(`hsl(${primary} / 0.2)`);
      setSecondaryColor(`hsl(${secondary} / 0.2)`);
    };

    updateColors();

    // Watch for changes to CSS variables
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Also listen for custom events that might indicate color changes
    window.addEventListener('colorsUpdated', updateColors);

    return () => {
      observer.disconnect();
      window.removeEventListener('colorsUpdated', updateColors);
    };
  }, []);

  return (
    <section className="relative flex items-center justify-center pt-[80px] md:pt-[124px] overflow-x-hidden md:pb-8 pb-4 overflow-y-visible">

      
      {/* Animated Glow Orbs */}
      <motion.div
        className="absolute top-2/4 left-1/4 md:h-72 w-50 h-50 rounded-full blur-3xl"
        style={{
          backgroundColor: primaryColor,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 md:w-72 md:h-72 w-60 h-40 rounded-full blur-3xl"
        style={{
          backgroundColor: secondaryColor,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        {topBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex mb-6 w-full sm:w-auto justify-center"
            style={{ maxWidth: '100%' }}
          >
            {/* Gradient Border Container */}
            <div className="relative inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 rounded-full text-xs font-regular min-w-0">
              {/* Gradient Border - positioned behind content */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(84deg, hsl(var(--primary)/50%), hsl(var(--secondary)/50%) 92%)',
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  zIndex: 0,
                }}
              />
              {/* Content - positioned above border */}
              <span 
                className="w-[12px] h-[12px] rounded-full animate-pulse flex-shrink-0 relative z-10"
                style={{
                  backgroundImage: 'linear-gradient(84deg, hsl(var(--primary)), hsl(var(--secondary)) 92%)',
                }}
              />
              <span className="uppercase font-medium text-[10px] md:text-[12px] text-foreground relative z-10">{topBannerText}</span>
            </div>
          </motion.div>
        )}

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-5xl mx-auto mb-4 md:mb-6"
        >
        <h1 className="heading-2xl leading-tight md:leading-none text-[22px] md:text-[50px] font-bold">
          We Build & Run Outbound Systems That <b className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Books Qualified Sales Calls</b>
        </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <RichText
            as="p"
            text={subtitle}
            className="font-regular text-[14px] md:text-[15px] text-foreground max-w-2xl mx-auto mb-8 md:mb-8 "
          />
        </motion.div>

        {/* Initialize Wistia Queue BEFORE any scripts - only if videoId exists */}
        {videoId && (
          <>
            <Script
              key={`wistia-queue-${videoId}`}
              id="wistia-queue-setup"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    window._wq = window._wq || [];
                    
                    var videoId = '${videoId}';
                    
                    // ============================================
                    // WISTIA PLAYER COLOR CONFIGURATION
                    // ============================================
                    // To use a CUSTOM color (different from primary):
                    // Change the hex value below (without the # symbol)
                    // Example: var customColor = 'ff5733'; // Red
                    // Then set: var useCustomColor = true;
                    // ============================================
                    var useCustomColor = false; // Set to true to use custom color below
                    var customColor = '0a7afa'; // Your custom hex color (without #)
                    
                    var color = '0a7afa'; // Default blue
                    
                    if (!useCustomColor) {
                      // Auto-detect from primary brand color - read computed value
                      try {
                        var root = document.documentElement;
                        var computedStyle = getComputedStyle(root);
                        
                        // First, try to read the computed --primary value directly
                        // This will work if --primary is set directly or resolves from --brand variables
                        var primaryValue = computedStyle.getPropertyValue('--primary').trim();
                        var h, s, l;
                        
                        if (primaryValue) {
                          // Parse from --primary format: "H S% L%" (e.g., "108 65% 50%")
                          var hslMatch = primaryValue.match(/(\\d+)\\s+(\\d+)%\\s+(\\d+)%/);
                          if (hslMatch) {
                            h = parseInt(hslMatch[1]);
                            s = parseInt(hslMatch[2]);
                            l = parseInt(hslMatch[3]);
                          } else {
                            // Fallback to brand variables if --primary format doesn't match
                            h = parseInt(computedStyle.getPropertyValue('--brand-h') || '212');
                            s = parseInt(computedStyle.getPropertyValue('--brand-s') || '96');
                            l = parseInt(computedStyle.getPropertyValue('--brand-l') || '51');
                          }
                        } else {
                          // Fallback to brand variables if --primary is not set
                          h = parseInt(computedStyle.getPropertyValue('--brand-h') || '212');
                          s = parseInt(computedStyle.getPropertyValue('--brand-s') || '96');
                          l = parseInt(computedStyle.getPropertyValue('--brand-l') || '51');
                        }
                        
                        // Convert HSL to hex
                        s = s / 100;
                        l = l / 100;
                        var c = (1 - Math.abs(2 * l - 1)) * s;
                        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                        var m = l - c / 2;
                        var r = 0, g = 0, b = 0;
                        
                        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
                        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
                        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
                        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
                        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
                        else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
                        
                        r = Math.round((r + m) * 255);
                        g = Math.round((g + m) * 255);
                        b = Math.round((b + m) * 255);
                        color = [r, g, b].map(function(x) {
                          var hex = x.toString(16);
                          return hex.length === 1 ? '0' + hex : hex;
                        }).join('');
                      } catch(e) {
                        console.error('Error getting primary color:', e);
                      }
                    } else {
                      // Use custom color
                      color = customColor.replace('#', '');
                    }
                    
                    // Set player color - this affects BOTH play button AND progress bar
                    window._wq.push({
                      id: videoId,
                      options: {
                        playerColor: color
                      }
                    });
                  })();
                `
              }}
            />
            
            {/* Wistia Scripts - Load only when in viewport */}
            {shouldLoadWistia && (
              <>
                <Script
                  key={`wistia-media-${videoId}`}
                  src={`https://fast.wistia.com/embed/medias/${videoId}.jsonp`}
                  strategy="lazyOnload"
                  onError={(e) => {
                    console.error('Wistia media script failed to load:', e);
                    // Don't crash the page if Wistia fails
                  }}
                />
                <Script
                  key="wistia-external"
                  src="https://fast.wistia.com/assets/external/E-v1.js"
                  strategy="lazyOnload"
                  onError={(e) => {
                    console.error('Wistia external script failed to load:', e);
                    // Don't crash the page if Wistia fails
                  }}
                />
              </>
            )}
          </>
        )}

        {/* Video Container */}
        <motion.div
          ref={videoContainerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative w-full mb-8 md:mb-8 flex justify-center"
        >
          {/* Gradient Background Container */}
          <div
            className="w-full max-w-[800px] rounded-2xl p-[1px] relative group"
          
          >
            {/* Glow Effect on Hover - Gradient from left (secondary) to right (primary) - Behind the video */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none -z-10 overflow-hidden" 
              style={{ 
                background: 'linear-gradient(84deg, hsl(var(--secondary) / 0.1), hsl(var(--primary) / 0.1) 92%)',
                filter: 'blur(30px)',
                transform: 'scale(1.1)',
              }} 
            />
            
            {/* Black Inner Container */}
            <div className="bg-transparent rounded-2xl p-[0px] relative w-full">
              {/* Media Container */}
              {mainMedia ? (
                <div 
                  className="w-full aspect-video rounded-lg overflow-hidden"
                >
                  <VideoPlayerWithTracking
                    media={mainMedia}
                    onFirstPlay={handleVideoPlay}
                  />
                </div>
              ) : videoId ? (
              <div className="wistia_responsive_padding relative w-full overflow-hidden rounded-lg" style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <div className="wistia_responsive_wrapper" style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }}>
                  <div 
                    ref={wistiaContainerRef}
                    className={`wistia_embed wistia_async_${videoId} seo=false videoFoam=true`}
                    style={{ 
                      height: '100%',
                      position: 'relative',
                      width: '100%',
                      '--wistia-player-color': '#0a7afa'
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        {sortedButtons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center items-start max-w-2xl mx-auto"
          >
            {sortedButtons.map((button, index) => (
              <div key={button.id} className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    opacity: { duration: 0.7, delay: 0.4 + index * 0.1 },
                    y: { duration: 0.7, delay: 0.4 + index * 0.1 },
                    scale: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    className={cn(
                      "h-14 px-12 font-semibold whitespace-nowrap text-[15px] md:text-[16px] transition-all duration-150",
                      button.style === "primary" || !button.style
                        ? "bg-primary hover:bg-primary text-primary-foreground"
                        : button.style === "secondary"
                        ? "bg-secondary hover:bg-secondary text-secondary-foreground"
                        : "bg-primary hover:bg-primary text-primary-foreground"
                    )}
                  >
                    <Link 
                      href={button.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHeroCTAClick(button);
                      }}
                      className="flex items-center"
                    >
                      {button.label}
                      <FontAwesomeIcon
                        icon={(button.icon as any) || faArrowRight}
                        className="ml-2 h-5 w-5"
                      />
                    </Link>
                  </Button>
                </motion.div>
                {button.subtitle && (
                  <p className="text-sm text-muted-foreground mt-4 text-center max-w-ms">
                    See if this system makes sense for your business.
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Trust Indicator */}
        {bottomBarVisible && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-sm text-muted-foreground mt-6"
          >
            {bottomBarText}
          </motion.p>
        )}
      </div>
    </section>
  );
};

