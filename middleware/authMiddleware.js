const jwt=require('jsonwebtoken')
const HttpError=require("../models/errorModel")


const authMiddleware=async (req,res,next) => {
    const Authorization =req.headers.Authorization ||req.headers.authorization;
    if(Authorization && Authorization.startsWith ("Bearer")){
        const token =Authorization.split(' ')[1]

        jwt.verify(token,process.env.JWT_SECRET,(err,info)=>{
            if(err){
                return res.status(403).json({message:"Unauthorized Invalid token"})
            }
            req.user=info;
            next()
        })
    }else{
        return res.status(403).json({message:"Unauthorized Invalid token"})
        
    }
}

module.exports= authMiddleware;