import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FigureStorageControls } from '../FigureStorageControls';

const savedFiguresKey = 'tax-calculator-storage';
const rememberLabel = 'Remember figures on this device (PAYE and Director)';
const restoreLabel = 'Restore saved figures and remember';
const clearLabel = 'Clear figures and start fresh';

describe('FigureStorageControls with older saved figures', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      savedFiguresKey,
      JSON.stringify({ version: 0, state: { input: { salary: 54321.98 }, _savedAt: Date.now() } }),
    );
  });

  afterEach(() => localStorage.clear());

  it('explains the disabled checkbox and checks it after keyboard Restore', async () => {
    const user = userEvent.setup();
    render(<FigureStorageControls />);
    const remember = screen.getByRole('checkbox', { name: rememberLabel });
    const restore = screen.getByRole('button', { name: restoreLabel });

    expect(remember).toBeDisabled();
    expect(remember).not.toBeChecked();
    expect(remember).toHaveAccessibleDescription(/Choose Restore or Clear to enable this checkbox/);
    await user.tab();
    expect(restore).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(remember).toBeEnabled();
    expect(remember).toBeChecked();
    expect(remember).toHaveFocus();
    expect(restore).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: clearLabel })).not.toBeInTheDocument();
  });

  it('warns about deletion and enables the unchecked checkbox after keyboard Clear', async () => {
    const user = userEvent.setup();
    render(<FigureStorageControls />);
    const remember = screen.getByRole('checkbox', { name: rememberLabel });
    const clear = screen.getByRole('button', { name: clearLabel });

    expect(remember).toBeDisabled();
    expect(clear).toHaveAccessibleDescription(/deletes saved figures for both calculators/);
    await user.tab();
    await user.tab();
    expect(clear).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(remember).toBeEnabled();
    expect(remember).not.toBeChecked();
    expect(remember).toHaveFocus();
    expect(clear).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: restoreLabel })).not.toBeInTheDocument();
    expect(localStorage.getItem(savedFiguresKey)).toBeNull();
  });
});
