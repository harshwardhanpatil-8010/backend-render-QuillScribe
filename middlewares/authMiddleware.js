import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        req.userId = decoded.id; // ✅ directly set userId
        
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token is invalid' });
    }
};

export default authMiddleware;