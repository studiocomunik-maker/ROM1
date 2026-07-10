import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 : convention « proxy » (ex-middleware). Rafraîchit la session
// Supabase sur chaque requête et protège la zone /admin.
export async function proxy(request: NextRequest) {
  // Ancien blog WordPress (chris_blog) encore dans l'index Google :
  // 410 Gone = désindexation rapide, sans payer l'appel d'auth Supabase.
  if (request.nextUrl.pathname.startsWith("/chris_blog")) {
    return new NextResponse(null, { status: 410 });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Ne RIEN exécuter entre createServerClient et getUser (recommandation Supabase).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  // Protège /admin/* (sauf la page de login)
  if (isAdmin && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Déjà connecté → pas la peine de revoir le login
  if (isLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  // Zone admin + ancien blog : les pages publiques (vitrine quasi-statique)
  // ne paient pas l'appel d'auth.
  matcher: ["/admin/:path*", "/chris_blog/:path*"],
};
