import jwt from "jsonwebtoken"

const authMiddleware = async(req,res,next)=>{
    const {token} = req.headers;
    if(!token){ return res.json({success:false,message:"Not Authorised, Login Again"}); }

    try {
        const decoded= jwt.verify(token,process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // ✅ userId now available in req.user
        next();
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

export default authMiddleware;
