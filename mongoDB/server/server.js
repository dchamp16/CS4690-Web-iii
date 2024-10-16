require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const PORT = 3000

const app = express();

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@web3project.ebt9u.mongodb.net/?retryWrites=true&w=majority&appName=web3project`

const connectDB = async ()=> {
    try{
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");
    }catch(err){
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}
connectDB();

const logSchema = new mongoose.Schema({
    courseId: String,
    uvuId: String,
    text: String,
    date: Date
})

const courseSchema = new mongoose.Schema({
    id: String,
    display: String
})

const Log = mongoose.model('logs', logSchema);
const Course = mongoose.model('courses', courseSchema);

app.get('/', (req, res) => {
    res.send('hello world')
})

// Get all courses
app.get('/api/v1/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching courses' });
    }
});
// Get all logs
app.get('/api/v1/logs', async (req, res) => {
    try{
        const logs = await Log.find({});
        res.json(logs);
    }catch(error){
        res.status(500).json({ error: 'Error fetching logs' });
    }
})

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT} \n http://localhost:${PORT}/`)
})