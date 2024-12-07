import express from 'express';
import { Course } from '../models/Course.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all available courses for tenant
router.get('/', verifyToken, async (req, res) => {
  try {
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

// Get course by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      tenant: req.user.tenant
    })
        .populate('teacher', 'username')
        .populate('tas', 'username')
        .populate('students', 'username');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
});

export default router;