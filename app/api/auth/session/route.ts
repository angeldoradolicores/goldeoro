import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookieHeader = request.headers.get('cookie') ?? '';
          return cookieHeader
            .split('; ')
            .filter(Boolean)
            .map((c) => {
              const [name, ...rest] = c.split('=');
              return { name, value: rest.join('=') };
            });
        },
        setAll: () => {}, // not needed for GET
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // obtener admin flag if needed (optional, you can query here)
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    isAdmin = !!profile?.is_admin;
  }

  return NextResponse.json({ user, isAdmin });
}
