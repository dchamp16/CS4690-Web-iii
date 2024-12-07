import express from 'express';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Log } from '../models/Log.js';
import { verifyRole, verifyTenant } from '../middleware/auth.js';

const router = express.Router();

// Middleware to verify teacher role and tenant
router.use(verifyRole(['teacher']));
router.use(verifyTenant);

// Get teacher's courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({
      teacher: req.user.id,
      tenant: req.user.tenant
    })
        .populate('tas', 'username')
        .populate('students', 'username');

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Get all logs for teacher's courses
router.get('/logs', async (req, res) => {
  try {
    // First get all courses taught by this teacher
    const courses = await Course.find({
      teacher: req.user.id,
      tenant: req.user.tenant
    });

    const courseIds = courses.map(course => course.id);

    // Then get all logs for these courses
    const logs = await Log.find({
      courseId: { $in: courseIds },
      tenant: req.user.tenant
    }).sort('-date');

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Add TA to course
router.post('/courses/:courseId/tas', async (req, res) => {
  try {
    const { username } = req.body;
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const ta = await User.findOne({
      username,
      role: 'TA',
      tenant: req.user.tenant
    });

    if (!ta) {
      return res.status(404).json({ message: 'TA not found' });
    }

    if (!course.tas.includes(ta._id)) {
      course.tas.push(ta._id);
      await course.save();
    }

    res.json({ message: 'TA added successfully' });
  } catch (error) {
    console.error('Error adding TA:', error);
    res.status(500).json({ message: 'Error adding TA' });
  }
});

// Remove TA from course
router.delete('/courses/:courseId/tas/:taId', async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      teacher: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.tas = course.tas.filter(ta => ta.toString() !== req.params.taId);
    await course.save();

    res.json({ message: 'TA removed successfully' });
  } catch (error) {
    console.error('Error removing TA:', error);
    res.status(500).json({ message: 'Error removing TA' });
  }
});

// Create new course
router.post('/courses', async (req, res) => {
  try {
    const { id, display } = req.body;

    // Check if course ID already exists for this tenant
    const existingCourse = await Course.findOne({
      id,
      tenant: req.user.tenant
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course ID already exists' });
    }

    const course = await Course.create({
      id,
      display,
      tenant: req.user.tenant,
      teacher: req.user.id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

export default router;