import { useAuth } from '../../contexts/AuthContext';

export default function TADashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">TA Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome, {user?.username}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Assigned Courses</h2>
          <p className="text-gray-600 mb-4">
            View courses you're assigned to
          </p>
          <button className="text-blue-600 hover:text-blue-800">
            View Courses →
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Manage Students</h2>
          <p className="text-gray-600 mb-4">
            Add or remove students from your courses
          </p>
          <button className="text-blue-600 hover:text-blue-800">
            Manage Students →
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">View Logs</h2>
          <p className="text-gray-600 mb-4">
            Access student logs for your courses
          </p>
          <button className="text-blue-600 hover:text-blue-800">
            View Logs →
          </button>
        </div>
      </div>
    </div>
  );
}