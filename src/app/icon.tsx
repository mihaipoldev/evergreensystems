import { readFile } from 'fs/promises';
import { join } from 'path';
import { headers } from 'next/headers';
import { siteLookForRoute } from '@/lib/site-look';
import { getRouteForPathname } from '@/features/funnels/routes';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/svg+xml';

// Helper function to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Use the SVG icon from public/icon.svg and inject primary color
// Next.js will automatically serve this as the favicon
export default async function Icon() {
  try {
    const iconPath = join(process.cwd(), 'public', 'icon.svg');
    let svg = await readFile(iconPath, 'utf-8');
    
    let primaryColorHex = '#000000'; // Default to black
    
    // The primary colour of the route's look (src/lib/site-look.ts)
    let route = '/';
    try {
      const headersList = await headers();
      const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
      route = getRouteForPathname(pathname);
    } catch {
      // Default to landing page if headers unavailable
    }
    const look = siteLookForRoute(route);
    if (look) {
      primaryColorHex = hslToHex(look.primary.h, look.primary.s, look.primary.l);
    }
    
    // Set the parent group's fill to white (for outer structure)
    svg = svg.replace(/fill="#000000"/g, `fill="#FFFFFF"`);
    
    // Set the inner faces to primary color
    const innerFaceIds = ['inner-face-1', 'inner-face-2', 'inner-face-3'];
    innerFaceIds.forEach(faceId => {
      // Match the path with the ID and add/replace fill with primary color
      // Handle multiline paths by matching until the closing />
      svg = svg.replace(
        new RegExp(`(<path id="${faceId}"[^>]*?)(?:\\s+fill="[^"]*")?([^>]*d="[^"]*z")\\s*/>`, 's'),
        `$1 fill="${primaryColorHex}"$2 />`
      );
    });
    
    // Return the SVG content with injected color
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error loading icon:', error);
    // Fallback to a simple SVG if file is not found
    const fallbackSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="black"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-weight="bold">ES</text>
    </svg>`;
    
    return new Response(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}
