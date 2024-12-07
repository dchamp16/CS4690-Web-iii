import express from 'express';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Log } from '../models/Log.js';
import { verifyRole, verifyTenant } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware
router.use(verifyRole(['admin']));
router.use(verifyTenant);

// Users CRUD
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ tenant: req.user.tenant }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const newUser = await User.create({
      username,
      password,
      role,
      tenant: req.user.tenant,
    });
    const userResponse = await User.findById(newUser._id).select('-password');
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { username, role } = req.body;
    const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id, tenant: req.user.tenant },
        { username, role },
        { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: req.params.id,
      tenant: req.user.tenant,
    });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Courses CRUD
router.get('/courses', async (req, res) => {
  try {
    console.log('Fetching courses for tenant:', req.user.tenant);
    const courses = await Course.find({ tenant: req.user.tenant })
        .populate('teacher', 'username')
        .populate('tas', 'username')
        .populate('students', 'username');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});


router.post('/courses', async (req, res) => {
  try {
    const { id, display, teacherId } = req.body;
    console.log('Creating course:', { id, display, teacherId, tenant: req.user.tenant });

    // Verify teacher exists and belongs to the same tenant
    const teacher = await User.findOne({
      _id: teacherId,
      role: 'teacher',
      tenant: req.user.tenant
    });

    if (!teacher) {
      return res.status(400).json({ message: 'Invalid teacher selected' });
    }

    // Check if course ID already exists for this tenant
    const existingCourse = await Course.findOne({
      id,
      tenant: req.user.tenant
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course ID already exists' });
    }

    const newCourse = await Course.create({
      id,
      display,
      teacher: teacherId,
      tenant: req.user.tenant,
      tas: [],
      students: []
    });

    const courseResponse = await Course.findById(newCourse._id)
        .populate('teacher', 'username');

    console.log('Course created successfully:', courseResponse);
    res.status(201).json(courseResponse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      message: 'Error creating course',
      error: error.message
    });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { display, teacherId } = req.body;
    const updatedCourse = await Course.findOneAndUpdate(
        { _id: req.params.id, tenant: req.user.tenant },
        { display, teacher: teacherId },
        { new: true }
    ).populate('teacher', 'username');

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// Delete course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete associated logs
    await Log.deleteMany({
      courseId: course.id,
      tenant: req.user.tenant
    });

    res.json({ message: 'Course and associated logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});


// Logs CRUD
router.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find({ tenant: req.user.tenant }).sort('-date');
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

router.delete('/logs/:id', async (req, res) => {
  try {
    const deletedLog = await Log.findOneAndDelete({
      _id: req.params.id,
      tenant: req.user.tenant,
    });

    if (!deletedLog) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Error deleting log' });
  }
});

router.delete('/logs', async (req, res) => {
  try {
    await Log.deleteMany({ tenant: req.user.tenant });
    res.json({ message: 'All logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting all logs:', error);
    res.status(500).json({ message: 'Error deleting all logs' });
  }
});

export default router;
