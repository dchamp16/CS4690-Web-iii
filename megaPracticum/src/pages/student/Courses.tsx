import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../hooks/useCourses';

export default function StudentCourses() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { enrolledCourses, isLoading } = useCourses();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <button
                    onClick={() => navigate('/student/register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Register for Courses
                </button>
            </div>

            {!enrolledCourses?.length ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                    You are not enrolled in any courses.
                    <button
                        onClick={() => navigate('/student/register')}
                        className="block mx-auto mt-4 text-blue-600 hover:text-blue-800"
                    >
                        Browse Available Courses →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => (
                        <div key={course._id} className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-2">{course.display}</h2>
                            <p className="text-gray-600 mb-4">Course ID: {course.id}</p>
                            <div className="space-y-2">
                                <h3 className="font-medium">Teacher</h3>
                                <p className="text-sm text-gray-600">
                                    {typeof course.teacher === 'object' ? course.teacher.username : 'Unknown'}
                                </p>
                            </div>
                            <div className="space-y-2 mt-4">
                                <h3 className="font-medium">TAs</h3>
                                <ul className="text-sm text-gray-600">
                                    {course.tas.map((ta) => (
                                        <li key={typeof ta === 'string' ? ta : ta._id}>
                                            {typeof ta === 'object' ? ta.username : 'Unknown TA'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => navigate(`/student/logs?courseId=${course.id}`)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View Logs →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}