import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    description : {
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  },
  category: {
    type: String,
    required : true,
  },
  date: {
    type: Date,
    required : true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },// for particular user
  type: {
    type: String,
    default: "income",  
  }
}, { 
  timestamps: true
});
export default mongoose.model("income", incomeSchema);