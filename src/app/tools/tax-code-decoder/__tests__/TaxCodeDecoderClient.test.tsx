import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaxCodeDecoderClient } from '../TaxCodeDecoderClient';

describe('TaxCodeDecoderClient', () => {
  it.each(['BR', '1257', ''])(
    'keeps the 1257L result while editing the draft to "%s"',
    async (draft) => {
      const user = userEvent.setup();
      render(<TaxCodeDecoderClient />);
      const input = screen.getByRole('textbox', { name: 'Tax code' });
      await user.click(screen.getByRole('button', { name: '1257L' }));
      expect(screen.getByRole('heading', { name: '1257L' })).toBeVisible();

      if (draft) {
        await user.type(input, draft, { initialSelectionStart: 0, initialSelectionEnd: 5 });
      } else {
        await user.clear(input);
      }

      expect(input).toHaveValue(draft);
      expect(screen.getByRole('heading', { name: '1257L' })).toBeVisible();
      expect(screen.getByText('Standard Personal Allowance applies')).toBeVisible();
      expect(screen.getByText('£12,570')).toBeVisible();
      expect(
        screen.queryByText('Basic rate on all income from this source'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Unrecognized or unsupported tax code')).not.toBeInTheDocument();
    },
  );

  it('states the tax year used for rate explanations', () => {
    render(<TaxCodeDecoderClient />);

    expect(screen.getByText(/Rate explanations use the current 2026\/2027 tax year/)).toBeVisible();
  });

  it('presents the numeric amount as source-specific tax-free income', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.click(screen.getByRole('button', { name: '1257L' }));

    expect(await screen.findByText('Standard Personal Allowance applies')).toBeInTheDocument();
    expect(screen.getByText('Tax-free amount from this source')).toBeInTheDocument();
    expect(screen.getByText('£12,570')).toBeInTheDocument();
  });

  it('explains a NONCUM form as non-cumulative', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.click(screen.getByRole('button', { name: '1257L NONCUM' }));

    expect(await screen.findByText('Emergency Code')).toBeInTheDocument();
    expect(screen.getByText(/alternative non-cumulative label/)).toBeInTheDocument();
    expect(screen.getByText(/uses only the current pay period/)).toBeInTheDocument();
  });

  it('presents 0T as a zero tax-free amount rather than a Personal Allowance claim', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.click(screen.getByRole('button', { name: '0T' }));

    expect(screen.getByText('No tax-free amount through this code')).toBeInTheDocument();
    expect(screen.getByText('£0')).toBeInTheDocument();
    expect(screen.getByText('Tax-free amount from this source')).toBeInTheDocument();
  });

  it('shows K475 as an addition to taxable pay, not a negative allowance', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.click(screen.getByRole('button', { name: 'K475' }));

    expect(await screen.findByText('Amount added to taxable pay')).toBeInTheDocument();
    expect(screen.getByText('Added to taxable pay')).toBeInTheDocument();
    expect(screen.getByText('£4,750')).toBeInTheDocument();
    expect(screen.getByText(/cannot exceed 50% of pre-tax pay or pension/)).toBeInTheDocument();
    expect(screen.queryByText('-£4,750')).not.toBeInTheDocument();
  });

  it('rejects a bare numeric code with a practical validation message', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.type(screen.getByRole('textbox', { name: 'Tax code' }), '1257');
    await user.click(screen.getByRole('button', { name: 'Decode' }));

    expect(await screen.findByText('Unrecognized or unsupported tax code')).toBeInTheDocument();
    expect(screen.getByText(/needs an HMRC letter/)).toBeInTheDocument();
  });

  it('accepts HMRC v24.0’s documented seven-character example', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.type(screen.getByRole('textbox', { name: 'Tax code' }), '999999T');
    await user.click(screen.getByRole('button', { name: 'Decode' }));

    expect(await screen.findByText('HMRC needs to review some items')).toBeInTheDocument();
    expect(screen.getByText('£9,999,990')).toBeInTheDocument();
    expect(screen.queryByText('Check with HMRC')).not.toBeInTheDocument();
  });

  it('does not label a bare NONCUM marker as an emergency code', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);

    await user.type(screen.getByRole('textbox', { name: 'Tax code' }), 'NONCUM');
    await user.click(screen.getByRole('button', { name: 'Decode' }));

    expect(await screen.findByText('Unrecognized or unsupported tax code')).toBeInTheDocument();
    expect(screen.getByText(/must follow a complete tax code/)).toBeInTheDocument();
    expect(screen.queryByText('Emergency Code')).not.toBeInTheDocument();
  });

  it('provides official checking and correction paths without unsupported prefill', () => {
    render(<TaxCodeDecoderClient />);

    expect(screen.getByRole('link', { name: /Use HMRC's tax-code checker/ })).toHaveAttribute(
      'href',
      'https://www.gov.uk/guidance/check-what-your-tax-code-means',
    );
    expect(
      screen.getByRole('link', { name: /What to do if the code looks wrong/ }),
    ).toHaveAttribute('href', 'https://www.gov.uk/tax-codes/how-to-update-your-tax-code');
    expect(screen.getByRole('link', { name: /Open Tax Calculator/ })).toHaveAttribute('href', '/');
    expect(document.querySelector('a[href*="taxCode="]')).not.toBeInTheDocument();
  });

  it('shows region-aware Scottish and Welsh reference rows', () => {
    render(<TaxCodeDecoderClient />);

    expect(screen.getByText('SD0–SD3')).toBeInTheDocument();
    expect(
      screen.getByText(/Scottish intermediate, higher, advanced or top rate/),
    ).toBeInTheDocument();
    expect(screen.getByText('CD0 / CD1')).toBeInTheDocument();
    expect(screen.getByText(/Welsh higher or additional rate/)).toBeInTheDocument();
  });

  it('renders the calculator CTA as one focusable link with no nested controls', async () => {
    const user = userEvent.setup();
    render(<TaxCodeDecoderClient />);
    const link = screen.getByRole('link', { name: 'Open Tax Calculator' });
    expect(link).toHaveAttribute('href', '/');
    expect(link.querySelector('button, a, input, [tabindex]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Open Tax Calculator' })).not.toBeInTheDocument();
    link.focus();
    await user.tab({ shift: true });
    await user.tab();
    expect(link).toHaveFocus();
  });
});
