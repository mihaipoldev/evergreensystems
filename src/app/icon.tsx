import { ImageResponse } from 'next/og';
import { SEO_CONFIG } from '@/lib/seo';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

// This is a placeholder favicon generator
// Replace this with actual favicon files in public/ directory when available
// For now, this generates a simple text-based icon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        ES
      </div>
    ),
    {
      ...size,
    }
  );
}
