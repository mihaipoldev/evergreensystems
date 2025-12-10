import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Apple touch icon generator
// Replace this with actual apple-touch-icon.png in public/ directory when available
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
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
