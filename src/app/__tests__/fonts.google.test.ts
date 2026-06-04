jest.mock('next/font/google', () => ({
  IBM_Plex_Mono: jest.fn(() => ({
    className: 'ibm-plex-mono-font',
    variable: '--font-ibm-plex-mono',
  })),
  Newsreader: jest.fn(() => ({ className: 'newsreader-font', variable: '--font-newsreader' })),
  Public_Sans: jest.fn(() => ({
    className: 'public-sans-font',
    variable: '--font-public-sans',
  })),
}));

describe('fonts.google configuration', () => {
  it('configures the Ledger type system with expected options', () => {
    const { IBM_Plex_Mono, Newsreader, Public_Sans } = require('next/font/google') as {
      IBM_Plex_Mono: jest.Mock;
      Newsreader: jest.Mock;
      Public_Sans: jest.Mock;
    };
    const { ibmPlexMono, newsreader, publicSans } = require('../fonts.google') as {
      ibmPlexMono: { variable: string };
      newsreader: { variable: string };
      publicSans: { variable: string };
    };

    expect(Newsreader).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ['latin'],
        variable: '--font-newsreader',
      }),
    );

    expect(Public_Sans).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ['latin'],
        variable: '--font-public-sans',
      }),
    );

    expect(IBM_Plex_Mono).toHaveBeenCalledWith(
      expect.objectContaining({
        subsets: ['latin'],
        variable: '--font-ibm-plex-mono',
      }),
    );

    expect(newsreader.variable).toBe('--font-newsreader');
    expect(publicSans.variable).toBe('--font-public-sans');
    expect(ibmPlexMono.variable).toBe('--font-ibm-plex-mono');
  });
});
