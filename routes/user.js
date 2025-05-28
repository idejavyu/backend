const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.get('/profile', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt,
        avatar: req.user.avatar,
        dateOfBirth: req.user.dateOfBirth,
        gender: req.user.gender,
        role: req.user.role,
        name: req.user.name,
    });
});

router.put('/profile', protect, async (req, res) => {
    const { name, gender, dateOfBirth, avatar } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.gender = gender || user.gender;
            user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
            user.avatar = avatar || user.avatar;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                gender: updatedUser.gender,
                dateOfBirth: updatedUser.dateOfBirth,
                avatar: updatedUser.avatar,
                role: updatedUser.role, 
                token: generateToken(updatedUser._id), 
            });
        } else {
            res.status(404).json({ message: 'Користувача не знайдено' });
        }
    } catch (error) {
        console.error('Помилка оновлення профілю:', error.message);
        res.status(500).json({ message: 'Помилка сервера при оновленні профілю' });
    }
});


module.exports = router;