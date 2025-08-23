'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles?: string[]; // Optional: restrict to specific roles
}

export default function SecureNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items with role-based access (using actual DB role names)
  // Dynamically set dashboard link based on user role
  let dashboardNavItem = null;
  const userRole = (session?.user as any)?.role || (session?.user as any)?.roleId || '';
  if (userRole === 'Admin User') {
    dashboardNavItem = { name: 'Dashboard', href: '/dashboard/admin', icon: '📊', roles: ['Admin User'] };
  } else if (userRole === 'Tech User') {
    dashboardNavItem = { name: 'Dashboard', href: '/dashboard/tech', icon: '📊', roles: ['Tech User'] };
  }

  const navigationItems: NavItem[] = [
    ...(dashboardNavItem ? [dashboardNavItem] : []),
    { name: 'Tickets', href: '/ticket', icon: '🎫' },
    { name: 'New Ticket', href: '/ticket/new', icon: '➕' },
    { name: 'Close Ticket', href: '/closeTicket', icon: '✅', roles: ['Admin User', 'Tech User'] },
    { name: 'Inventory', href: '/inventory', icon: '📦', roles: ['Admin User', 'Tech User'] },
    { name: 'Part Mapping', href: '/inventory/mapping', icon: '🔗', roles: ['Admin User'] },
    { name: 'Revenue', href: '/revenue', icon: '💰', roles: ['Admin User'] },
    { name: 'Payments', href: '/payment/manual', icon: '💳', roles: ['Admin User', 'Tech User'] },
  ];

  // Filter navigation items based on user role
  const getFilteredNavItems = () => {
    if (!session?.user) return [];
    
    return navigationItems.filter(item => {
      // If no roles specified, show to all authenticated users
      if (!item.roles) return true;
      
      // Check if user's role is in the allowed roles
      // Check both role and roleId for compatibility
      const userRole = (session.user as any)?.role || (session.user as any)?.roleId || 'USER';
      console.log('🔍 Navbar Debug - User Role:', userRole, 'Item:', item.name, 'Required Roles:', item.roles);
      return item.roles.includes(userRole);
    });
  };

  const filteredNavItems = getFilteredNavItems();

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-16">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between flex space-between items-center h-18">
            <Link href="/" className="text-sm font-bold text-gray-800 p-2">
              🔧 Repair Shop
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard/admin" className="text-sm font-bold text-gray-800">
            🔧 Repair Shop
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href)
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                {session.user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {session.user?.email}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Sign Out
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {/* User Info */}
            <div className="py-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                {session.user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">
                {session.user?.email}
              </div>
            </div>
            
            {/* Navigation Items */}
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href)
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
