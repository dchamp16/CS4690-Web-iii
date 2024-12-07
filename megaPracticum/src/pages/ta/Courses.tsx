import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Course } from '../../types';

export default function TACourses() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: courses, isLoading } = useQuery({
        queryKey: ['ta-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>('/ta/courses');
            return response.data;
        }
    });

    if (isLoading) {
        return <div>Loading courses...</div>;
    }

    if (!courses?.length) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Assigned Courses</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                    You are not assigned to any courses yet.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Assigned Courses</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
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
                                onClick={() => navigate(`/ta/logs?courseId=${course.id}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View Logs
                            </button>
                            <button
                                onClick={() => navigate(`/ta/students?courseId=${course._id}`)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Manage Students
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}