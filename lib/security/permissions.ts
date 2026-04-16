type SupabaseLike = {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => PromiseLike<{ data: Record<string, unknown> | null; error?: { message?: string } | null }>;
      };
    };
  };
};

function asSupabaseLike(supabase: unknown): SupabaseLike {
  return supabase as SupabaseLike;
}

export async function requireAuthenticatedUser(supabase: unknown) {
  const db = asSupabaseLike(supabase);
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}

export async function requireWidgetOwner({
  supabase,
  userId,
  widgetId,
  select = 'id, user_id',
}: {
  supabase: unknown;
  userId: string;
  widgetId: string;
  select?: string;
}) {
  const db = asSupabaseLike(supabase);
  const { data } = await db
    .from('widgets')
    .select(select)
    .eq('id', widgetId)
    .single();

  const ownerId = typeof data?.user_id === 'string' ? data.user_id : null;
  if (!data || !ownerId || ownerId !== userId) {
    return null;
  }

  return data;
}

export async function requireTestimonialOwner({
  supabase,
  userId,
  testimonialId,
  select = 'id, widget_id, approved',
}: {
  supabase: unknown;
  userId: string;
  testimonialId: string;
  select?: string;
}) {
  const db = asSupabaseLike(supabase);
  const { data: testimonial } = await db
    .from('testimonials')
    .select(select)
    .eq('id', testimonialId)
    .single();

  if (!testimonial || typeof testimonial.widget_id !== 'string') {
    return null;
  }

  const widget = await requireWidgetOwner({
    supabase: db,
    userId,
    widgetId: testimonial.widget_id,
    select: 'id, user_id',
  });

  if (!widget) return null;
  return testimonial;
}
