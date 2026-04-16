import { z } from 'zod';

const emailSchema = z.email('Please enter a valid email address').transform((value) => value.trim().toLowerCase());

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Include at least one special character')
  .regex(/^\S+$/, 'Password cannot contain spaces');

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .max(80, 'Full name must be less than 80 characters')
  .refine((value) => !/[\u0000-\u001F\u007F]/.test(value), 'Full name contains invalid characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const signupSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean(),
    honeypot: z.string().optional().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }

    if (!value.acceptTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['acceptTerms'],
        message: 'You must accept the Terms and Privacy Policy',
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function getPasswordChecks(password: string) {
  return {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    noSpaces: /^\S*$/.test(password),
  };
}

export function getPasswordStrength(password: string) {
  const checks = getPasswordChecks(password);
  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 2) return { score, label: 'Weak' as const };
  if (score <= 4) return { score, label: 'Fair' as const };
  if (score <= 5) return { score, label: 'Strong' as const };
  return { score, label: 'Excellent' as const };
}

export function zodFieldErrors(error: z.ZodError) {
  const flattened = error.flatten().fieldErrors;
  const mapped: Record<string, string> = {};
  Object.keys(flattened).forEach((key) => {
    const first = flattened[key as keyof typeof flattened]?.[0];
    if (first) mapped[key] = first;
  });
  return mapped;
}
