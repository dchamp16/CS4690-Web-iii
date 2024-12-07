import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, ClipboardList } from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      title: 'My Courses',
      description: 'View and manage your courses',
      icon: BookOpen,
      href: '/teacher/courses'
    },
    {
      title: 'Manage TAs',
      description: 'Add or remove TAs from your courses',
      icon: Users,
      href: '/teacher/tas'
    },
    {
      title: 'Student Logs',
      description: 'View student logs for your courses',
      icon: ClipboardList,
      href: '/teacher/logs'
    }
  ];

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
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