import type { Plan } from '@/lib/types';

export type PricingFeature =
  | 'analytics'
  | 'wall_of_love'
  | 'remove_badge'
  | 'premium_styles'
  | 'ai_outreach'
  | 'unlimited_widgets'
  | 'testimonial_capacity'
  | 'testimonial_editor';

type LimitValue = number | null;

interface UsageProfileLike {
  ai_requests_used?: number | null;
  ai_requests_period?: string | null;
}

interface PlanEntitlements {
  widgets: LimitValue;
  testimonials: LimitValue;
  monthlyAiRequests: LimitValue;
  styleCount: LimitValue;
  features: Record<PricingFeature, boolean>;
}

export const FREE_WIDGET_LIMIT = 1;
export const FREE_TESTIMONIAL_LIMIT = 10;
export const FREE_AI_REQUEST_LIMIT = 5;
export const FREE_STYLE_LIMIT = 3;

const ENTITLEMENTS: Record<Plan, PlanEntitlements> = {
  free: {
    widgets: FREE_WIDGET_LIMIT,
    testimonials: FREE_TESTIMONIAL_LIMIT,
    monthlyAiRequests: FREE_AI_REQUEST_LIMIT,
    styleCount: FREE_STYLE_LIMIT,
    features: {
      analytics: false,
      wall_of_love: true,
      remove_badge: false,
      premium_styles: false,
      ai_outreach: true,
      unlimited_widgets: false,
      testimonial_capacity: false,
      testimonial_editor: false,
    },
  },
  pro: {
    widgets: null,
    testimonials: null,
    monthlyAiRequests: null,
    styleCount: null,
    features: {
      analytics: true,
      wall_of_love: true,
      remove_badge: true,
      premium_styles: true,
      ai_outreach: true,
      unlimited_widgets: true,
      testimonial_capacity: true,
      testimonial_editor: true,
    },
  },
};

const ALL_FEATURES: PricingFeature[] = [
  'analytics',
  'wall_of_love',
  'remove_badge',
  'premium_styles',
  'ai_outreach',
  'unlimited_widgets',
  'testimonial_capacity',
  'testimonial_editor',
];

export interface AiUsageSnapshot {
  limit: LimitValue;
  usedThisMonth: number;
  remainingThisMonth: LimitValue;
  period: string;
}

export function normalizePlan(plan: string | null | undefined): Plan {
  return plan === 'pro' ? 'pro' : 'free';
}

export function isPricingFeature(value: string | null | undefined): value is PricingFeature {
  return typeof value === 'string' && ALL_FEATURES.includes(value as PricingFeature);
}

export function canAccessPricingFeature(plan: string | null | undefined, feature: PricingFeature): boolean {
  return ENTITLEMENTS[normalizePlan(plan)].features[feature];
}

export function getWidgetLimit(plan: string | null | undefined): LimitValue {
  return ENTITLEMENTS[normalizePlan(plan)].widgets;
}

export function getTestimonialLimit(plan: string | null | undefined): LimitValue {
  return ENTITLEMENTS[normalizePlan(plan)].testimonials;
}

export function getMonthlyAiRequestLimit(plan: string | null | undefined): LimitValue {
  return ENTITLEMENTS[normalizePlan(plan)].monthlyAiRequests;
}

export function getStyleCountLimit(plan: string | null | undefined): LimitValue {
  return ENTITLEMENTS[normalizePlan(plan)].styleCount;
}

export function isStyleLockedForPlan(plan: string | null | undefined, styleIndex: number): boolean {
  const styleLimit = getStyleCountLimit(plan);
  return styleLimit !== null && styleIndex >= styleLimit;
}

export function getCurrentUsagePeriod(now: Date = new Date()): string {
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
}

export function getAiUsageSnapshot(
  plan: string | null | undefined,
  profile: UsageProfileLike,
  now: Date = new Date()
): AiUsageSnapshot {
  const normalizedPlan = normalizePlan(plan);
  const limit = getMonthlyAiRequestLimit(normalizedPlan);
  const period = getCurrentUsagePeriod(now);
  const used =
    profile.ai_requests_period === period && typeof profile.ai_requests_used === 'number'
      ? Math.max(0, profile.ai_requests_used)
      : 0;

  return {
    limit,
    usedThisMonth: used,
    remainingThisMonth: limit === null ? null : Math.max(limit - used, 0),
    period,
  };
}

export function getUpgradeHref(feature: PricingFeature): string {
  return `/settings?upgrade=${feature}`;
}

export function getUpgradeCopy(feature: PricingFeature): { title: string; description: string } {
  switch (feature) {
    case 'analytics':
      return {
        title: 'Analytics is a Pro feature',
        description: 'Upgrade to Pro to unlock analytics and response tracking across your testimonials.',
      };
    case 'wall_of_love':
      return {
        title: 'Wall of Love',
        description:
          'Your approved testimonials appear on the Wall of Love page in the dashboard. Open it from the sidebar anytime.',
      };
    case 'remove_badge':
      return {
        title: 'Badge removal is available on Pro',
        description: 'Free embeds keep the Proofengine badge. Upgrade to Pro to remove it.',
      };
    case 'premium_styles':
      return {
        title: 'Premium styles are available on Pro',
        description: 'Starter includes 3 free styles. Upgrade to Pro to unlock the full style gallery.',
      };
    case 'ai_outreach':
      return {
        title: 'More AI outreach messages are available on Pro',
        description: 'Starter includes 5 AI-generated request messages per month. Upgrade to Pro for unlimited AI outreach.',
      };
    case 'unlimited_widgets':
      return {
        title: 'Unlimited widgets are available on Pro',
        description: 'Starter is limited to 1 widget. Upgrade to Pro to create as many widgets as you need.',
      };
    case 'testimonial_capacity':
      return {
        title: 'Higher testimonial storage is available on Pro',
        description: 'Starter stores up to 10 testimonials. Upgrade to Pro for unlimited testimonial storage.',
      };
    case 'testimonial_editor':
      return {
        title: 'Testimonial editor is a Pro feature',
        description:
          'Upgrade to Pro to edit testimonial copy, compare versions, and run AI grammar, shorten, and tone tools.',
      };
    default:
      return {
        title: 'This feature is available on Pro',
        description: 'Upgrade to Pro to unlock the full Proofengine experience.',
      };
  }
}
