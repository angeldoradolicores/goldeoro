import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  return { url, anonKey };
}

export async function GET(request: Request) {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: 'Supabase credentials are not configured for this environment.' },
      { status: 500 }
    );
  }

  const supabase = createServerClient(url, anonKey, {
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
  });

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
