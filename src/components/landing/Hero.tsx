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
 * 
 * Video ID: ow2y75tvjk
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hslToHex } from '@/lib/color-utils';
import { RichText } from '@/components/ui/RichText';

type Section = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any | null;
  media_url: string | null;
} | undefined;

type HeroProps = {
  section?: Section;
};

export const Hero = ({ section }: HeroProps) => {
  const wistiaContainerRef = useRef<HTMLDivElement>(null);
  
  // Use section data if available, otherwise use defaults
  const title = section?.title || 'Your Entire Outbound System\nFully Automated.';
  const subtitle = section?.subtitle || 'Built for B2B teams who want consistent meetings.';
  
  // Extract Wistia video ID from media_url or use default
  const getWistiaVideoId = (url: string | null | undefined): string => {
    if (!url) return 'ow2y75tvjk'; // Default video ID
    
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
    
    return 'ow2y75tvjk'; // Fallback to default
  };
  
  const videoId = getWistiaVideoId(section?.media_url);

  useEffect(() => {
    // Get primary color from CSS variable and convert to hex
    const getPrimaryColor = () => {
      if (typeof window !== 'undefined') {
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
      }
      return '#0a7afa'; // Fallback to primary blue (HSL 212, 96%, 51%)
    };

    // Initialize Wistia Queue - MUST be set up BEFORE scripts load
    if (typeof window !== 'undefined') {
      const primaryColor = getPrimaryColor();
      const hexWithoutHash = primaryColor.replace('#', '');
      
      // Initialize Wistia Queue if not already initialized
      (window as any)._wq = (window as any)._wq || [];
      
      // Remove any existing queue item for this video
      (window as any)._wq = (window as any)._wq.filter((item: any) => item.id !== videoId);
      
      // Push player options to queue BEFORE embed
      (window as any)._wq.push({
        id: videoId,
        options: {
          playerColor: hexWithoutHash,
          // Additional options to ensure color is applied
          playerColorFade: false,
        },
        onReady: function(video: any) {
          // Backup: Also set it once video is ready
          console.log('Wistia video ready, setting color:', hexWithoutHash);
          
          // Remove border-radius from progress bar element
              const removeBorderRadius = () => {
            try {
              // Find the iframe containing the Wistia player
              const iframe = document.querySelector('iframe[src*="' + videoId + '"]') as HTMLIFrameElement;
              if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
                // Find all divs - check every div for the progress bar pattern
                const allDivs = iframe.contentDocument.body.querySelectorAll('div');
                allDivs.forEach((div: Element) => {
                  const htmlDiv = div as HTMLElement;
                  const style = htmlDiv.getAttribute('style') || '';
                  
                  // EXCLUDE: play button and w-vulcan elements
                  if (htmlDiv.closest('.w-big-play-button') || 
                      htmlDiv.closest('[class*="w-vulcan"]') ||
                      htmlDiv.classList.contains('w-big-play-button')) {
                    return; // Skip play button and w-vulcan elements
                  }
                  
                  // Match the EXACT element pattern from user:
                  // <div style="background: rgba(134, 228, 27, 0.85); border-radius: 4.5px; height: 100%; position: absolute;...">
                  const hasAllProperties = style.includes('rgba(') && 
                                          style.includes('border-radius: 4.5px') && 
                                          style.includes('height: 100%') && 
                                          style.includes('position: absolute');
                  
                  if (hasAllProperties) {
                    // Remove border-radius by modifying the style attribute directly
                    let currentStyle = htmlDiv.getAttribute('style') || htmlDiv.style.cssText || '';
                    
                    // Multiple replacement patterns to catch all variations
                    currentStyle = currentStyle.replace(/border-radius:\s*4\.5px/gi, 'border-radius: 0');
                    currentStyle = currentStyle.replace(/border-radius:4\.5px/gi, 'border-radius: 0');
                    currentStyle = currentStyle.replace(/border-radius:\s*4\.\s*5px/gi, 'border-radius: 0');
                    
                    // Update the style attribute
                    htmlDiv.setAttribute('style', currentStyle);
                    
                    // Also set it directly on the style object (multiple methods for maximum compatibility)
                    htmlDiv.style.borderRadius = '0';
                    htmlDiv.style.setProperty('border-radius', '0', 'important');
                    
                    // Double-check and force if needed
                    if (htmlDiv.style.borderRadius !== '0px' && htmlDiv.style.borderRadius !== '0') {
                      htmlDiv.style.removeProperty('border-radius');
                      htmlDiv.style.setProperty('border-radius', '0', 'important');
                    }
                    
                    console.log('✓ Removed border-radius from progress bar element');
                  }
                });
                
                // Also try injecting CSS directly into iframe head as a backup
                try {
                  const iframeDoc = iframe.contentDocument;
                  if (iframeDoc && iframeDoc.head) {
                    // Check if style already exists
                    let styleElement = iframeDoc.getElementById('progress-bar-no-radius');
                    if (!styleElement) {
                      styleElement = iframeDoc.createElement('style');
                      styleElement.id = 'progress-bar-no-radius';
                      styleElement.textContent = `
                        div[style*="border-radius: 4.5px"][style*="rgba("][style*="height: 100%"][style*="position: absolute"] {
                          border-radius: 0 !important;
                        }
                        .w-progress-bar div[style*="border-radius: 4.5px"],
                        .w-progress-inner div[style*="border-radius: 4.5px"] {
                          border-radius: 0 !important;
                        }
                      `;
                      iframeDoc.head.appendChild(styleElement);
                      console.log('✓ Injected CSS into iframe to remove border-radius');
                    }
                  }
                } catch (cssError) {
                  // CSS injection failed, that's ok - JavaScript method should work
                }
              }
            } catch (e) {
              // Cross-origin iframe access is restricted, this is expected for Wistia
              // In that case, we rely on CSS from the parent page (which may not work)
              console.warn('Could not access Wistia iframe to remove border-radius:', e);
            }
          };

          // Try multiple times with different methods
          // This ensures BOTH play button AND progress bar get the color
          const setColor = () => {
            try {
              // Method 1: Use playerColor method (most common) - affects both play button and progress bar
              if (typeof video.playerColor === 'function') {
                video.playerColor(hexWithoutHash);
                console.log('Set color via playerColor() method - affects play button AND progress bar');
              }
              
              // Method 2: Use setOption if available
              if (typeof video.setOption === 'function') {
                video.setOption('playerColor', hexWithoutHash);
                console.log('Set color via setOption() method');
              }
              
              // Method 3: Update options
              if (typeof video.updateOptions === 'function') {
                video.updateOptions({ playerColor: hexWithoutHash });
                console.log('Set color via updateOptions() method');
              }
              
              // Method 4: Direct options
              if (video.options && typeof video.options === 'function') {
                video.options({ playerColor: hexWithoutHash });
                console.log('Set color via options() method');
              }
              
              // Method 5: Access the underlying player
              if (video._player && video._player.playerColor) {
                video._player.playerColor(hexWithoutHash);
                console.log('Set color via _player.playerColor()');
              }
              
              // Method 6: Force update the player to ensure progress bar updates
              if (typeof video.update === 'function') {
                video.update();
              }
              
              // Also remove border-radius whenever we set color
              removeBorderRadius();
              
            } catch (e) {
              console.error('Error setting color:', e);
            }
          };
          
          // Set immediately
          setColor();
          
          // Set after short delays (Wistia might need time to fully initialize)
          // Progress bar may render later, so we need multiple attempts
          setTimeout(setColor, 100);
          setTimeout(setColor, 300);
          setTimeout(setColor, 500);
          setTimeout(setColor, 1000);
          setTimeout(setColor, 2000);
          setTimeout(setColor, 3000);
          setTimeout(setColor, 4000);
          
          // Also try on various events to ensure progress bar gets updated
          video.bind('play', function() {
            setTimeout(setColor, 100);
          });
          
          video.bind('hasplayed', function() {
            setTimeout(setColor, 100);
          });
          
          // Watch for when controls are ready (progress bar is rendered)
          video.bind('timechange', function() {
            // Progress bar should be visible now, set color again
            setTimeout(setColor, 50);
          });
          
          // Also set color on any state change - progress bar might render here
          video.bind('statechange', function() {
            setTimeout(setColor, 50);
          });
          
          // Watch for when video is fully loaded and controls are ready
          video.bind('loadeddata', function() {
            setTimeout(setColor, 200);
          });
          
          // Continuous check every 500ms for the first 10 seconds to catch progress bar rendering
          var checkCount = 0;
          var maxChecks = 20;
          var colorInterval = setInterval(function() {
            checkCount++;
            setColor();
            removeBorderRadius(); // Also remove border-radius independently
            if (checkCount >= maxChecks) {
              clearInterval(colorInterval);
            }
          }, 500);
          
          // Additional aggressive check every 100ms for first 5 seconds
          var quickCheckCount = 0;
          var quickCheckInterval = setInterval(function() {
            quickCheckCount++;
            removeBorderRadius();
            if (quickCheckCount >= 50) { // 5 seconds
              clearInterval(quickCheckInterval);
            }
          }, 100);
          
          // Also call removeBorderRadius at various intervals
          setTimeout(removeBorderRadius, 1000);
          setTimeout(removeBorderRadius, 2000);
          setTimeout(removeBorderRadius, 3000);
          setTimeout(removeBorderRadius, 5000);
          
          // Try on video events as well
          video.bind('timechange', function() {
            setTimeout(removeBorderRadius, 50);
          });
          
          video.bind('statechange', function() {
            setTimeout(removeBorderRadius, 50);
          });
          
          // Use MutationObserver to watch for progress bar element creation
          setTimeout(function() {
            try {
              var iframe = document.querySelector('iframe[src*="' + videoId + '"]') as HTMLIFrameElement;
              if (iframe && iframe.contentDocument) {
                var observer = new MutationObserver(function(mutations) {
                  setColor();
                  // Check each mutation for progress bar elements
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach(function(node: Node) {
                        if (node.nodeType === 1) {
                          const element = node as HTMLElement;
                          const style = element.getAttribute('style');
                          if (style && style.includes('border-radius: 4.5px') && style.includes('rgba(')) {
                            setTimeout(removeBorderRadius, 10);
                          }
                          // Check children too
                          const progressDivs = element.querySelectorAll('div[style*="border-radius: 4.5px"]');
                          if (progressDivs.length > 0) {
                            setTimeout(removeBorderRadius, 10);
                          }
                        }
                      });
                    }
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                      const target = mutation.target as HTMLElement;
                      const style = target.getAttribute('style');
                      if (style && style.includes('border-radius: 4.5px') && style.includes('rgba(')) {
                        setTimeout(removeBorderRadius, 10);
                      }
                    }
                  });
                  removeBorderRadius(); // Also check all existing elements
                });
                observer.observe(iframe.contentDocument.body, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['style', 'class']
                });
              }
            } catch (e) {
              console.warn('Could not set up MutationObserver for Wistia iframe:', e);
            }
          }, 1000); // Start observing earlier
        }
      });
      
      console.log('Wistia queue initialized with color:', hexWithoutHash, 'for video:', videoId);
    }
  }, [videoId]);

  return (
    <section className="relative flex items-center justify-center pt-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial" />
      <div 
        className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-60"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0.15) 92%, rgba(0,0,0,0.05) 97%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0.15) 92%, rgba(0,0,0,0.05) 97%, rgba(0,0,0,0) 100%)',
        }}
      />
      
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/40 bg-primary/5 text-xs font-regular mb-6"
          style={{ maxWidth: '100%' }}
        >
          <span className="w-4 h-4 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <span className="uppercase text-foreground">FOR B2B COMPANIES ABOVE $100K/MO IN REVENUE</span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <RichText
            as="h1"
            text={title}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl uppercase font-bold text-foreground leading-tight mb-4"
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
            className="font-regular text-sm sm:text-lg text-foreground max-w-2xl mx-auto mb-4"
          />
        </motion.div>

        {/* Initialize Wistia Queue BEFORE any scripts */}
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
        
        {/* Wistia Scripts - Load after queue is initialized */}
        <Script
          key={`wistia-media-${videoId}`}
          src={`https://fast.wistia.com/embed/medias/${videoId}.jsonp`}
          strategy="afterInteractive"
        />
        <Script
          key="wistia-external"
          src="https://fast.wistia.com/assets/external/E-v1.js"
          strategy="afterInteractive"
        />

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative w-full mb-8 flex justify-center"
        >
          {/* Gradient Background Container */}
          <div
            className="w-full max-w-[780px] rounded-2xl p-0.5"
            style={{
              backgroundImage: 'linear-gradient(84deg, #3495aa, #fababb 13%, #fbb 53%, #fa9292 84%, #f15050 92%)',
            }}
          >
            {/* Black Inner Container */}
            <div className="bg-background rounded-2xl p-2 pb-4 relative group w-full">
              {/* Glow Effect on Hover - Box Shadow Only (no border) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none z-10" style={{ boxShadow: '0 0 60px hsl(var(--primary) / 0.3)' }} />
              
              {/* Wistia Video Container */}
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
            </div>
          </div>
        </motion.div>

        {/* CTA Form */}
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

        {/* Trust Indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-sm text-muted-foreground mt-6"
        >
          ✔ No pressure  •  ✔ Short call  •  ✔ See if it’s a fit
        </motion.p>
      </div>
    </section>
  );
};

