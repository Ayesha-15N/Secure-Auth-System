import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../components/Context";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import "./Login/Login.css";
import "./EmailVerify.css";

const EmailVerify = () => {
  const { url, user, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.isAccountVerified) {
      navigate("/home");
      return;
    }
    sendOtp();
  }, []);

  const sendOtp = async () => {
    setSending(true);
    try {
      const res = await axios.post(url + "/api/auth/send-verify-otp");
      if (res.data.success) {
        toast.success("Verification code sent to your email!");
        setSent(true);
      } else {
        toast.error(res.data.message || "Failed to send code");
      }
    } catch {
      toast.error("Failed to send verification code. Try again.");
    }
    setSending(false);
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    const newOtp = new Array(6).fill("");
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(url + "/api/auth/verify-account", { otp: code });
      if (res.data.success) {
        toast.success("Email verified successfully!");
        setUser((prev) => ({ ...prev, isAccountVerified: true }));
        navigate("/home");
      } else {
        toast.error(res.data.message || "Invalid code. Try again.");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login">
      <form
        onSubmit={handleVerify}
        autoComplete="off"
        className="login-signup-form flex justify-center flex-col text-center py-12 px-12 rounded-2xl"
      >
        <div className="verify-mail-icon">
          <img src={assets.mail_icon} alt="email" />
        </div>

        <h3>Verify Your Email</h3>
        <p className="mb-6">
          {sending
            ? "Sending verification code..."
            : sent
            ? `Enter the 6-digit code sent to ${user?.email || "your email"}`
            : "Ready to verify"}
        </p>

        {/* OTP boxes */}
        <div className="otp-boxes" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="otp-box"
              placeholder="·"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || sending}
          className="w-full py-[13px] border-none outline-none rounded-[50px] text-white cursor-pointer mb-[18px] font-semibold"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="sign-btn flex items-center justify-center gap-2">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending}
            className="switch-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {sending ? "Sending..." : "Resend"}
          </button>
        </div>

        <div className="mt-4">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/home"); }}
            className="forgot-link flex items-center justify-center"
          >
            <span>← Back to Home</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default EmailVerify;
