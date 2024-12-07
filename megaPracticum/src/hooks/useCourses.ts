import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Course } from '../types';

export function useCourses() {
    const { user } = useAuth();

    const { data: enrolledCourses, isLoading: isLoadingEnrolled } = useQuery({
        queryKey: ['student-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>('/student/courses');
            return response.data;
        },
        enabled: user?.role === 'student'
    });

    const { data: allCourses, isLoading: isLoadingAll } = useQuery({
        queryKey: ['all-courses'],
        queryFn: async () => {
            const response = await api.get<Course[]>(`/courses?tenant=${user?.tenant}`);
            return response.data;
        },
        enabled: user?.role === 'student'
    });

    const availableCourses = allCourses?.filter(course =>
        course.tenant === user?.tenant &&
        !enrolledCourses?.some(enrolled => enrolled.id === course.id)
    ) || [];

    return {
        enrolledCourses: enrolledCourses || [],
        availableCourses,
        isLoading: isLoadingEnrolled || isLoadingAll
    };
}