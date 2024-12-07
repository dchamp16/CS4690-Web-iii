import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Course } from '../../types';

export default function ManageStudents() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const { data: course, isLoading } = useQuery({
        queryKey: ['ta-course', courseId],
        queryFn: async () => {
            const response = await api.get<Course>(`/api/v1/courses/${courseId}`);
            return response.data;
        },
        enabled: !!courseId
    });

    const addStudentMutation = useMutation({
        mutationFn: async () => {
            try {
                setError('');
                await api.post(`/api/v1/ta/courses/${courseId}/students`, { username });
                setUsername('');
            } catch (err) {
                setError('Failed to add student. Please check the username and try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ta-course', courseId] });
        }
    });

    const removeStudentMutation = useMutation({
        mutationFn: async (studentId: string) => {
            try {
                setError('');
                await api.delete(`/api/v1/ta/courses/${courseId}/students/${studentId}`);
            } catch (err) {
                setError('Failed to remove student. Please try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ta-course', courseId] });
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading course details...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Manage Students</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                    Course not found or you don't have access
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Students</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {course.display} ({course.id})
                        </h2>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <h3 className="font-medium mb-2">Current Students</h3>
                        {course.students.length === 0 ? (
                            <p className="text-gray-500 text-sm">No students enrolled in this course</p>
                        ) : (
                            <ul className="space-y-2">
                                {course.students.map((student) => (
                                    <li
                                        key={typeof student === 'string' ? student : student._id}
                                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                    >
                                        <span>{typeof student === 'object' ? student.username : 'Unknown Student'}</span>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to remove this student?')) {
                                                    removeStudentMutation.mutate(typeof student === 'string' ? student : student._id);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-800"
                                            disabled={removeStudentMutation.isPending}
                                        >
                                            {removeStudentMutation.isPending ? 'Removing...' : 'Remove'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Add Student</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter student username"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => addStudentMutation.mutate()}
                                disabled={!username || addStudentMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {addStudentMutation.isPending ? 'Adding...' : 'Add Student'}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Note: The username must belong to an existing student account in the system
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}