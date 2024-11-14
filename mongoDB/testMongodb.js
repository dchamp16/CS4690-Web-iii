require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.ebt9u.mongodb.net/${MONGODB_COLLECTION}?retryWrites=true&w=majority&appName=${MONGODB_CLUSTER}`;

console.log(MONGODB_URI);

mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB Connected!')).catch(err => console.log(err));