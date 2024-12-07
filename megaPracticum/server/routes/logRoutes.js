import express from 'express';
import { Log } from '../models/Log.js';
import { Course } from '../models/Course.js';
import { verifyRole, verifyTenant } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware
router.use(verifyTenant);

// Get logs by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    // Verify user has access to the course
    const course = await Course.findOne({
      id: req.params.courseId,
      tenant: req.user.tenant,
      $or: [
        { teacher: req.user.id },
        { tas: req.user.id },
        { students: req.user.id }
      ]
    });

    if (!course) {
      return res.status(403).json({ message: 'Access denied to course logs' });
    }

    const logs = await Log.find({
      courseId: req.params.courseId,
      tenant: req.user.tenant
    }).sort('-date');

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Delete log (only for teachers and admins)
router.delete('/:id', verifyRole(['admin', 'teacher']), async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({
      _id: req.params.id,
      tenant: req.user.tenant
    });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Error deleting log' });
  }
});

export default router;