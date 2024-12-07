import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = {
    admin: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/courses', label: 'Courses' },
      { href: '/admin/logs', label: 'Logs' },
    ],
    teacher: [
      { href: '/teacher', label: 'Dashboard' },
      { href: '/teacher/courses', label: 'My Courses' },
      { href: '/teacher/logs', label: 'Logs' },
    ],
    TA: [
      { href: '/ta', label: 'Dashboard' },
      { href: '/ta/courses', label: 'Assigned Courses' },
      { href: '/ta/logs', label: 'Logs' },
    ],
    student: [
      { href: '/student', label: 'Dashboard' },
      { href: '/student/courses', label: 'My Courses' },
      { href: '/student/logs', label: 'My Logs' },
    ],
  }[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-4">
              {navItems.map((item) => (
                  <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          location.pathname === item.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                  >
                    {item.label}
                  </Link>
              ))}
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>
  );
}