// src/components/ui/__tests__/dialog.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';

describe('Dialog Component', () => {
  describe('Rendering', () => {
    it('should render dialog trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>
      );

      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('should not show content when closed', () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    it('should show content when opened', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });
    });

    it('should render dialog with description', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>This is a description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('This is a description')).toBeInTheDocument();
      });
    });

    it('should render dialog with header and footer', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <button type='button'>Footer Button</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Header Title')).toBeInTheDocument();
        expect(screen.getByText('Footer Button')).toBeInTheDocument();
      });
    });

    it('should render close button', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should open dialog when trigger is clicked', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open Dialog');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when DialogClose is clicked', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
            <DialogClose asChild>
              <button type='button'>Cancel</button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Controlled Dialog', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);

        return (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <button type='button' onClick={() => setOpen(false)}>
                Close Programmatically
              </button>
            </DialogContent>
          </Dialog>
        );
      };

      render(<TestComponent />);

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Close Programmatically'));

      await waitFor(() => {
        expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should apply custom className to DialogContent', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent className='custom-dialog' data-testid='dialog-content'>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const content = screen.getByTestId('dialog-content');
        expect(content).toHaveClass('custom-dialog');
      });
    });

    it('should apply custom className to DialogHeader', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader className='custom-header'>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const header = screen.getByText('Title').parentElement;
        expect(header).toHaveClass('custom-header');
      });
    });

    it('should apply custom className to DialogFooter', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter className='custom-footer'>Footer Content</DialogFooter>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const footer = screen.getByText('Footer Content');
        expect(footer).toHaveClass('custom-footer');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should have accessible close button', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('should associate title with dialog via aria-labelledby', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName('Dialog Title');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle unmounting while open', async () => {
      const { unmount } = render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid open/close', async () => {
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      // Rapidly open and close
      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument();
      });

      // Open again
      fireEvent.click(screen.getByText('Open'));

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });
  });
});

// Import React for controlled component test
import * as React from 'react';
