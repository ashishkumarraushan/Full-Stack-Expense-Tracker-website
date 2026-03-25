import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://ashishpratapsingh404_db_user:fgCo2WBvEG4ywD5Q@cluster0.upncx3i.mongodb.net/Expense");
        console.log("DB CONNECTED");
    } catch (err) {
        console.error("DB CONNECTION ERROR:", err.message);
    }
}