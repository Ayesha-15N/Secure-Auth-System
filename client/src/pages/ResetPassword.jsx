import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../components/Context";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import "./Login/Login.css";

const ResetPassword = () => {
  const { url } = useContext(Context);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email  2: otp  3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(url + "/api/auth/send-reset-otp", { email });
      if (res.data.success) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(url + "/api/auth/verify-reset-otp", { email, otp });
      if (res.data.success) {
        setStep(3);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(url + "/api/auth/new-password", { email, otp, password });
      if (res.data.success) {
        toast.success("Password reset successfully!");
        navigate("/");
      } else {
        setError(res.data.message);
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const handleSubmit = step === 1 ? sendOTP : step === 2 ? verifyOTP : resetPassword;

  return (
    <div className="login">
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="login-signup-form flex justify-center flex-col text-center py-12 px-12 rounded-2xl"
      >
        {/* Step indicator */}
        <div className="step-dots">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`step-dot ${s === step ? "active" : s < step ? "done" : ""}`}
            />
          ))}
        </div>

        <h3>
          {step === 1 && "Forgot Password"}
          {step === 2 && "Enter OTP"}
          {step === 3 && "New Password"}
        </h3>
        <p className="mb-6">
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && `OTP sent to ${email}`}
          {step === 3 && "Set your new password"}
        </p>

        {/* Step 1 — Email */}
        {step === 1 && (
          <div className="input-wrap mb-[14px] text-left">
            <div className="input-field flex items-center gap-2 mb-[6px] w-full py-[11px] px-6 rounded-[50px]">
              <label>
                <img className="w-[15px] h-[15px] object-contain" src={assets.mail_icon} alt="" />
              </label>
              <input
                className="w-full border-none outline-none px-[5px] bg-transparent"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Email address"
                required
              />
            </div>
          </div>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <div className="input-wrap mb-[14px] text-left">
            <div className="input-field flex items-center gap-2 mb-[6px] w-full py-[11px] px-6 rounded-[50px]">
              <input
                className="w-full border-none outline-none px-[5px] bg-transparent text-center tracking-[0.3em]"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(""); }}
                placeholder="6-digit OTP"
                maxLength={6}
                required
              />
            </div>
          </div>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <div className="input-wrap mb-[14px] text-left">
            <div className="input-field flex items-center gap-2 mb-[6px] w-full py-[11px] px-6 rounded-[50px]">
              <label>
                <img className="w-[15px] h-[15px] object-contain" src={assets.lock_icon} alt="" />
              </label>
              <input
                className="w-full border-none outline-none px-[5px] bg-transparent"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="New password (min 6 chars)"
                minLength={6}
                required
              />
            </div>
          </div>
        )}

        {error && <p className="error-msg pl-5 mb-3 text-left">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-[13px] border-none outline-none rounded-[50px] text-white cursor-pointer mb-[18px] font-semibold mt-[8px]"
        >
          {loading
            ? "Please wait..."
            : step === 1
            ? "Send OTP"
            : step === 2
            ? "Verify OTP"
            : "Reset Password"}
        </button>

        {/* Back / change links */}
        <div className="sign-btn flex items-center justify-center gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
              className="forgot-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <span>Change email</span>
            </button>
          )}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="switch-link"
          >
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
