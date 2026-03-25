import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here";

export async function authMiddleware(req, res, next) {
    //grab token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "not authorized or token is missing."
        });
    }
    const token = authHeader.split(" ")[1]; // Remove "Bearer " prefix
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const foundUser = await UserModel.findById(payload.userId).select("-password");
        if (!foundUser) {
            return res.status(401).json({
                success: false,
                message: "user not found."
            });
        }
        req.user = foundUser; // Attach user info to request object
        next(); // Proceed to the next middleware or route handler

    } catch (err) {
        console.error("jwt verification failed:", err);
        return res.status(401).json({
            success: false,
            message: "token is invalid or expired."
        });
    }
}