require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const articleRoutes = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

const uploadDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    require('fs').mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    // limits: { fileSize: 5 * 1024 * 1024 },
    // fileFilter: function (req, file, cb) {
    //     const filetypes = /jpeg|jpg|png|gif/;
    //     const mimetype = filetypes.test(file.mimetype);
    //     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    //     if (mimetype && extname) {
    //         return cb(null, true);
    //     }
    //     cb(new Error("Allowed file types are jpeg, jpg, png, gif!"));
    // }
});

app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'File not uploaded or invalid file type/size.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Image uploaded successfully!', imageUrl });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);

app.get('/', (req, res) => {
    res.send('API працює!');
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));