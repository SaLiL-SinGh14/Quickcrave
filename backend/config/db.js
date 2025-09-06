import mongoose, { mongo } from "mongoose"

export const connectDB = async ()=>{
    await mongoose.connect('mongodb+srv://salilsingh02:Salil14@cluster0.qpufrnf.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}