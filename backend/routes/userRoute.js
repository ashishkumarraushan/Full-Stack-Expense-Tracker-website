import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserDetails, 
  updateUserDetails, 
  changePassword 
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const userRouter = express.Router();

// public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// protected routes
userRouter.get("/me", authMiddleware, getUserDetails);
userRouter.put("/profile", authMiddleware, updateUserDetails);
userRouter.put("/password", authMiddleware, changePassword);

export default userRouter;