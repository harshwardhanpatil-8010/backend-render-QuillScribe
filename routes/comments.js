import express from 'express';
import Comment from '../models/Comment.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
    const { postId, content } = req.body;
    try {
        const comment = new Comment({ post: postId, user: req.user.id, content });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;