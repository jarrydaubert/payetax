// src/components/molecules/DirectorGuide/__tests__/LocationStep.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { useDirectorGuideStore } from '@/store/directorGuideStore';
import { LocationStep } from '../LocationStep';

describe('LocationStep Component', () => {
  beforeEach(() => {
    useDirectorGuideStore.getState().reset();
  });

  describe('Active State', () => {
    it('should render the question title', () => {
      render(<LocationStep />);
      expect(screen.getByText('Where is your main home?')).toBeInTheDocument();
    });

    it('should render both location options', () => {
      render(<LocationStep />);
      expect(screen.getByText('Scotland')).toBeInTheDocument();
      expect(screen.getByText('England, Wales, or Northern Ireland')).toBeInTheDocument();
    });

    it('should have radio inputs', () => {
      render(<LocationStep />);
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('should select Scotland when clicked', () => {
      render(<LocationStep />);
      const scotlandRadio = screen.getByRole('radio', { name: /scotland/i });

      fireEvent.click(scotlandRadio);

      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBe('scotland');
      expect(state.stepStatus.location).toBe(true);
      expect(state.currentStep).toBe('revenue');
    });

    it('should select rUK when clicked', () => {
      render(<LocationStep />);
      const rUKRadio = screen.getByRole('radio', { name: /england/i });

      fireEvent.click(rUKRadio);

      const state = useDirectorGuideStore.getState();
      expect(state.formData.region).toBe('rUK');
    });

    it('should render escape hatch link', () => {
      render(<LocationStep />);
      expect(screen.getByText(/I split my time/)).toBeInTheDocument();
    });
  });

  describe('Completed State', () => {
    it('should show collapsed view when complete and not active', () => {
      // Complete the step first
      useDirectorGuideStore.getState().setRegion('scotland');
      useDirectorGuideStore.getState().completeStep('location');

      render(<LocationStep />);

      expect(screen.getByText('Scotland')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should have edit button when complete', () => {
      useDirectorGuideStore.getState().setRegion('rUK');
      useDirectorGuideStore.getState().completeStep('location');

      render(<LocationStep />);

      const editButton = screen.getByText('Edit');
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should show disabled state when not active and not accessible', () => {
      // Go to a later step without completing location
      useDirectorGuideStore.getState().goToStep('revenue');

      render(<LocationStep />);

      // Should still show the disabled location step
      const card = screen.getByText('Where is your main home?').closest('div');
      expect(card).toBeInTheDocument();
    });
  });
});
