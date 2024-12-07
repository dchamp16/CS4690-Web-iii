import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Course } from './models/Course.js';
import { Log } from './models/Log.js';
import { connectDB } from './config/database.js';

const seedData = async () => {
    try {
        await connectDB(); // Properly initialize the database connection

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Log.deleteMany({});

        // Hash passwords
        // const hashedPasswordUVU = await bcrypt.hash('willy', 10);
        // const hashedPasswordUofU = await bcrypt.hash('swoopy', 10);
        // const hashedPasswordOther = await bcrypt.hash('password123', 10);

        // Create users, courses, and logs (same as before)
        const uvuTeacher = await User.create({
            username: 'teacher_uvu',
            password: hashedPasswordOther,
            role: 'teacher',
            tenant: 'UVU',
        });

        const uofuTeacher = await User.create({
            username: 'teacher_uofu',
            password: hashedPasswordOther,
            role: 'teacher',
            tenant: 'UofU',
        });

        const uvuTA = await User.create({
            username: 'ta_uvu',
            password: hashedPasswordOther,
            role: 'TA',
            tenant: 'UVU',
        });

        const uofuTA = await User.create({
            username: 'ta_uofu',
            password: hashedPasswordOther,
            role: 'TA',
            tenant: 'UofU',
        });

        const uvuStudent = await User.create({
            username: 'student_uvu',
            password: hashedPasswordOther,
            role: 'student',
            tenant: 'UVU',
        });

        const uofuStudent = await User.create({
            username: 'student_uofu',
            password: hashedPasswordOther,
            role: 'student',
            tenant: 'UofU',
        });

        const uvuCourse = await Course.create({
            id: 'cs4690',
            display: 'CS 4690',
            tenant: 'UVU',
            teacher: uvuTeacher._id,
            tas: [uvuTA._id],
            students: [uvuStudent._id],
        });

        const uofuCourse = await Course.create({
            id: 'cs4400',
            display: 'CS 4400',
            tenant: 'UofU',
            teacher: uofuTeacher._id,
            tas: [uofuTA._id],
            students: [uofuStudent._id],
        });

        await Log.create([
            {
                courseId: uvuCourse.id,
                uvuId: uvuStudent._id.toString(),
                text: 'First log for UVU student',
                tenant: 'UVU',
            },
            {
                courseId: uofuCourse.id,
                uofuId: uofuStudent._id.toString(),
                text: 'First log for UofU student',
                tenant: 'UofU',
            },
        ]);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();