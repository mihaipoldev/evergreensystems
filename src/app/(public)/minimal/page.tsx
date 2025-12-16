import Link from "next/link";

export default function MinimalPage() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      color: '#000000',
      fontSize: '16px'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Minimal Test Page</h1>
      <p style={{ marginBottom: '10px' }}>If you can see this on mobile, the basic setup works.</p>
      <p style={{ marginBottom: '10px' }}>This page has no dependencies, no animations, no complex components.</p>
      <Link href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>Back to main page</Link>
    </div>
  );
}
