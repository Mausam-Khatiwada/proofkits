export type Plan = 'free' | 'pro';
export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: Plan;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  widget_count: number;
  ai_requests_used: number;
  ai_requests_period: string | null;
  created_at: string;
}

export interface Widget {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  show_badge: boolean;
  theme: Theme;
  created_at: string;
}

export interface Testimonial {
  id: string;
  widget_id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar_url: string | null;
  body: string;
  rating: number;
  approved: boolean;
  created_at: string;
}

export interface WidgetWithCount extends Widget {
  testimonial_count: number;
  approved_count: number;
}
