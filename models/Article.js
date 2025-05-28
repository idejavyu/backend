const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Будь ласка, вкажіть назву статті'],
        trim: true, 
        minlength: [3, 'Назва статті повинна бути не менше 3 символів']
    },
    shortDescription: { 
        type: String,
        required: [true, 'Будь ласка, вкажіть короткий опис'],
        maxlength: [200, 'Короткий опис не повинен перевищувати 200 символів']
    },
    fullContent: {
        type: String,
        required: [true, 'Будь ласка, вкажіть повний зміст статті'],
        minlength: [10, 'Повний зміст повинен бути не менше 10 символів']
    },
    imageUrl: { 
        type: String,
        default: '/images/default-article.png'
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    authorEmail: { 
        type: String,
        required: true
    },
    views: { 
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

articleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Article', articleSchema);