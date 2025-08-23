import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import SecureNavbar from '@/components/SecureNavbar';

interface SecureLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // Optional: specify required roles
}

export default async function SecureLayout({ 
  children, 
  requiredRoles 
}: SecureLayoutProps) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login');
  }

  // TEMPORARILY DISABLE ROLE CHECKING FOR DEBUGGING
  console.log('🔍 SecureLayout - Session:', JSON.stringify(session, null, 2));
  console.log('🔍 SecureLayout - Required Roles:', requiredRoles);
  console.log('🔍 SecureLayout - User Role:', (session.user as any)?.role, (session.user as any)?.roleId);
  
  /* ORIGINAL ROLE CHECKING CODE - COMMENTED OUT FOR DEBUGGING
  // Check role-based access if roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = (session.user as any)?.roleId || 'ADMIN';
    if (!requiredRoles.includes(userRole)) {
      redirect('/unauthorized');
    }
  }
  */

  return (
    <div className="min-h-screen bg-gray-50">
      <SecureNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
