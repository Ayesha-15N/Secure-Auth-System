import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const authMiddleware = async(req,res,next)=>{
    const {token} = req.cookies
    if(!token){
       return res.json({success:false,message:'Not authorized Login again'})
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.TOKEN_SECRET);
        if(tokenDecode.id){
            req.userId  = tokenDecode.id
            // req.body.userId  = tokenDecode.id 
        }
       else{
       return res.json({success:false,message:'Not authorized Login again'})
       }
        
        next()
    } catch (error) {
            return    res.json({success:false,message:'error'})
    }


}
export default authMiddleware