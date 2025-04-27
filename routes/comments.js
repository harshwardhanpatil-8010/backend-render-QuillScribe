import express from 'express';
import Comment from '../models/Comment.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { postId, text } = req.body;
        const newComment = new Comment({
            postId,
            author: req.user.userId,
            text,
        });
        await newComment.save();
        res.status(201).json({ message: 'Comment added', comment: newComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
