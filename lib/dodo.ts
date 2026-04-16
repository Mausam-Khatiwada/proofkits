import crypto from 'node:crypto';

const TEST_BASE_URL = 'https://test.dodopayments.com';
const LIVE_BASE_URL = 'https://live.dodopayments.com';

export type DodoWebhookPayload = {
  type: string;
  data?: Record<string, unknown>;
};

type DodoSubscription = {
  subscription_id?: string;
  status?: string;
  customer?: {
    customer_id?: string;
    email?: string;
  };
};

function getDodoApiKey(): string {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error('DODO_PAYMENTS_API_KEY is not configured');
  }
  return apiKey;
}

function getDodoWebhookKey(): string {
  const key = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!key) {
    throw new Error('DODO_PAYMENTS_WEBHOOK_KEY is not configured');
  }
  return key;
}

export function getDodoBaseUrl(): string {
  if (process.env.DODO_PAYMENTS_BASE_URL) return process.env.DODO_PAYMENTS_BASE_URL;
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT?.toLowerCase();
  return env === 'live' ? LIVE_BASE_URL : TEST_BASE_URL;
}

export function getBillingBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

async function dodoRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getDodoBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getDodoApiKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dodo API ${res.status}: ${body.slice(0, 400)}`);
  }

  return (await res.json()) as T;
}

export async function createDodoCustomer(input: {
  email: string;
  name: string;
  supabaseUserId: string;
}): Promise<{ customer_id: string }> {
  return dodoRequest<{ customer_id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      metadata: { supabase_user_id: input.supabaseUserId },
    }),
  });
}

export async function createDodoCheckoutSession(input: {
  customerId: string;
  productId: string;
  returnUrl: string;
  supabaseUserId: string;
}): Promise<{ session_id: string; checkout_url: string | null }> {
  return dodoRequest<{ session_id: string; checkout_url: string | null }>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [{ product_id: input.productId, quantity: 1 }],
      customer: { customer_id: input.customerId },
      return_url: input.returnUrl,
      metadata: { supabase_user_id: input.supabaseUserId },
    }),
  });
}

export async function createDodoCustomerPortalSession(customerId: string): Promise<{ link: string }> {
  return dodoRequest<{ link: string }>(`/customers/${customerId}/customer-portal/session`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

function isDodoProStatus(status: string | undefined): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized === 'active' || normalized === 'trialing' || normalized === 'renewed';
}

export async function getActiveDodoSubscriptionForCustomer(
  customerId: string
) : Promise<{ subscriptionId: string; customerId: string; customerEmail: string | null } | null> {
  const responses = await Promise.allSettled([
    dodoRequest<{ items?: DodoSubscription[] }>('/subscriptions'),
  ]);

  const allItems: DodoSubscription[] = [];
  for (const response of responses) {
    if (response.status === 'fulfilled' && Array.isArray(response.value.items)) {
      allItems.push(...response.value.items);
    }
  }

  const active = allItems.find((subscription) => {
    const subCustomerId = subscription.customer?.customer_id;
    return subCustomerId === customerId && isDodoProStatus(subscription.status);
  });

  if (!active?.subscription_id) return null;
  return {
    subscriptionId: active.subscription_id,
    customerId,
    customerEmail: active.customer?.email ?? null,
  };
}

export async function getActiveDodoSubscriptionForEmail(
  email: string
): Promise<{ subscriptionId: string; customerId: string; customerEmail: string | null } | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  const response = await dodoRequest<{ items?: DodoSubscription[] }>('/subscriptions');
  const items = response.items ?? [];
  const active = items.find((subscription) => {
    const subEmail = subscription.customer?.email?.trim().toLowerCase();
    return subEmail === normalizedEmail && isDodoProStatus(subscription.status);
  });

  if (!active?.subscription_id || !active.customer?.customer_id) return null;

  return {
    subscriptionId: active.subscription_id,
    customerId: active.customer.customer_id,
    customerEmail: active.customer.email ?? null,
  };
}

function parseSignatureCandidates(signatureHeader: string): string[] {
  return signatureHeader
    .split(/\s+/)
    .flatMap((part) => part.split(','))
    .map((token) => token.trim())
    .filter(Boolean)
    .flatMap((token) => {
      if (token.startsWith('v1=')) return [token.slice(3)];
      if (token.startsWith('v1,')) return [token.slice(3)];
      if (token.startsWith('v1:')) return [token.slice(3)];
      return [token];
    });
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyDodoWebhook(input: {
  rawBody: string;
  webhookId: string;
  webhookTimestamp: string;
  webhookSignature: string;
}): DodoWebhookPayload {
  const timestamp = Number(input.webhookTimestamp);
  if (!Number.isFinite(timestamp)) {
    throw new Error('Invalid webhook timestamp');
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowInSeconds - timestamp) > 5 * 60) {
    throw new Error('Webhook timestamp outside replay tolerance');
  }

  const signedPayload = `${input.webhookId}.${input.webhookTimestamp}.${input.rawBody}`;
  const signature = crypto
    .createHmac('sha256', getDodoWebhookKey())
    .update(signedPayload)
    .digest();

  const expectedHex = signature.toString('hex');
  const expectedBase64 = signature.toString('base64');
  const expectedBase64Url = signature.toString('base64url');
  const candidates = parseSignatureCandidates(input.webhookSignature);

  const isValid = candidates.some((candidate) => {
    return (
      timingSafeEqualString(candidate, expectedHex) ||
      timingSafeEqualString(candidate, expectedBase64) ||
      timingSafeEqualString(candidate, expectedBase64Url)
    );
  });

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  return JSON.parse(input.rawBody) as DodoWebhookPayload;
}
