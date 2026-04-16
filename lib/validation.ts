import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid ID format');

export const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(200, 'Slug is too long')
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Invalid slug format');

export function isValidUuid(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

export function isValidSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}
