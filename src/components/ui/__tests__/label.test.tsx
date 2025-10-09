// src/components/ui/__tests__/label.test.tsx
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label Component', () => {
  it('should render label with text', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should accept custom className', () => {
    render(<Label className='custom-class'>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('custom-class');
  });

  it('should have default styling classes', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });

  it('should support htmlFor attribute', () => {
    render(<Label htmlFor='input-id'>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'input-id');
  });

  it('should support id attribute', () => {
    render(<Label id='label-id'>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('id', 'label-id');
  });

  it('should have peer-disabled styling', () => {
    render(<Label>Label</Label>);
    const label = screen.getByText('Label');
    expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
    expect(label).toHaveClass('peer-disabled:opacity-70');
  });
});
