import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses } from '../../hooks/useCourses';
import api from '../../services/api';

export default function Register() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const { availableCourses, isLoading } = useCourses();

    const registerMutation = useMutation({
        mutationFn: async (courseId: string) => {
            try {
                setError('');
                await api.post('/student/register', {
                    courseId,
                    tenant: user?.tenant
                });
            } catch (err) {
                setError('Failed to register for course. Please try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-courses'] });
            queryClient.invalidateQueries({ queryKey: ['all-courses'] });
            navigate('/student/courses');
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading available courses...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Available Courses</h1>
                <button
                    onClick={() => navigate('/student/courses')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    View My Courses
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            {!availableCourses?.length ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                    No courses available for registration in {user?.tenant}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableCourses.map((course) => (
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
                            <button
                                onClick={() => registerMutation.mutate(course.id)}
                                disabled={registerMutation.isPending}
                                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {registerMutation.isPending ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}