jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({ className: 'inter-font', variable: '--font-inter' })),
  Space_Grotesk: jest.fn(() => ({ className: 'space-font', variable: '--font-space-grotesk' })),
}));

describe('fonts.google configuration', () => {
  it('configures Space Grotesk and Inter with expected options', () => {
    const { Inter, Space_Grotesk } = require('next/font/google') as {
      Inter: jest.Mock;
      Space_Grotesk: jest.Mock;
    };
    const { inter, spaceGrotesk } = require('../fonts.google') as {
      inter: { variable: string };
      spaceGrotesk: { variable: string };
    };
    const interFactory = Inter;
    const spaceFactory = Space_Grotesk;

    expect(interFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ['latin'],
        variable: '--font-inter',
      }),
    );

    expect(spaceFactory).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ['latin'],
        variable: '--font-space-grotesk',
      }),
    );

    expect(inter.variable).toBe('--font-inter');
    expect(spaceGrotesk.variable).toBe('--font-space-grotesk');
  });
});
