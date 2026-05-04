import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Pattern officiel Supabase pour Next.js 15+ :
// - NextResponse.next({ request }) avec l'objet request complet
// - getSession() appelé ici pour que supabaseResponse soit bien à jour avant le return
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseKey) {
    return { supabase: null, session: null, error: null, response: supabaseResponse };
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Appel getSession ici pour que supabaseResponse soit final (setAll peut le mettre à jour)
  const { data: { session }, error } = await supabase.auth.getSession();

  return { supabase, session, error, response: supabaseResponse };
};
