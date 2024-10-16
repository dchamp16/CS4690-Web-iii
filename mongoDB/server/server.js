require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@web3project.ebt9u.mongodb.net/?retryWrites=true&w=majority&appName=web3project`

console.log(MONGODB_URI);

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

const logSchema = new mongoose.Schema({})