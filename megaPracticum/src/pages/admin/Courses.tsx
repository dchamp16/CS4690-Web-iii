import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Course, User } from '../../types';

export default function Courses() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({
        id: '',
        display: '',
        teacherId: ''
    });

    // Fetch courses
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>('/admin/courses');
            console.log('Fetched courses:', response.data);
            return response.data;
        }
    });

    // Fetch teachers
    const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await api.get<User[]>('/admin/users');
            const teachersList = response.data.filter(user => user.role === 'teacher');
            console.log('Available teachers:', teachersList);
            return teachersList;
        }
    });

    // Add course mutation
    const addCourseMutation = useMutation({
        mutationFn: async () => {
            console.log('Adding course:', newCourse);
            const response = await api.post('/admin/courses', newCourse);
            return response.data;
        },
        onSuccess: () => {
            console.log('Course added successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            setIsAddingCourse(false);
            setNewCourse({ id: '', display: '', teacherId: '' });
            setError('');
        },
        onError: (error: any) => {
            console.error('Error adding course:', error);
            setError(error.response?.data?.message || 'Failed to add course. Please try again.');
        }
    });

    // Delete course mutation
    const deleteCourseMutation = useMutation({
        mutationFn: async (courseId: string) => {
            console.log('Deleting course:', courseId);
            await api.delete(`/admin/courses/${courseId}`);
        },
        onSuccess: () => {
            console.log('Course deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
            setError('');
        },
        onError: (error: any) => {
            console.error('Error deleting course:', error);
            setError(error.response?.data?.message || 'Failed to delete course. Please try again.');
        }
    });

    const handleAddCourse = async () => {
        if (!newCourse.id || !newCourse.display || !newCourse.teacherId) {
            setError('Please fill in all fields');
            return;
        }
        addCourseMutation.mutate();
    };

    if (isLoadingCourses || isLoadingTeachers) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Courses</h1>
                <button
                    onClick={() => setIsAddingCourse(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Add Course
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
                    {error}
                </div>
            )}

            {isAddingCourse && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Add New Course</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course ID</label>
                            <input
                                type="text"
                                value={newCourse.id}
                                onChange={(e) => setNewCourse({ ...newCourse, id: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="e.g., cs4690"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Name</label>
                            <input
                                type="text"
                                value={newCourse.display}
                                onChange={(e) => setNewCourse({ ...newCourse, display: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="e.g., Web Programming"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assign Teacher</label>
                            <select
                                value={newCourse.teacherId}
                                onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select a teacher...</option>
                                {teachers?.map((teacher) => (
                                    <option key={teacher._id} value={teacher._id}>
                                        {teacher.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingCourse(false);
                                    setError('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCourse}
                                disabled={!newCourse.id || !newCourse.display || !newCourse.teacherId || addCourseMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {addCourseMutation.isPending ? 'Adding...' : 'Add Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teacher
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {courses?.map((course) => (
                        <tr key={course._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {course.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {course.display}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {typeof course.teacher === 'object' ? course.teacher.username : 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this course?')) {
                                            deleteCourseMutation.mutate(course._id);
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    disabled={deleteCourseMutation.isPending}
                                >
                                    {deleteCourseMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}