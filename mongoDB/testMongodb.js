require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@web3project.ebt9u.mongodb.net/mongodbweb3practicum?retryWrites=true&w=majority`;

console.log(MONGODB_URI);

mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB Connected!')).catch(err => console.log(err));