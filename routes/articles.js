
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Article = require('../models/Article');

router.post('/', protect, async (req, res) => {
    const { title, shortDescription, fullContent, imageUrl } = req.body;
    const author = req.user._id; 
    const authorEmail = req.user.email;

    try {
        const article = await Article.create({
            title,
            shortDescription,
            fullContent,
            imageUrl,
            author,
            authorEmail
        });
        res.status(201).json(article); 
    } catch (error) {
        console.error('Помилка при створенні статті:', error.message);
        res.status(400).json({ message: 'Не вдалося створити статтю', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const articles = await Article.find().sort({ createdAt: -1 }); 
        res.json(articles);
    } catch (error) {
        console.error('Помилка при отриманні статей:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.get('/popular', async (req, res) => {
    try {
        const popularArticles = await Article.find().sort({ views: -1, createdAt: -1 }).limit(10);
        res.json(popularArticles);
    } catch (error) {
        console.error('Помилка при отриманні популярних статей:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.get('/recent', async (req, res) => {
    try {
        const recentArticles = await Article.find().sort({ createdAt: -1 }).limit(10);
        res.json(recentArticles);
    } catch (error) {
        console.error('Помилка при отриманні останніх статей:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            article.views += 1;
            await article.save();
            res.json(article);
        } else {
            res.status(404).json({ message: 'Статтю не знайдено' });
        }
    } catch (error) {
        console.error('Помилка при отриманні статті за ID:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.put('/:id', protect, async (req, res) => {
    const { title, shortDescription, fullContent } = req.body;

    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Доступ заборонено, ви не є автором цієї статті або адміністратором' });
            }

            article.title = title || article.title;
            article.shortDescription = shortDescription || article.shortDescription;
            article.fullContent = fullContent || article.fullContent;
            article.updatedAt = Date.now(); 

            const updatedArticle = await article.save();
            res.json(updatedArticle);
        } else {
            res.status(404).json({ message: 'Статтю не знайдено' });
        }
    } catch (error) {
        console.error('Помилка при оновленні статті:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Доступ заборонено, ви не є автором цієї статті або адміністратором' });
            }

            await Article.deleteOne({ _id: req.params.id });
            res.json({ message: 'Статтю успішно видалено' });
        } else {
            res.status(404).json({ message: 'Статтю не знайдено' });
        }
    } catch (error) {
        console.error('Помилка при видаленні статті:', error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;