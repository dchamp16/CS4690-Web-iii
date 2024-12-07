import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Course } from '../../types';

export default function TeacherCourses() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: courses, isLoading } = useQuery({
        queryKey: ['teacher-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>('/teacher/courses');
            return response.data;
        }
    });

    if (isLoading) {
        return <div>Loading courses...</div>;
    }

    const handleViewLogs = (courseId: string) => {
        navigate(`/teacher/logs?courseId=${courseId}`);
    };

    const handleManageTAs = (courseId: string) => {
        navigate(`/teacher/tas?courseId=${courseId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.map((course) => (
                    <div key={course._id} className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">{course.display}</h2>
                        <p className="text-gray-600 mb-4">Course ID: {course.id}</p>

                        <div className="space-y-2">
                            <h3 className="font-medium">TAs ({course.tas.length})</h3>
                            <ul className="text-sm text-gray-600">
                                {course.tas.map((ta) => (
                                    <li key={typeof ta === 'string' ? ta : ta._id}>
                                        {typeof ta === 'object' ? ta.username : 'Unknown TA'}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2 mt-4">
                            <h3 className="font-medium">Students ({course.students.length})</h3>
                            <ul className="text-sm text-gray-600">
                                {course.students.map((student) => (
                                    <li key={typeof student === 'string' ? student : student._id}>
                                        {typeof student === 'object' ? student.username : 'Unknown Student'}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button
                                onClick={() => handleViewLogs(course.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View Logs
                            </button>
                            <button
                                onClick={() => handleManageTAs(course._id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Manage TAs
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}