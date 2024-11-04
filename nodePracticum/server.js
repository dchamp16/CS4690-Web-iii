// Import necessary modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create an instance of express
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load data from db.json
const dbPath = path.resolve(__dirname, 'db.json');
let db = (() => {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (error) {
        console.error('Error loading database:', error);
        return { logs: [], courses: [] };
    }
})();

// Helper function to write data back to db.json
const writeToDB = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing to database:', error);
    }
};

// GET endpoint for logs
app.get('/logs', (req, res) => {
    const { courseId, uvuId } = req.query;
    if (!courseId || !uvuId) return res.status(400).json({ error: 'Both courseId and uvuId are required' });

    const logs = db.logs.filter((log) => log.courseId === courseId && log.uvuId === uvuId);
    return logs.length ? res.json(logs) : res.status(404).json({ message: 'No logs found' });
});

// GET endpoint for courses
app.get('/courses', (req, res) => res.json(db.courses.length ? db.courses : { message: 'No courses found' }));

// POST endpoint for new log
app.post('/logs', (req, res) => {
    const { courseId, uvuId, text } = req.body;
    if (!courseId || !uvuId || !text) return res.status(400).json({ error: 'courseId, uvuId, and text are required' });

    const newLog = { courseId, uvuId, text, date: new Date().toISOString(), id: uuidv4() };
    db.logs.push(newLog);
    writeToDB(db);

    res.status(201).json(newLog);
});

// Error handling middleware
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
