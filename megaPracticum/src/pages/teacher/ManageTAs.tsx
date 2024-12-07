import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Course } from '../../types';

export default function ManageTAs() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const initialCourseId = searchParams.get('courseId') || '';
    const [selectedCourse, setSelectedCourse] = useState<string>(initialCourseId);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const { data: courses, isLoading } = useQuery({
        queryKey: ['teacher-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>('/teacher/courses');
            return response.data;
        }
    });

    useEffect(() => {
        if (initialCourseId) {
            setSelectedCourse(initialCourseId);
        }
    }, [initialCourseId]);

    const addTAMutation = useMutation({
        mutationFn: async () => {
            try {
                setError('');
                await api.post(`/teacher/courses/${selectedCourse}/tas`, { username });
                setUsername('');
            } catch (err) {
                setError('Failed to add TA. Please check the username and try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
        }
    });

    const removeTAMutation = useMutation({
        mutationFn: async (taId: string) => {
            try {
                setError('');
                await api.delete(`/teacher/courses/${selectedCourse}/tas/${taId}`);
            } catch (err) {
                setError('Failed to remove TA. Please try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading courses...</div>
            </div>
        );
    }

    const selectedCourseData = courses?.find(c => c._id === selectedCourse);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage TAs</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Select Course
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select a course...</option>
                            {courses?.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.display} ({course.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {selectedCourse && (
                        <>
                            <div>
                                <h3 className="font-medium mb-2">Current TAs</h3>
                                {selectedCourseData?.tas.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No TAs assigned to this course</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {selectedCourseData?.tas.map((ta) => (
                                            <li
                                                key={typeof ta === 'string' ? ta : ta._id}
                                                className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                            >
                                                <span>{typeof ta === 'object' ? ta.username : 'Unknown TA'}</span>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to remove this TA?')) {
                                                            removeTAMutation.mutate(typeof ta === 'string' ? ta : ta._id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Add TA</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter TA username"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => addTAMutation.mutate()}
                                        disabled={!username || addTAMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {addTAMutation.isPending ? 'Adding...' : 'Add TA'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Note: The username must belong to an existing TA account in the system
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}