import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/unauthorized', '/', '/debug-auth', '/debug-session'];
  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Define protected routes and their required roles (using actual DB role names)
  const protectedRoutes = {
    '/dashboard/admin': ['Admin User'],
    '/dashboard/tech': ['Tech User', 'Admin User'],
    '/dashboard': ['Admin User', 'Tech User'],
    '/revenue': ['Admin User'],
    '/payment': ['Admin User', 'Tech User'],
    '/closeTicket': ['Admin User', 'Tech User'],
    '/invoice': ['Admin User', 'Tech User'],
    '/inventory': ['Admin User', 'Tech User'],
    '/ticket': ['Admin User', 'Tech User'],
  };

  // Get user role from token and email for fallback routing
  const userRole = token ? (token.role as string || 'USER') : 'USER';
  const userEmail = token ? (token.email as string) : '';
  const roleId = token ? (token.roleId as string) : '';
  
  console.log('🔍 Middleware Debug - Full Token Info:', {
    pathname,
    userRole,
    userEmail,
    roleId,
    hasToken: !!token
  });

  // Check role-based access
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    const allowedRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    
    // Check role-based access
    let hasAccess = allowedRoles.includes(userRole);
    
    // Fallback: Email-based access for admin routes
    if (!hasAccess && matchedRoute === '/dashboard/admin') {
      hasAccess = userEmail === 'admin@example.com' || userEmail?.includes('admin');
      console.log('🔄 Using email fallback for admin access:', hasAccess);
    }
    
    // Fallback: Email-based access for tech routes  
    if (!hasAccess && (matchedRoute === '/dashboard/tech' || allowedRoles.includes('Tech User'))) {
      hasAccess = userEmail === 'tech@example.com' || userEmail?.includes('tech');
      console.log('🔄 Using email fallback for tech access:', hasAccess);
    }
    
    console.log('🔍 Access Check:', {
      route: matchedRoute,
      allowedRoles,
      userRole,
      userEmail,
      hasAccess
    });
    
    if (!hasAccess) {
      console.log('❌ Access Denied - Redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    } else {
      console.log('✅ Access Granted');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)  
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
