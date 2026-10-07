const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const auth = req.header('Authorization');

    if (!auth) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = auth.split('')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}