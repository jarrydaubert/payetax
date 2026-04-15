/**
 * Kit API client helpers for newsletter subscription lifecycle.
 *
 * API docs:
 * - https://developers.kit.com/api-reference/authentication
 * - https://developers.kit.com/api-reference/subscribers/create-a-subscriber
 * - https://developers.kit.com/api-reference/forms/add-subscriber-to-form-by-email-address
 * - https://developers.kit.com/api-reference/subscribers/unsubscribe-a-subscriber
 */

const KIT_API_BASE = 'https://api.kit.com/v4';

type KitRecordId = string | number;

interface KitRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}

interface KitRequestResult {
  ok: boolean;
  status: number;
  json: unknown;
  text: string;
}

interface KitSubscriberRecord {
  id?: KitRecordId;
  email_address?: string;
}

interface KitFormRecord {
  id?: KitRecordId;
  uid?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isKitSubscriberRecord(value: unknown): value is KitSubscriberRecord {
  if (!isRecord(value)) {
    return false;
  }

  const { email_address, id } = value;
  return (
    (email_address === undefined || typeof email_address === 'string') &&
    (typeof id === 'string' || typeof id === 'number' || id === undefined)
  );
}

function isKitFormRecord(value: unknown): value is KitFormRecord {
  if (!isRecord(value)) {
    return false;
  }

  const { id, uid } = value;
  return (
    (uid === undefined || typeof uid === 'string') &&
    (typeof id === 'string' || typeof id === 'number' || id === undefined)
  );
}

function normalizeErrorText(text: string, json: unknown): string {
  if (text.trim()) {
    return text.toLowerCase();
  }

  if (!isRecord(json)) {
    return '';
  }

  const candidates = ['message', 'error', 'detail'] as const;
  for (const key of candidates) {
    const value = json[key];
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
  }

  return '';
}

function isIdempotentSubscriberState(status: number, text: string, json: unknown): boolean {
  if (!(status === 409 || status === 422)) {
    return false;
  }

  const normalized = normalizeErrorText(text, json);
  return (
    normalized.includes('already') ||
    normalized.includes('exists') ||
    normalized.includes('subscribed') ||
    normalized.includes('active') ||
    normalized.includes('unsubscribed')
  );
}

function getSubscribersFromResponse(json: unknown): KitSubscriberRecord[] {
  if (!isRecord(json)) {
    return [];
  }

  if (Array.isArray(json.subscribers)) {
    return json.subscribers.filter(isKitSubscriberRecord);
  }

  if (Array.isArray(json.data)) {
    return json.data.filter(isKitSubscriberRecord);
  }

  return [];
}

function getFormsFromResponse(json: unknown): KitFormRecord[] {
  if (!isRecord(json)) {
    return [];
  }

  if (Array.isArray(json.forms)) {
    return json.forms.filter(isKitFormRecord);
  }

  if (Array.isArray(json.data)) {
    return json.data.filter(isKitFormRecord);
  }

  return [];
}

async function kitRequest(
  path: string,
  apiSecret: string,
  options: KitRequestOptions = {},
): Promise<KitRequestResult> {
  const response = await fetch(`${KIT_API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': apiSecret,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let json: unknown = null;

  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    json,
    text,
  };
}

async function resolveFormIdentifier(apiSecret: string, formIdentifier: string): Promise<string> {
  if (/^\d+$/u.test(formIdentifier)) {
    return formIdentifier;
  }

  const formsResult = await kitRequest('/forms', apiSecret);
  if (!formsResult.ok) {
    throw new Error(`Kit forms lookup failed (${formsResult.status})`);
  }

  const forms = getFormsFromResponse(formsResult.json);
  const matched = forms.find((form) => {
    const id = form.id;
    const uid = form.uid;
    return (
      (typeof id === 'number' && String(id) === formIdentifier) ||
      (typeof id === 'string' && id === formIdentifier) ||
      (typeof uid === 'string' && uid === formIdentifier)
    );
  });

  const resolvedId =
    matched && typeof matched.id === 'number'
      ? String(matched.id)
      : matched && typeof matched.id === 'string'
        ? matched.id
        : null;

  if (!resolvedId) {
    throw new Error(`Kit form lookup failed (unrecognized identifier: ${formIdentifier})`);
  }

  return resolvedId;
}

export async function subscribeEmailToKit(params: {
  apiSecret: string;
  formId: string;
  email: string;
}): Promise<void> {
  const { apiSecret, formId, email } = params;
  const normalizedEmail = email.trim().toLowerCase();
  const resolvedFormId = await resolveFormIdentifier(apiSecret, formId);

  const subscriberResult = await kitRequest('/subscribers', apiSecret, {
    method: 'POST',
    body: { email_address: normalizedEmail },
  });

  if (
    !(
      subscriberResult.ok ||
      isIdempotentSubscriberState(
        subscriberResult.status,
        subscriberResult.text,
        subscriberResult.json,
      )
    )
  ) {
    throw new Error(`Kit subscriber create failed (${subscriberResult.status})`);
  }

  const formResult = await kitRequest(
    `/forms/${encodeURIComponent(resolvedFormId)}/subscribers`,
    apiSecret,
    {
      method: 'POST',
      body: { email_address: normalizedEmail },
    },
  );

  if (
    !(
      formResult.ok ||
      isIdempotentSubscriberState(formResult.status, formResult.text, formResult.json)
    )
  ) {
    throw new Error(`Kit form subscribe failed (${formResult.status})`);
  }
}

export async function unsubscribeEmailInKit(params: {
  apiSecret: string;
  email: string;
}): Promise<void> {
  const { apiSecret, email } = params;
  const normalizedEmail = email.trim().toLowerCase();

  const lookupResult = await kitRequest(
    `/subscribers?email_address=${encodeURIComponent(normalizedEmail)}`,
    apiSecret,
  );

  if (!lookupResult.ok) {
    throw new Error(`Kit subscriber lookup failed (${lookupResult.status})`);
  }

  const subscribers = getSubscribersFromResponse(lookupResult.json);
  const matched = subscribers.find((subscriber) => {
    const emailAddress = subscriber.email_address;
    return typeof emailAddress === 'string' && emailAddress.toLowerCase() === normalizedEmail;
  });

  const subscriberId =
    matched && typeof matched.id === 'number'
      ? String(matched.id)
      : matched && typeof matched.id === 'string'
        ? matched.id
        : null;

  // Idempotent: if no subscriber record exists, treat unsubscribe as successful.
  if (!subscriberId) {
    return;
  }

  const unsubscribeResult = await kitRequest(
    `/subscribers/${encodeURIComponent(subscriberId)}/unsubscribe`,
    apiSecret,
    { method: 'POST' },
  );

  if (
    !(
      unsubscribeResult.ok ||
      isIdempotentSubscriberState(
        unsubscribeResult.status,
        unsubscribeResult.text,
        unsubscribeResult.json,
      )
    )
  ) {
    throw new Error(`Kit unsubscribe failed (${unsubscribeResult.status})`);
  }
}
