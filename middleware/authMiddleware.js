const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('Недійсний токен:', error.message);
            res.status(401).json({ message: 'Не авторизовано, токен недійсний' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Не авторизовано, токен відсутній' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Не авторизовано, користувач не знайдений' });
        }
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ заборонено, недостатньо прав' });
        }
        next();
    };
};


module.exports = { protect, authorize  };