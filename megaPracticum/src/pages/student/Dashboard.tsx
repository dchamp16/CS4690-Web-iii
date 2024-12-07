import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ClipboardList, PlusCircle } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const cards = [
    {
      title: 'My Courses',
      description: 'View your enrolled courses',
      icon: BookOpen,
      href: '/student/courses'
    },
    {
      title: 'Course Registration',
      description: 'Register for new courses',
      icon: PlusCircle,
      href: '/student/register'
    },
    {
      title: 'My Logs',
      description: 'View and manage your course logs',
      icon: ClipboardList,
      href: '/student/logs'
    }
  ];

  const studentId = user?.tenant === 'UVU' ? user.uvuId : user.uofuId;
  const idLabel = user?.tenant === 'UVU' ? 'UVU ID' : 'UofU ID';

  console.log(studentId)

  console.log('Current user data:', user);

  return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <div className="text-sm text-gray-600">
            <p>Welcome, {user?.username}</p>
            <p>{idLabel}: {studentId || 'Not available'}</p>
            <p>Institution: {user?.tenant}</p>
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