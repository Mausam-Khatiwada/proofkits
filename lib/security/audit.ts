import crypto from 'node:crypto';

type SecurityAuditEvent = {
  action: string;
  outcome: 'success' | 'denied' | 'error';
  userId?: string;
  targetId?: string;
  detail?: string;
  request: Request;
};

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function anonymizeIp(ip: string): string {
  const salt = process.env.AUDIT_LOG_SALT || 'proofkit-default-audit-salt';
  return crypto
    .createHash('sha256')
    .update(`${salt}:${ip}`)
    .digest('hex')
    .slice(0, 16);
}

export function logSecurityEvent(event: SecurityAuditEvent) {
  const payload = {
    ts: new Date().toISOString(),
    type: 'security_audit',
    action: event.action,
    outcome: event.outcome,
    userId: event.userId ?? null,
    targetId: event.targetId ?? null,
    path: new URL(event.request.url).pathname,
    method: event.request.method,
    ipHash: anonymizeIp(getClientIp(event.request)),
    ua: event.request.headers.get('user-agent') ?? null,
    detail: event.detail ?? null,
  };

  console.log(JSON.stringify(payload));
}

