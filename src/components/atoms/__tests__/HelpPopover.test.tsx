import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useId } from 'react';
import { HelpPopover } from '../HelpPopover';

function Example() {
  return (
    <form
      onSubmit={() => {
        throw new Error('Help must not submit the form');
      }}
    >
      <HelpPopover label='Salary help' trigger={<button type='button'>Salary help</button>}>
        Your salary before deductions.
      </HelpPopover>
      <input aria-label='Next field' />
    </form>
  );
}

it('toggles with Enter and Space, exposes help without moving focus, and dismisses on Escape or Tab', async () => {
  const user = userEvent.setup();
  render(<Example />);
  await user.tab();
  const trigger = screen.getByRole('button', { name: 'Salary help' });
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-haspopup', 'false');
  await user.keyboard('{Enter}');
  const help = screen.getByRole('region', { name: 'Salary help' });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAccessibleDescription('Your salary before deductions.');
  expect(help).toHaveAccessibleDescription('Your salary before deductions.');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(trigger).toHaveAttribute('aria-controls', help.id);
  await user.keyboard('{Enter}');
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  await user.keyboard(' ');
  expect(screen.getByRole('region')).toBeVisible();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.keyboard(' ');
  expect(screen.getByRole('region')).toBeVisible();
  expect(trigger).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

it('supports repeated touch, a close button and outside input interaction', async () => {
  const user = userEvent.setup();
  render(<Example />);
  const target = screen.getByRole('button', { name: 'Salary help' });
  const tap = () =>
    user.pointer([
      { keys: '[TouchA>]', target },
      { keys: '[/TouchA]', target },
    ]);
  await tap();
  expect(screen.getByRole('region')).toBeVisible();
  await tap();
  await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  await user.click(target);
  await user.click(screen.getByRole('textbox'));
  await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  expect(screen.getByRole('textbox')).toHaveFocus();
});

it('keeps help within a containing dialog for assistive technology', async () => {
  const user = userEvent.setup();
  function Drawer() {
    const titleId = useId();
    return (
      <div role='dialog' aria-labelledby={titleId} aria-modal='true'>
        <h2 id={titleId}>Your Numbers</h2>
        <Example />
      </div>
    );
  }
  render(<Drawer />);
  await user.click(screen.getByRole('button', { name: 'Salary help' }));
  const drawer = screen.getByRole('dialog', { name: 'Your Numbers' });
  expect(drawer).toContainElement(screen.getByRole('region', { name: 'Salary help' }));
});

it('dismisses on an outside pointer action even when the field suppresses its later click', async () => {
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Salary help' });
  const field = screen.getByRole('textbox');
  await user.click(trigger);
  await user.pointer({ keys: '[TouchA>]', target: field });
  field.focus();
  await waitFor(() => expect(screen.queryByRole('region')).not.toBeInTheDocument());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(field).toHaveFocus();
  await user.pointer({ keys: '[/TouchA]', target: field });
});
