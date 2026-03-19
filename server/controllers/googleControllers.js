import userModel from "../model/UserModel.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.json({ success: false, message: "Missing Google token" });
  }

  try {
    // Verify access token and get user info from Google
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data.email_verified) {
      return res.json({ success: false, message: "Google email is not verified" });
    }

    const { email, name } = data;

    let user = await userModel.findOne({ email });
    if (!user) {
      user = new userModel({
        name,
        email,
        password: "",
        isAccountVerified: true,
      });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Google login successful",
      user: { name: user.name, email: user.email, isAccountVerified: user.isAccountVerified },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error?.response?.data?.error_description || "Google login failed",
    });
  }
};

export default googleLogin;
