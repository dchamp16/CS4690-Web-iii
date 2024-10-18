require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const PORT = 8000
const app = express();


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@web3project.ebt9u.mongodb.net/mongodbweb3practicum?retryWrites=true&w=majority&appName=web3project`;

console.log(MONGODB_URI)

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
    res.send('Server Running')
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

// Add a new log
app.post('/api/v1/logs', async (req, res) => {
    try {
        const newLog = new Log(req.body);
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


app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT} \n http://localhost:${PORT}/`)
})