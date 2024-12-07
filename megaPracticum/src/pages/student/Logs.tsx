import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Log } from '../../types';

export default function StudentLogs() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');
    const [newLogText, setNewLogText] = useState('');
    const [error, setError] = useState('');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['student-logs', courseId],
        queryFn: async () => {
            const url = courseId
                ? `/logs/course/${courseId}`
                : '/student/logs';
            const response = await api.get<Log[]>(url);
            return response.data;
        }
    });

    const addLogMutation = useMutation({
        mutationFn: async () => {
            try {
                setError('');
                await api.post('/student/logs', {
                    courseId,
                    text: newLogText,
                    date: new Date().toISOString()
                });
                setNewLogText('');
            } catch (err) {
                setError('Failed to add log. Please try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-logs', courseId] });
        }
    });

    const deleteLogMutation = useMutation({
        mutationFn: async (logId: string) => {
            try {
                setError('');
                await api.delete(`/api/v1/student/logs/${logId}`);
            } catch (err) {
                setError('Failed to delete log. Please try again.');
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-logs', courseId] });
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading logs...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Logs</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div>
                    <h2 className="text-lg font-semibold mb-2">Add New Log</h2>
                    <div className="space-y-2">
            <textarea
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Enter your log entry..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
            />
                        {error && (
                            <p className="text-red-600 text-sm">{error}</p>
                        )}
                        <button
                            onClick={() => addLogMutation.mutate()}
                            disabled={!newLogText || addLogMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {addLogMutation.isPending ? 'Adding...' : 'Add Log'}
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Log History</h2>
                    {!logs?.length ? (
                        <p className="text-gray-500 text-center py-4">
                            No logs found. Add your first log entry above.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div
                                    key={log._id}
                                    className="bg-gray-50 p-4 rounded-lg space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(log.date).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Course: {log.courseId}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this log?')) {
                                                    deleteLogMutation.mutate(log._id);
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                            disabled={deleteLogMutation.isPending}
                                        >
                                            {deleteLogMutation.isPending ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                    <p className="mt-2">{log.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}