require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/contact');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const path = require('path');

const app = express();
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error);
    });

app.use(express.json());
app.use(cors());

// Serve portfolio files
app.use(express.static(__dirname));

// Open portfolio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'portfolio.html'));
});

// Rate limiter
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many messages sent. Please try again later.'
    }
});

// Contact form
app.post(
    '/api/contact',
    contactLimiter,

    [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required'),

        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email'),

        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
    ],

    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;

       try {

    const newContact = new Contact({
        name: name,
        email: email,
        message: message
    });

    await newContact.save();

    res.status(200).json({
        success: true,
        message: 'Message saved successfully!'
    });

} catch (error) {

    console.error(error);

    res.status(500).json({
        error: 'Server error. Failed to save message.'
    });
}
        }
    
);

// Export for Vercel serverless functions
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}