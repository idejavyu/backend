const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Будь ласка, вкажіть email'], 
        unique: true, 
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Будь ласка, вкажіть коректний email'] 
    },
    password: {
        type: String,
        required: [true, 'Будь ласка, вкажіть пароль'],
        minlength: [6, 'Пароль повинен бути не менше 6 символів'] 
    },
    role: { 
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user' 
    },
    name: { 
        type: String,
        required: false, 
        default: ''
    },
    gender: { 
        type: String,
        enum: ['male', 'female', 'other', 'unknown'], 
        required: false,
        default: 'unknown'
    },
    dateOfBirth: { 
        type: Date,
        required: false,
        default: null
    },
    avatar: { 
        type: String,
        default: './images/default-avatar.png'
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next(); 
    }
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);