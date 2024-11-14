const mongoose = require('mongoose');

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;

// MongoDB connection string
const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.ebt9u.mongodb.net/${MONGODB_COLLECTION}?retryWrites=true&w=majority&appName=${MONGODB_CLUSTER}`;



// Same schema as server.js
const logSchema = new mongoose.Schema({ courseId: String, uvuId: String, text: String, date: Date });
const courseSchema = new mongoose.Schema({ id: String, display: String });

const Log = mongoose.model('Log', logSchema);
const Course = mongoose.model('Course', courseSchema);

async function seedData() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Insert courses
        await Course.insertMany([
            { id: 'cs3380', display: 'CS 3380' },
            { id: 'cs4660', display: 'CS 4660' },
            { id: 'cs4690', display: 'CS 4690' },
        ]);

        // Insert logs with Date objects
        await Log.insertMany([
            { courseId: 'cs4660', uvuId: '10111111', date: new Date('2021-01-23T13:23:36'), text: 'Initial comment. Hello World' },
            { courseId: 'cs4660', uvuId: '10111111', date: new Date('2021-01-24T14:43:12'), text: 'MongoDB is looking really good, still need to get atlas up and running.' },
            { courseId: 'cs4660', uvuId: '10222222', date: new Date('2021-01-27T17:58:10'), text: 'Atlas is up and running' },
            { courseId: 'cs3380', uvuId: '10333333', date: new Date('2021-01-28T15:53:52'), text: 'Learned about clusters. Still trying to wrap my mind around the concept.' },
            { courseId: 'cs4660', uvuId: '10222222', date: new Date('2022-01-08T19:41:28'), text: 'Hopefully we get better at testing when we start working on Cypress.' },
            { courseId: 'cs4660', uvuId: '10111111', date: new Date('2022-01-10T19:27:40'), text: 'Initial jQuery practicum works.' }
        ]);

        console.log('Data seeded successfully');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seedData();
