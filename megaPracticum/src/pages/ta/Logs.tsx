import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type { Log } from '../../types';

export default function TALogs() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['ta-logs', courseId],
        queryFn: async () => {
            const url = courseId
                ? `/ta/logs/${courseId}`
                : '/ta/logs';
            const response = await api.get<Log[]>(url);
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="text-gray-500">Loading logs...</div>
            </div>
        );
    }

    if (!logs?.length) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Course Logs</h1>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                    No logs found {courseId ? 'for this course' : 'for your courses'}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Course Logs</h1>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Text
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(log.date).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {log.courseId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {log.uvuId || log.uofuId}
                            </td>
                            <td className="px-6 py-4">
                                {log.text}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}