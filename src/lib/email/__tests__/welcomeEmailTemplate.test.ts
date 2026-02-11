import { generateWelcomeEmailHtml, generateWelcomeEmailText } from '../../../../emails/welcome';

jest.mock('@/lib/newsletter/unsubscribeToken', () => ({
  createUnsubscribeToken: jest.fn(() => 'welcome-token'),
  resolveUnsubscribeSecret: jest.fn(() => 'welcome-secret'),
}));

describe('welcome email template', () => {
  it('includes unsubscribe tokenized URL and campaign tracking in HTML', () => {
    const html = generateWelcomeEmailHtml('newuser@payetax.co.uk');

    expect(html).toContain('Welcome to PayeTax!');
    expect(html).toContain('?utm_source=newsletter&utm_medium=email&utm_campaign=welcome');
    expect(html).toContain('/api/newsletter/unsubscribe?token=welcome-token');
    expect(html).not.toContain('newuser@payetax.co.uk');
  });

  it('includes unsubscribe tokenized URL in plain text output', () => {
    const text = generateWelcomeEmailText('newuser@payetax.co.uk');

    expect(text).toContain('Welcome to PayeTax!');
    expect(text).toContain('/api/newsletter/unsubscribe?token=welcome-token');
    expect(text).not.toContain('newuser@payetax.co.uk');
  });
});
