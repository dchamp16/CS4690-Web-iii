import express from 'express';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Log } from '../models/Log.js';
import { verifyRole, verifyTenant } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware
router.use(verifyRole(['TA']));
router.use(verifyTenant);

// Get TA's assigned courses
router.get('/courses', async (req, res) => {
  try {
    console.log('Fetching courses for TA:', req.user.id);

    const courses = await Course.find({
      tas: req.user.id,
      tenant: req.user.tenant
    })
        .populate('teacher', 'username')
        .populate('students', 'username');

    console.log('Found courses:', courses.length);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching TA courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Get logs for TA's courses
router.get('/logs', async (req, res) => {
  try {
    // First get all courses where this TA is assigned
    const courses = await Course.find({
      tas: req.user.id,
      tenant: req.user.tenant
    });

    const courseIds = courses.map(course => course.id);
    console.log('Fetching logs for courses:', courseIds);

    // Then get all logs for these courses
    const logs = await Log.find({
      courseId: { $in: courseIds },
      tenant: req.user.tenant
    }).sort('-date');

    console.log('Found logs:', logs.length);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching TA logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Get logs for a specific course
router.get('/logs/:courseId', async (req, res) => {
  try {
    // Verify TA is assigned to this course
    const course = await Course.findOne({
      id: req.params.courseId,
      tas: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(403).json({ message: 'Not authorized to view logs for this course' });
    }

    const logs = await Log.find({
      courseId: req.params.courseId,
      tenant: req.user.tenant
    }).sort('-date');

    res.json(logs);
  } catch (error) {
    console.error('Error fetching course logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Add student to course
router.post('/courses/:courseId/students', async (req, res) => {
  try {
    const { username } = req.body;
    const course = await Course.findOne({
      _id: req.params.courseId,
      tas: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    const student = await User.findOne({
      username,
      role: 'student',
      tenant: req.user.tenant
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!course.students.includes(student._id)) {
      course.students.push(student._id);
      await course.save();
    }

    res.json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Error adding student' });
  }
});

// Remove student from course
router.delete('/courses/:courseId/students/:studentId', async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      tas: req.user.id,
      tenant: req.user.tenant
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or not authorized' });
    }

    course.students = course.students.filter(
        student => student.toString() !== req.params.studentId
    );
    await course.save();

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Error removing student' });
  }
});

export default router;