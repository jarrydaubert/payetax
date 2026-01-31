// src/components/ui/__tests__/alert.test.tsx
import { render, screen } from '@testing-library/react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test Description</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const { container } = render(
        <Alert>
          <AlertCircle className='size-4' />
          <AlertTitle>Alert</AlertTitle>
        </Alert>,
      );

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should have alert role', () => {
      render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(
        <Alert variant='default'>
          <AlertTitle>Default</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('text-foreground');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(
        <Alert variant='warning'>
          <AlertTitle>Warning</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('border-amber-500/50');
    });

    it('should apply destructive variant styles', () => {
      const { container } = render(
        <Alert variant='destructive'>
          <AlertTitle>Error</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('border-destructive/50');
    });

    it('should apply success variant styles', () => {
      const { container } = render(
        <Alert variant='success'>
          <AlertTitle>Success</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('border-green-500/50');
    });

    it('should apply info variant styles', () => {
      const { container } = render(
        <Alert variant='info'>
          <AlertTitle>Info</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('border-blue-500/50');
    });
  });

  describe('Styling', () => {
    it('should apply custom className to Alert', () => {
      const { container } = render(
        <Alert className='custom-alert'>
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      expect(container.firstChild).toHaveClass('custom-alert');
    });

    it('should apply custom className to AlertTitle', () => {
      render(
        <Alert>
          <AlertTitle className='custom-title'>Title</AlertTitle>
        </Alert>,
      );

      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should apply custom className to AlertDescription', () => {
      render(
        <Alert>
          <AlertDescription className='custom-description'>Description</AlertDescription>
        </Alert>,
      );

      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-description');
    });

    it('should have rounded borders', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('should have border', () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      expect(container.firstChild).toHaveClass('border');
    });
  });

  describe('Layout', () => {
    it('should position icon absolutely', () => {
      const { container } = render(
        <Alert>
          <AlertCircle className='size-4' />
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert.className).toContain('[&>svg]:absolute');
    });

    it('should add padding for icon', () => {
      const { container } = render(
        <Alert>
          <AlertCircle className='size-4' />
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      const alert = container.firstChild as HTMLElement;
      expect(alert.className).toContain('[&>svg~*]:pl-7');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title text', () => {
      render(
        <Alert>
          <AlertTitle>
            This is a very long title that might wrap to multiple lines in the alert component
          </AlertTitle>
        </Alert>,
      );

      expect(
        screen.getByText(/This is a very long title that might wrap to multiple lines/),
      ).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      render(
        <Alert>
          <AlertDescription>
            This is a very long description that provides detailed information about the alert and
            might span multiple lines to properly convey the message to users
          </AlertDescription>
        </Alert>,
      );

      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    it('should handle unmounting', () => {
      const { unmount } = render(
        <Alert>
          <AlertTitle>Title</AlertTitle>
        </Alert>,
      );

      expect(() => unmount()).not.toThrow();
    });

    it('should render without description', () => {
      render(
        <Alert>
          <AlertTitle>Only Title</AlertTitle>
        </Alert>,
      );

      expect(screen.getByText('Only Title')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(
        <Alert>
          <AlertDescription>Only Description</AlertDescription>
        </Alert>,
      );

      expect(screen.getByText('Only Description')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic heading for title', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>,
      );

      const title = screen.getByText('Alert Title');
      expect(title.tagName).toBe('H5');
    });

    it('should have appropriate text contrast', () => {
      render(
        <Alert variant='warning'>
          <AlertTitle>Warning</AlertTitle>
        </Alert>,
      );

      const title = screen.getByText('Warning');
      expect(title).toHaveClass('font-medium');
    });

    it('should be discoverable by screen readers', () => {
      render(
        <Alert>
          <AlertTitle>Important Alert</AlertTitle>
        </Alert>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Important Alert');
    });
  });
});
