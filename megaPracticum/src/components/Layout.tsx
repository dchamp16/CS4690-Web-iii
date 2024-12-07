import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTenantTheme } from '../lib/utils';
import Navigation from './Navigation';

export default function Layout() {
  const { user } = useAuth();
  const tenant = user?.tenant || 'UVU';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${getTenantTheme(tenant)} shadow-md`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">
              {tenant} Student Logs System
            </h1>
            {user && (
              <div className="flex items-center gap-4">
                <span>{user.username}</span>
                <span className="px-2 py-1 bg-white/20 rounded">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}