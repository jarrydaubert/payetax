import { GET } from '../route';

describe('/calculator redirect route', () => {
  it('redirects to the homepage with 308', () => {
    const response = GET();

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://payetax.co.uk/');
  });
});
