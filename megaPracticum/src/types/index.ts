export interface User {
  _id: string;
  username: string;
  role: 'admin' | 'teacher' | 'TA' | 'student';
  tenant: 'UVU' | 'UofU';
  uvuId?: string;
  uofuId?: string;
}

export interface Course {
  _id: string;
  id: string;
  display: string;
  tenant: 'UVU' | 'UofU';
  teacher: string | User;
  tas: string[] | User[];
  students: string[] | User[];
}

export interface Log {
  _id: string;
  courseId: string;
  uvuId?: string;
  uofuId?: string;
  text: string;
  date: string;
  tenant: 'UVU' | 'UofU';
}

export interface AuthResponse {
  user: User;
  token: string;
}