import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { validateEnvironment } from "@/config/environment";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const env = validateEnvironment();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing logic between createServerClient and getUser().
  // getUser() refreshes the Auth token if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes: /(app) sub-routes
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/problems") ||
    pathname.startsWith("/patterns") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/revision") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/calendar");

  // Auth routes: /(auth) sub-routes
  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedPath && !user) {
    // Unauthenticated user trying to access protected route -> redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    // Authenticated user trying to access login/signup -> redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
