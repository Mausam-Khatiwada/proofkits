export type BillingPlanState = 'free' | 'pro';

export type BillingStateSnapshot = {
  plan: BillingPlanState;
  subscriptionId: string | null;
  lastEventAt: Date | null;
};

export type BillingWebhookEvent = {
  providerEventId: string;
  providerEventType: string;
  eventAt: Date;
  status: string | null;
  customerId: string;
  subscriptionId: string | null;
};

function isProStatus(status: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized === 'active' || normalized === 'trialing' || normalized === 'renewed' || normalized === 'past_due';
}

function isCancellationType(providerEventType: string): boolean {
  const t = providerEventType.toLowerCase();
  return t.includes('cancel') || t.includes('expire') || t.includes('fail') || t.includes('refund');
}

export function applyBillingStateTransition(input: {
  current: BillingStateSnapshot;
  event: BillingWebhookEvent;
}) {
  const { current, event } = input;

  if (current.lastEventAt && event.eventAt.getTime() < current.lastEventAt.getTime()) {
    return {
      shouldPersist: false,
      reason: 'stale_event',
      next: current,
    };
  }

  const cancellation = isCancellationType(event.providerEventType);
  const active = isProStatus(event.status);

  const nextPlan: BillingPlanState = cancellation ? 'free' : active ? 'pro' : 'free';
  const nextSubscriptionId = nextPlan === 'pro' ? event.subscriptionId : null;

  return {
    shouldPersist: true,
    reason: nextPlan === 'pro' ? 'activated_or_renewed' : 'cancelled_or_inactive',
    next: {
      plan: nextPlan,
      subscriptionId: nextSubscriptionId,
      lastEventAt: event.eventAt,
    },
  };
}

