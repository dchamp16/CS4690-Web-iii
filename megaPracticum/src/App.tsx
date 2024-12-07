import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminLogs from './pages/admin/Logs';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherLogs from './pages/teacher/Logs';
import ManageTAs from './pages/teacher/ManageTAs';

// TA pages
import TADashboard from './pages/ta/Dashboard';
import TACourses from './pages/ta/Courses';
import TALogs from './pages/ta/Logs';
import ManageStudents from './pages/ta/ManageStudents';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentLogs from './pages/student/Logs';
import Register from './pages/student/Register';

const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </PrivateRoute>
                } />
                <Route path="/admin/courses" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminCourses />
                  </PrivateRoute>
                } />
                <Route path="/admin/logs" element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminLogs />
                  </PrivateRoute>
                } />

                {/* Teacher Routes */}
                <Route path="/teacher" element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </PrivateRoute>
                } />
                <Route path="/teacher/courses" element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherCourses />
                  </PrivateRoute>
                } />
                <Route path="/teacher/logs" element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <TeacherLogs />
                  </PrivateRoute>
                } />
                <Route path="/teacher/tas" element={
                  <PrivateRoute allowedRoles={['teacher']}>
                    <ManageTAs />
                  </PrivateRoute>
                } />

                {/* TA Routes */}
                <Route path="/ta" element={
                  <PrivateRoute allowedRoles={['TA']}>
                    <TADashboard />
                  </PrivateRoute>
                } />
                <Route path="/ta/courses" element={
                  <PrivateRoute allowedRoles={['TA']}>
                    <TACourses />
                  </PrivateRoute>
                } />
                <Route path="/ta/logs" element={
                  <PrivateRoute allowedRoles={['TA']}>
                    <TALogs />
                  </PrivateRoute>
                } />
                <Route path="/ta/students" element={
                  <PrivateRoute allowedRoles={['TA']}>
                    <ManageStudents />
                  </PrivateRoute>
                } />

                {/* Student Routes */}
                <Route path="/student" element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </PrivateRoute>
                } />
                <Route path="/student/courses" element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentCourses />
                  </PrivateRoute>
                } />
                <Route path="/student/register" element={
                  <PrivateRoute allowedRoles={['student']}>
                    <Register />
                  </PrivateRoute>
                } />
                <Route path="/student/logs" element={
                  <PrivateRoute allowedRoles={['student']}>
                    <StudentLogs />
                  </PrivateRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
  );
}

export default App;