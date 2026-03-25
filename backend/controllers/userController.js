import UserModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";  
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here";
const tokenExpiry = "24h";

const createToken = (userId) => 
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: tokenExpiry });


//register user
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "all fields are required."
         });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "invalid email."
         });
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "password must be at least 8 characters long."
        });
    }
    try {
        if (await UserModel.findOne({ email })) {
            return res.status(409).json({
                success: false,
                message: "email already exists."
            });
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await UserModel.create({ name, email, password: hashed });
        const token = createToken(newUser._id);
        res.status(201).json({
            success: true,
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}

//login user
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "both fields are required."
        });
    }
    try {
        const foundUser = await UserModel.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({
                success: false,
                message: "invalid user or password."
            });
        }
        const Match = await bcrypt.compare(password, foundUser.password);
        if (!Match) {
            return res.status(401).json({
                success: false,
                message: "invalid email or password."
            });
        }
        const token = createToken(foundUser._id);
        res.json({
            success: true,
            token,
            user: { 
                id: foundUser._id, 
                name: foundUser.name, 
                email: foundUser.email 
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}
//get user details
export async function getUserDetails(req, res) {
    try {
        const foundUser = await UserModel.findById(req.user._id).select("name email");
        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: "user not found."
            });
        }
        res.json({
            success: true,
            user: foundUser
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}

// to update user details
export async function updateUserDetails(req, res) {
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "valid name and email are required."
        });
    }
    try {
        const exists = await UserModel.findOne({ email, _id: { $ne: req.user._id } });
        if (exists) {
            return res.status(409).json({
                success: false,
                message: "email already in use."
            });
        }
        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user._id,
            { name, email }, 
            { new: true , runValidators: true, select: "name email" }
        );
        res.json({
            success: true,
            user: updatedUser
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}
// to change user password

export async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "password invalid or too short (min 8 chars)."
        });
    }
    try {
        const foundUser = await UserModel.findById(req.user._id).select("password");
        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: "user not found."
            });
        }
        const Match = await bcrypt.compare(currentPassword, foundUser.password);
        if (!Match) {
            return res.status(401).json({
                success: false,
                message: "current password is incorrect."
            });
        }
        foundUser.password = await bcrypt.hash(newPassword, 10);
        await foundUser.save();
        res.json({
            success: true,
            message: "password changed successfully."
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }

}
