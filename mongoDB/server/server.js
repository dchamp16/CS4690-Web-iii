require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 8000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@web3project.ebt9u.mongodb.net/mongodbweb3practicum?retryWrites=true&w=majority&appName=web3project`;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const courseSchema = new mongoose.Schema({
    id: String,
    display: String,
});

const Course = mongoose.model('Course', courseSchema);

app.get('/api/v1/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

app.post('/api/v1/courses', async (req, res) => {
    try {
        const { id, display } = req.body;

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

app.delete('/api/v1/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        console.log(`Deleting course with ID: ${courseId}`); // This should log the courseId

        const deletedCourse = await Course.findOneAndDelete({ id: { $regex: new RegExp(`^${courseId}$`, 'i') } });
        if (!deletedCourse) {
            console.log('Course not found'); // Debug log
            return res.status(404).json({ error: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Error deleting course' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
