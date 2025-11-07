'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, isAdmin as checkIsAdmin, refreshSession } from '@/lib/auth';

/**
 * Authentication Guard Component
 * Automatically redirects users based on authentication status
 * Keeps users logged in for 7 days
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const admin = checkIsAdmin();

      // Public routes that don't require authentication
      const publicRoutes = ['/', '/admin/login'];
      const isPublicRoute = publicRoutes.includes(pathname);

      // Admin routes
      const isAdminRoute = pathname.startsWith('/admin');

      // Dashboard routes
      const isDashboardRoute = pathname.startsWith('/dashboard');

      console.log('🔐 Auth check:', {
        authenticated,
        admin,
        pathname,
        isPublicRoute,
        isAdminRoute,
        isDashboardRoute
      });

      if (authenticated) {
        // Refresh session on activity (extend expiry)
        refreshSession();

        // If on public route, redirect to appropriate dashboard
        if (isPublicRoute) {
          if (admin) {
            console.log('✅ Auto-login: Redirecting admin to /admin');
            router.push('/admin');
          } else {
            console.log('✅ Auto-login: Redirecting user to /dashboard');
            router.push('/dashboard');
          }
          return;
        }

        // If admin on user route, redirect to admin
        if (admin && isDashboardRoute) {
          console.log('✅ Redirecting admin to /admin');
          router.push('/admin');
          return;
        }

        // If non-admin trying to access admin, redirect to dashboard
        if (!admin && isAdminRoute && pathname !== '/admin/login') {
          console.log('❌ Non-admin accessing admin route, redirecting to /dashboard');
          router.push('/dashboard');
          return;
        }
      } else {
        // Not authenticated
        if (!isPublicRoute) {
          console.log('❌ Not authenticated, redirecting to /');
          router.push('/');
        }
      }
    };

    checkAuth();

    // Refresh session every 5 minutes while app is active
    const refreshInterval = setInterval(() => {
      if (isAuthenticated()) {
        refreshSession();
        console.log('🔄 Session refreshed');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [pathname, router]);

  return <>{children}</>;
}
