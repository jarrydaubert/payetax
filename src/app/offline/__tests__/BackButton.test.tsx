import { fireEvent, render, screen } from '@/test/testing-library';

import { BackButton } from '../BackButton';

describe('BackButton', () => {
  it('calls history.back on click', () => {
    const originalBack = window.history.back;
    const backSpy = jest.fn();
    window.history.back = backSpy;

    render(<BackButton />);

    fireEvent.click(screen.getByRole('button', { name: /Go Back/i }));
    expect(backSpy).toHaveBeenCalled();

    window.history.back = originalBack;
  });
});
