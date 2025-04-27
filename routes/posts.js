import express from 'express';
import Post from '../models/Post.js'; 
import Comment from '../models/Comment.js';
import authMiddleware from '../middlewares/authMiddleware.js'; 
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});
const upload = multer({ storage });
router.post('/create', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const imageUrl = req.file ? req.file.path : null; 

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


router.get('/getAll', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


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


router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const { title, content } = req.body;
        post.title = title || post.title;
        post.content = content || post.content;
        await post.save();

        res.json({ message: "Post updated", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.put('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.likes.includes(req.userId)) {
            post.likes.pull(req.userId);
        } else {
            post.likes.push(req.userId);
        }
        await post.save();
        res.json({ message: "Post liked/unliked", likes: post.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


router.post('/:id/comment', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            postId: req.params.id,
            author: req.userId,
            text
        });
        await comment.save();

        res.status(201).json({ message: "Comment added", comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
