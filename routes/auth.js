const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 
const ErrorResponse = require('../utils/ErrorResponse');

const generateToken = (id, role) => { 
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { 
        expiresIn: '1h',
    });
};

router.post('/register', async (req, res) => {
    const { email, password } = req.body; 

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Користувач з таким email вже зареєстрований' });
        }

        const user = await User.create({
            email,
            password, 
        });

        if (user) {
            res.status(201).json({ 
                _id: user._id,
                email: user.email,
                token: generateToken(user._id), 
            });
        } else {
            res.status(400).json({ message: 'Невірні дані користувача' });
        }
    } catch (error) {
        console.error('Помилка реєстрації:', error.message);
        res.status(500).json({ message: 'Помилка сервера при реєстрації' });
    }
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Будь ласка, вкажіть email та пароль', 400));
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Невірні облікові дані', 401));
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Невірні облікові дані', 401));
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                avatar: user.avatar
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;