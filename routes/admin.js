const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User'); 
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Помилка при отриманні користувачів (адмін-панель):', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
    const userId = req.params.id;
    const { newRole } = req.body;

    if (!['user', 'admin', 'moderator'].includes(newRole)) {
        return res.status(400).json({ message: 'Недійсна роль' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        user.role = newRole;
        await user.save();

        res.json({ message: `Роль користувача ${user.email} змінено на ${newRole}` });
    } catch (error) {
        console.error('Помилка при зміні ролі користувача:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});


module.exports = router;