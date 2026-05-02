import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
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

  // Rafraîchir la session silencieusement — en cas de refresh token invalide,
  // on efface les cookies de session sans planter le middleware
  supabase.auth.getSession().catch(() => {
    // Refresh token expiré ou introuvable : on nettoie les cookies
    const response = NextResponse.next({ request });
    request.cookies.getAll().forEach(({ name }) => {
      if (name.includes('auth-token') || name.includes('supabase')) {
        response.cookies.delete(name);
      }
    });
    supabaseResponse = response;
  });

  return supabaseResponse;
};
