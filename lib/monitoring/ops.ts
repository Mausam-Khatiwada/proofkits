import crypto from 'node:crypto';

export function getRequestId(request: Request): string {
  return (
    request.headers.get('x-request-id') ??
    request.headers.get('x-correlation-id') ??
    crypto.randomUUID()
  );
}

export function logOpsEvent(event: {
  request: Request;
  category: string;
  action: string;
  outcome: 'success' | 'denied' | 'error' | 'skipped';
  requestId?: string;
  userId?: string;
  targetId?: string;
  detail?: string;
  extra?: Record<string, unknown>;
}) {
  const payload = {
    ts: new Date().toISOString(),
    type: 'ops_event',
    category: event.category,
    action: event.action,
    outcome: event.outcome,
    requestId: event.requestId ?? getRequestId(event.request),
    userId: event.userId ?? null,
    targetId: event.targetId ?? null,
    method: event.request.method,
    path: new URL(event.request.url).pathname,
    detail: event.detail ?? null,
    ...(event.extra ? { extra: event.extra } : {}),
  };
  console.log(JSON.stringify(payload));
}

