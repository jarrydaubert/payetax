import { subscribeEmailToKit, unsubscribeEmailInKit } from '@/lib/newsletter/kitClient';

describe('kitClient', () => {
  const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();

  function createResponse(body: string, status: number): Response {
    return new Response(body, { status });
  }

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  describe('subscribeEmailToKit', () => {
    it('creates subscriber and subscribes to form', async () => {
      fetchMock
        .mockResolvedValueOnce(createResponse('{"subscriber":{"id":1}}', 201))
        .mockResolvedValueOnce(createResponse('{"subscription":{"id":1}}', 201));

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

    it('resolves a form uid to the numeric form id before subscribing', async () => {
      fetchMock
        .mockResolvedValueOnce(createResponse('{"forms":[{"id":9084803,"uid":"648a4b276a"}]}', 200))
        .mockResolvedValueOnce(createResponse('{"subscriber":{"id":1}}', 201))
        .mockResolvedValueOnce(createResponse('{"subscription":{"id":1}}', 201));

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '648a4b276a',
          email: 'user@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        'https://api.kit.com/v4/forms/9084803/subscribers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email_address: 'user@payetax.co.uk' }),
        }),
      );
    });

    it('is idempotent when subscriber already exists or already subscribed', async () => {
      fetchMock
        .mockResolvedValueOnce(createResponse('{"message":"Subscriber already exists"}', 409))
        .mockResolvedValueOnce(createResponse('{"message":"Already subscribed to form"}', 422));

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '12345',
          email: 'user@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when create subscriber fails with non-idempotent error', async () => {
      fetchMock.mockResolvedValueOnce(createResponse('{"message":"Internal error"}', 500));

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: '12345',
          email: 'user@payetax.co.uk',
        }),
      ).rejects.toThrow('Kit subscriber create failed');
    });

    it('throws when a non-numeric form identifier cannot be resolved', async () => {
      fetchMock.mockResolvedValueOnce(
        createResponse('{"forms":[{"id":9084803,"uid":"648a4b276a"}]}', 200),
      );

      await expect(
        subscribeEmailToKit({
          apiSecret: 'kit_secret',
          formId: 'missing-form-uid',
          email: 'user@payetax.co.uk',
        }),
      ).rejects.toThrow('Kit form lookup failed');
    });
  });

  describe('unsubscribeEmailInKit', () => {
    it('returns success when subscriber is not found', async () => {
      fetchMock.mockResolvedValueOnce(createResponse('{"subscribers":[]}', 200));

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
        .mockResolvedValueOnce(
          createResponse('{"subscribers":[{"id":42,"email_address":"user@payetax.co.uk"}]}', 200),
        )
        .mockResolvedValueOnce(createResponse('{"ok":true}', 200));

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
        .mockResolvedValueOnce(
          createResponse('{"subscribers":[{"id":"42","email_address":"user@payetax.co.uk"}]}', 200),
        )
        .mockResolvedValueOnce(
          createResponse('{"message":"Subscriber already unsubscribed"}', 422),
        );

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'user@payetax.co.uk',
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when lookup fails', async () => {
      fetchMock.mockResolvedValueOnce(createResponse('{"message":"failure"}', 500));

      await expect(
        unsubscribeEmailInKit({
          apiSecret: 'kit_secret',
          email: 'user@payetax.co.uk',
        }),
      ).rejects.toThrow('Kit subscriber lookup failed');
    });
  });
});
