const TAG_REGEX = /<[^>]*>/g;
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizePlainText(input: string, maxLength?: number): string {
  const cleaned = input
    .replace(CONTROL_CHAR_REGEX, '')
    .replace(TAG_REGEX, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  if (typeof maxLength === 'number' && maxLength > 0) {
    return cleaned.slice(0, maxLength);
  }

  return cleaned;
}

export function sanitizeOptionalPlainText(input: string | null | undefined, maxLength?: number): string | null {
  if (!input) return null;
  const cleaned = sanitizePlainText(input, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}
