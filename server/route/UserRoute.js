import express from 'express'
import getUserData from '../controllers/UserControllers.js'
import authMiddleware from '../middleware/Authmiddle.js'
const userRouter = express.Router();
userRouter.get("/getData",authMiddleware,getUserData);
export default userRouter