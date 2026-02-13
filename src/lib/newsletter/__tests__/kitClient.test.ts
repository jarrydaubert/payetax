import { subscribeEmailToKit, unsubscribeEmailInKit } from '@/lib/newsletter/kitClient';

describe('kitClient', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  describe('subscribeEmailToKit', () => {
    it('creates subscriber and subscribes to form', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          text: async () => '{"subscriber":{"id":1}}',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          text: async () => '{"subscription":{"id":1}}',
        });

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '12345',
          email: 'User@PayeTax.co.uk ',
        }),
      ).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'https://api.kit.com/v4/subscribers',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Kit-Api-Key': 'kit_secret',
          }),
          body: JSON.stringify({ email_address: 'user@payetax.co.uk' }),
        }),
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'https://api.kit.com/v4/forms/12345/subscribers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email_address: 'user@payetax.co.uk' }),
        }),
      );
    });

    it('is idempotent when subscriber already exists or already subscribed', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          text: async () => '{"message":"Subscriber already exists"}',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 422,
          text: async () => '{"message":"Already subscribed to form"}',
        });

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '12345',
          email: 'user@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when create subscriber fails with non-idempotent error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '{"message":"Internal error"}',
      });

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '12345',
          email: 'user@payetax.co.uk',
        }),
      ).rejects.toThrow('Kit subscriber create failed');
    });
  });

  describe('unsubscribeEmailInKit', () => {
    it('returns success when subscriber is not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '{"subscribers":[]}',
      });

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'missing@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('looks up subscriber and unsubscribes by id', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '{"subscribers":[{"id":42,"email_address":"user@payetax.co.uk"}]}',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '{"ok":true}',
        });

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'USER@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'https://api.kit.com/v4/subscribers/42/unsubscribe',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('is idempotent when subscriber is already unsubscribed', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => '{"subscribers":[{"id":"42","email_address":"user@payetax.co.uk"}]}',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 422,
          text: async () => '{"message":"Subscriber already unsubscribed"}',
        });

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'user@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when lookup fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '{"message":"failure"}',
      });

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'user@payetax.co.uk',
        }),
      ).rejects.toThrow('Kit subscriber lookup failed');
    });
  });
});
