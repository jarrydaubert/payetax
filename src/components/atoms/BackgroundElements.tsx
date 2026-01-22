// src/components/atoms/BackgroundElements.tsx
// Geometric background with rotating circles and grid pattern
// Matches payetax-web design system

export default function BackgroundElements() {
  return (
    <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-elements'>
      {/* Grid pattern */}
      <div className='absolute inset-0 bg-grid' />

      {/* Rotating circles */}
      <div className='bg-circle bg-circle-1' />
      <div className='bg-circle bg-circle-2' />
    </div>
  );
}
