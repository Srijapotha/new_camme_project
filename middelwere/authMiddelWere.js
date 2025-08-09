const jwt = require("jsonwebtoken");



exports.authMiddelWere = async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(400).json({
            message: "Access Denide : No Token Provide "
        })
    }
    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            sucess: false,
            message: "Invalid Token",
        })
    }
}