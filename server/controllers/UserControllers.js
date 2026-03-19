import userModel from "../model/UserModel.js"

const getUserData = async(req,res)=>{
    const userId = req.userId
    const user = await userModel.findById(userId);
    if(!user){
        return res.json({success:false, message:"User not found"})
    }
    try {
        res.json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isAccountVerified

            }
        })

        
    } catch (error) {
            return res.json({success:false, message:"Error"})
    }

}
export default getUserData