// src/components/atoms/BackgroundElements.tsx
// Static ledger grid background.

export default function BackgroundElements() {
  return (
    <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-elements'>
      {/* Grid pattern */}
      <div className='absolute inset-0 bg-grid' />

      <div className='bg-circle bg-circle-1' aria-hidden='true' />
      <div className='bg-circle bg-circle-2' aria-hidden='true' />
    </div>
  );
}
