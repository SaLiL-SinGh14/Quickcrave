import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config.js'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"


//app config
const app = express()
const port=process.env.PORT 4000

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use("/images",express.static("uploads")); 
//const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173"
app.use(cors({ origin: "*"}));
// app.use(cors({
//     origin: ["http://localhost:5173", "http://localhost:5174"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }));
  


// db connection
connectDB();

//api endpoints
app.use("/api/food",foodRouter);
app.use("/api/user",userRouter);
app.use("/api/cart",cartRouter);
app.use("/api/order",orderRouter);




app.get("/",(req,res)=>{
    res.send("API Working")
})

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
