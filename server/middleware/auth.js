import jwt from 'jsonwebtoken';

// JWT verification middleware
export const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ error: "No access token" })
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" })
        }
        req.user = user.id;
        next()
    })
};


export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
};