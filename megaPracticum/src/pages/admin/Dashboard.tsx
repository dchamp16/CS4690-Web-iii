import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      title: 'Manage Users',
      description: 'Create and manage teachers, TAs, and students',
      icon: Users,
      href: '/admin/users'
    },
    {
      title: 'Manage Courses',
      description: 'Create and manage course offerings',
      icon: BookOpen,
      href: '/admin/courses'
    },
    {
      title: 'View Logs',
      description: 'Access all student logs across courses',
      icon: ClipboardList,
      href: '/admin/logs'
    }
  ];

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            Welcome, {user?.username}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
              <button
                  key={card.href}
                  onClick={() => navigate(card.href)}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <card.icon className="w-8 h-8 text-gray-700 mb-4" />
                <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                <p className="text-gray-600">{card.description}</p>
              </button>
          ))}
        </div>
      </div>
  );
}