import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTenantTheme, getTenantAccent, cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const tenant = user?.tenant || 'UVU';

  useEffect(() => {
    // Only navigate if the user is authenticated and the user object exists
    if (isAuthenticated && user) {
      navigate(`/${user.role.toLowerCase()}`);
    }
  }, [navigate, isAuthenticated, user]);  // Adding dependencies to useEffect to rerun when they change

  // Return the JSX structure directly if not authenticated
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Student Logs System</h1>
          <p className="mt-2 text-gray-600">
            Welcome to the Student Logs System. Please log in to continue.
          </p>
          <div className="mt-8">
            <button
                onClick={() => navigate('/login')}
                className={cn(
                    'px-8 py-3 rounded-md font-medium transition-colors',
                    getTenantTheme(tenant),
                    getTenantAccent(tenant)
                )}
            >
              Log In
            </button>
          </div>
        </div>
      </div>
  );
}
