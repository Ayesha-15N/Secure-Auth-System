import expres from 'express'
import { register,login,logout,verifyOTP,verifyEmail, userAuthenticated ,  resetPasswordOTP, resetPassVerifyOTP ,resetPassword, sendResetOTP, verifyResetOTP, newPassword } from '../controllers/AuthControllers.js';
import authMiddleware from '../middleware/Authmiddle.js'
import googleLogin from '../controllers/googleControllers.js';

// router
const authRouter = expres.Router();
// api end points
authRouter.post( '/register',  register);
authRouter.post('/login', login  );
authRouter.post( '/logout', logout );
authRouter.post( '/send-verify-otp',authMiddleware ,verifyOTP );
authRouter.post( '/verify-account',authMiddleware ,verifyEmail);
authRouter.post( '/user-auth',authMiddleware ,userAuthenticated );
authRouter.post( '/reset-pass-otp',authMiddleware ,resetPasswordOTP );
authRouter.post( '/reset-otp-verify',authMiddleware ,resetPassVerifyOTP);
authRouter.post( '/reset-password',authMiddleware , resetPassword );
authRouter.post( '/google-login', googleLogin);
authRouter.post( '/send-reset-otp', sendResetOTP);
authRouter.post( '/verify-reset-otp', verifyResetOTP);
authRouter.post( '/new-password', newPassword);

export default authRouter
