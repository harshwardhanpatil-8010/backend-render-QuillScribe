import express from 'express';
import Post from '../models/Post.js'; 
import authMiddleware from '../middlewares/authMiddleware.js'; 
import Comment from '../models/Comment.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup multer to use Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',   // Optional folder name inside your Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});
const upload = multer({ storage });

// Create Post (with Cloudinary image)
router.post('/create', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const imageUrl = req.file ? req.file.path : null;  // Cloudinary gives file.path

        const newPost = new Post({
            title,
            content,
            imageUrl,
            author: req.userId,
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all posts
router.get('/getAll', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comments = await Comment.find({ postId: req.params.id }).populate('author', 'username');
        res.status(200).json({ post, comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
export default router;
