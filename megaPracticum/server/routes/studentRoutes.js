import express from 'express';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Log } from '../models/Log.js';
import { verifyRole, verifyTenant } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware
router.use(verifyRole(['student']));
router.use(verifyTenant);

// Get student's courses
router.get('/courses', async (req, res) => {
  try {
    console.log('Fetching courses for student:', req.user.id);
    const courses = await Course.find({
      students: req.user.id,
      tenant: req.user.tenant
    })
        .populate('teacher', 'username')
        .populate('tas', 'username');

    console.log('Found courses:', courses.length);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Register for a course
router.post('/register', async (req, res) => {
  try {
    const { courseId } = req.body;
    console.log('Student registration attempt:', {
      studentId: req.user.id,
      courseId,
      tenant: req.user.tenant
    });

    // Find the course and verify tenant
    const course = await Course.findOne({
      id: courseId,
      tenant: req.user.tenant
    });

    if (!course) {
      console.log('Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is already enrolled
    if (course.students.includes(req.user.id)) {
      console.log('Student already enrolled');
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.students.push(req.user.id);
    await course.save();

    // Update student's courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { courses: course._id }
    });

    console.log('Registration successful');
    res.json({ message: 'Successfully registered for course' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering for course' });
  }
});

// Get student's logs
router.get('/logs', async (req, res) => {
  try {
    console.log('Fetching logs for student:', req.user);

    // Get all courses the student is enrolled in
    const courses = await Course.find({
      students: req.user.id,
      tenant: req.user.tenant
    });

    const courseIds = courses.map(course => course.id);
    console.log('Student courses:', courseIds);

    // Build query based on tenant
    const idField = req.user.tenant === 'UVU' ? 'uvuId' : 'uofuId';
    const studentId = req.user[idField];
    const query = {
      courseId: { $in: courseIds },
      [idField]: studentId,
      tenant: req.user.tenant
    };

    // Add courseId filter if provided
    if (req.query.courseId) {
      query.courseId = req.query.courseId;
    }

    console.log('Log query:', query);
    const logs = await Log.find(query).sort('-date');
    console.log('Found logs:', logs.length);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching student logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Add new log
router.post('/logs', async (req, res) => {
  try {
    const { courseId, text } = req.body;
    console.log('Creating new log:', { courseId, text });

    // Verify student is enrolled in the course
    const course = await Course.findOne({
      id: courseId,
      students: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      console.log('Student not enrolled in course');
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Create log with appropriate ID field based on tenant
    const idField = req.user.tenant === 'UVU' ? 'uvuId' : 'uofuId';
    const studentId = req.user[idField];

    const log = await Log.create({
      courseId,
      [idField]: studentId,
      text,
      date: new Date(),
      tenant: req.user.tenant
    });

    console.log('Created log:', log);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
});

// Delete log
router.delete('/logs/:id', async (req, res) => {
  try {
    console.log('Deleting log:', req.params.id);

    // Build query based on tenant
    const idField = req.user.tenant === 'UVU' ? 'uvuId' : 'uofuId';
    const studentId = req.user[idField];

    const query = {
      _id: req.params.id,
      [idField]: studentId,
      tenant: req.user.tenant
    };

    console.log('Delete query:', query);
    const log = await Log.findOneAndDelete(query);

    if (!log) {
      console.log('Log not found or unauthorized');
      return res.status(404).json({ message: 'Log not found or unauthorized' });
    }

    console.log('Deleted log:', log);
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Error deleting log' });
  }
});

export default router;