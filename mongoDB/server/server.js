require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;

// MongoDB connection string
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.ebt9u.mongodb.net/${MONGODB_COLLECTION}?retryWrites=true&w=majority&appName=${MONGODB_CLUSTER}`;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Schema definitions
const courseSchema = new mongoose.Schema({
    id: String,
    display: String,
});

const logSchema = new mongoose.Schema({
    courseId: String,
    uvuId: String,
    text: String,
    date: Date,
});

// Mongoose models
const Course = mongoose.model('Course', courseSchema);
const Log = mongoose.model('Log', logSchema);

// Get all courses
app.get('/api/v1/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

// Add a new course
app.post('/api/v1/courses', async (req, res) => {
    try {
        const { id, display } = req.body;

        // Validate incoming data
        if (!id || !display) {
            return res.status(400).json({ error: 'Both id and display fields are required' });
        }

        const existingCourse = await Course.findOne({ id });
        if (existingCourse) {
            return res.status(400).json({ error: 'Course ID already exists' });
        }
        const newCourse = new Course({ id, display });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(500).json({ error: 'Error adding course' });
    }
});

// Delete a course and its associated logs
app.delete('/api/v1/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        console.log(`Deleting course with ID: ${courseId}`);

        // Delete all logs associated with the course
        await Log.deleteMany({ courseId });

        // Delete the course itself
        const deletedCourse = await Course.findOneAndDelete({ id: courseId });
        if (!deletedCourse) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json({ message: 'Course and associated logs deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Error deleting course' });
    }
});

// Get all logs (with optional query parameters for courseId and uvuId)
app.get('/api/v1/logs', async (req, res) => {
    try {
        const { courseId, uvuId } = req.query;
        const query = {};

        if (courseId) query.courseId = courseId;
        if (uvuId) query.uvuId = uvuId;

        const logs = await Log.find(query);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching logs' });
    }
});

// Add a new log with validation
app.post('/api/v1/logs', async (req, res) => {
    try {
        const { courseId, uvuId, text, date } = req.body;

        // Validate incoming data
        if (!courseId || !uvuId || !text || !date) {
            return res.status(400).json({ error: 'All log fields are required' });
        }

        const newLog = new Log({ courseId, uvuId, text, date });
        await newLog.save();
        res.status(201).json(newLog);
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).json({ error: 'Error adding log' });
    }
});

// Delete a log by ID
app.delete('/api/v1/logs/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        const deletedLog = await Log.findByIdAndDelete(logId);
        if (!deletedLog) {
            return res.status(404).json({ error: 'Log not found' });
        }
        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Error deleting log' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});