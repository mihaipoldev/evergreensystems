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
import { hslToHex } from '@/lib/color-utils';
import { RichText } from '@/components/ui/RichText';
import { MediaRenderer } from '@/components/MediaRenderer';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import type { MediaWithSection } from '@/features/media/types';
import type { CTAButtonWithSection } from '@/features/cta/types';

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
  content: any | null;
  media_url: string | null;
  media?: MediaWithSection[];
  ctaButtons?: CTAButtonWithSection[];
} | undefined;

type HeroProps = {
  section?: Section;
  ctaButtons?: CTAButtonWithSection[];
};

export const Hero = ({ section, ctaButtons }: HeroProps) => {
  const wistiaContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [shouldLoadWistia, setShouldLoadWistia] = useState(false);
  
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

  // Top banner configuration
  // Show if: JSON is valid AND topBanner exists AND (visible is not false) AND text exists
  const topBannerText = heroContent?.topBanner?.text || 'FOR B2B COMPANIES ABOVE $100K/MO IN REVENUE';
  const topBannerVisible = heroContent !== null && 
                           heroContent?.topBanner &&
                           heroContent.topBanner.visible !== false &&
                           !!heroContent.topBanner.text;

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

  // Handle video play tracking
  const handleVideoPlay = (mediaId: string) => {
    trackEvent({
      event_type: "link_click",
      entity_type: "media",
      entity_id: mediaId,
      metadata: {
        location: "hero_section",
        action: "play",
      },
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
      
      // Initialize Wistia Queue if not already initialized
      (window as any)._wq = (window as any)._wq || [];
      
      // Remove any existing queue item for this video
      (window as any)._wq = (window as any)._wq.filter((item: any) => item.id !== videoId);
      
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
          
          // Track video play event
          try {
            video.bind('play', function() {
              const mediaId = mainMedia?.id || videoId || 'unknown';
              handleVideoPlay(mediaId);
            });
          } catch (e) {
            console.warn('Could not bind Wistia play event:', e);
          }
        }
      });
    }
    
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

  return (
    <section className="relative flex items-center justify-center pt-[116px] overflow-hidden pb-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial" />
      
      {/* Animated Glow Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
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
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/40 bg-primary/5 text-xs font-regular mb-6"
            style={{ maxWidth: '100%' }}
          >
            <span className="w-4 h-4 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <span className="uppercase text-foreground">{topBannerText}</span>
          </motion.div>
        )}

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <RichText
            as="h1"
            text={title}
            className="text-2xl md:text-5xl uppercase font-bold text-foreground leading-tight mb-4"
          />
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
            className="font-regular text-[14px] sm:text-[16px] text-foreground max-w-2xl mx-auto mb-4"
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
          className="relative w-full mb-8 flex justify-center"
        >
          {/* Gradient Background Container */}
          <div
            className="w-full max-w-[780px] rounded-2xl p-0.5"
            style={{
              backgroundImage: 'linear-gradient(84deg, #0e87f2, #F2190F 92%)',
            }}
          >
            {/* Black Inner Container */}
            <div className="bg-background rounded-2xl p-2 pb-4 relative group w-full">
              {/* Glow Effect on Hover - Box Shadow Only (no border) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none z-10" style={{ boxShadow: '0 0 60px hsl(var(--primary) / 0.3)' }} />
              
              {/* Media Container */}
              {mainMedia ? (
                <div 
                  className="w-full aspect-video rounded-lg overflow-hidden"
                  onClick={() => handleVideoPlay(mainMedia.id)}
                >
                  <MediaRenderer
                    media={mainMedia}
                    className="w-full h-full"
                    autoPlay={false}
                    muted={false}
                    loop={false}
                    controls={true}
                    priority={true}
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

        {/* CTA Buttons or Default Button */}
        {sortedButtons.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center items-center max-w-2xl mx-auto"
          >
            {sortedButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  opacity: { duration: 0.7, delay: 0.4 + index * 0.1 },
                  y: { duration: 0.7, delay: 0.4 + index * 0.1 },
                  scale: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  asChild
                  className={cn(
                    "h-14 px-8 font-semibold whitespace-nowrap text-base transition-all duration-150",
                    button.style === "primary" || !button.style
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : button.style === "secondary"
                      ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                  >
                    {button.icon && (
                      <FontAwesomeIcon
                        icon={button.icon as any}
                        className="h-4 w-4 mr-2"
                      />
                    )}
                    {button.label}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap w-full sm:w-auto text-base">
                Schedule a Call
              </Button>
            </motion.div>
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

