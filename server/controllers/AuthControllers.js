import userModel from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();
// register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Trim values
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();
  // to get all error if all input is empty
  const errors = {}
  if(!trimmedName){
    errors.name = "Name can't be empty"
  }

  if(!trimmedEmail){
    errors.email = "Email can't be empty"
  }

  if(!trimmedPassword){
    errors.password = "Password can't be empty"
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
    errors.email = "Invalid Email"
  }

  if (trimmedPassword && trimmedPassword.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if(Object.keys(errors).length>0){
    return res.json({success:false, errors:errors})
  }
  try {
    // Check duplicate email
    const existingUser = await userModel.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.json({ success: false , errors:{email:"Email already exists"} });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
    const user = new userModel({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });
    // cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email safely
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: trimmedEmail,
      subject: "Welcome to Ayesha's Work Space",
      text: `Welcome to Ayesha's Work Space website. Your account has been created with email id: ${trimmedEmail}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch {
      // Do not throw — registration already succeeded
    }
    res.json({ success: true, message: "User registered successfully" , user:{name: user.name, email: user.email, isAccountVerified: user.isAccountVerified} });
  } catch (error) {
    res.json({ success: false, message: "Error registering user" });
  }
};

// login
const login = async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();
  const errors = {}
  if(!trimmedEmail){
    errors.email = "Email can't be empty"

  }
  if(!trimmedPassword){
    errors.password = "Password can't be empty"

  }
 if(Object.keys(errors).length>0) {
    return res.json({message:false,errors:errors})
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, errors:{email:"Invalid Email"}});
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.json({ success: false, errors:{password:"Invalid password"} });
    }
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "successfully Login", user:{name: user.name, email: user.email, isAccountVerified: user.isAccountVerified} });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};
// logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "successfully Logged out" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};
// create otp for account verify
const verifyOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOTP = otp;
    user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP IS ${otp}. Verify your account using this otp`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error" });
  }
};
// account verify
const verifyEmail = async (req, res) => {
  const userId = req.userId;
  const { otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not found" });
    }
    if (user.verifyOTP === "" || user.verifyOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOTPExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    ((user.isAccountVerified = true),
      (user.verifyOTP = ""),
      (user.verifyOTPExpireAt = 0));
    await user.save();
    return res.json({ success: true, message: "Email verify successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error" });
  }
};
// user authentication
const userAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "error" });
  }
};
// forget password otp generate
const resetPasswordOTP = async (req, res) => {
  const email = req.body;
  const userId = req.userId;
  const userEmail = await userModel.findOne(email);
  const user = await userModel.findById(userId);
  if (!email || !userId) {
    return res.json({ success: false, message: "Missing details" });
  }
  if (!userEmail || !user) {
    return res.json({ success: false, message: "User Does not exist" });
  }
  try {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP IS ${otp}. Rest your password using this otp`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Sent OTP Successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error" });
  }
};
// forget Password Reset
const resetPassVerifyOTP = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;
  if (!otp || !userId) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }
    if (user.resetOTP === "" || user.resetOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOTPExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    return res.json({
      success: true,
      message: "OTP for reset password is verified",
    });
  } catch (error) {
    return res.json({ success: false, message: "Error" });
  }
};
// reset password
const resetPassword = async (req, res) => {
  if (!req.body || !req.body.password) {
    return res.json({ success: false, message: "Enter password" });
  }
  const { password } = req.body;
  const changePassTrimm = password.trim();
  if (!changePassTrimm) {
    return res.json({
      success: false,
      message: "Enter password",
    });
  }
  if (changePassTrimm.length < 6) {
    return res.json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }
  try {
    const changePassHashed = await bcrypt.hash(changePassTrimm, 10);
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    ((user.password = changePassHashed),
      (user.resetOTP = ""),
      (user.resetOTPExpireAt = 0));
      await user.save();
    return res.json({ success: true, message: "Change Password Successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error" });
  }
};
// forgot password — send OTP (no auth required)
const sendResetOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Email is required" });
  try {
    const user = await userModel.findOne({ email: email.trim() });
    if (!user) return res.json({ success: false, message: "User not found" });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. Reset your password using this OTP. Valid for 15 minutes.`,
    });
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: "Error sending OTP" });
  }
};

// forgot password — verify OTP (no auth required)
const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.json({ success: false, message: "Email and OTP are required" });
  try {
    const user = await userModel.findOne({ email: email.trim() });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (!user.resetOTP || user.resetOTP !== otp)
      return res.json({ success: false, message: "Invalid OTP" });
    if (user.resetOTPExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired" });
    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.json({ success: false, message: "Error verifying OTP" });
  }
};

// forgot password — set new password (no auth required)
const newPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password)
    return res.json({ success: false, message: "All fields are required" });
  const trimmedPass = password.trim();
  if (trimmedPass.length < 6)
    return res.json({ success: false, message: "Password must be at least 6 characters" });
  try {
    const user = await userModel.findOne({ email: email.trim() });
    if (!user) return res.json({ success: false, message: "User not found" });
    if (!user.resetOTP || user.resetOTP !== otp)
      return res.json({ success: false, message: "Invalid OTP" });
    if (user.resetOTPExpireAt < Date.now())
      return res.json({ success: false, message: "OTP expired" });
    user.password = await bcrypt.hash(trimmedPass, 10);
    user.resetOTP = "";
    user.resetOTPExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error resetting password" });
  }
};

export {
  register,
  login,
  logout,
  verifyOTP,
  verifyEmail,
  userAuthenticated,
  resetPasswordOTP,
  resetPassVerifyOTP,
  resetPassword,
  sendResetOTP,
  verifyResetOTP,
  newPassword,
};
