import React, { useContext, useState } from "react";
import "./Login.css";
import { assets } from "../../assets/assets";
import { Context } from "../../components/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";

const getStrength = (pass) => {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};

const strengthConfig = [
  { label: "",        color: "",          width: "0%"   },
  { label: "Weak",   color: "#ff6b6b",   width: "25%"  },
  { label: "Fair",   color: "#ffa94d",   width: "50%"  },
  { label: "Good",   color: "#ffd43b",   width: "75%"  },
  { label: "Strong", color: "#51cf66",   width: "100%" },
];

const Login = () => {
  const { url, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState("Sign Up");
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = getStrength(data.password);
  const strengthInfo = strengthConfig[strength];

  const hints = [
    { label: "8+ characters", met: data.password.length >= 8 },
    { label: "Uppercase",     met: /[A-Z]/.test(data.password) },
    { label: "Number",        met: /[0-9]/.test(data.password) },
    { label: "Symbol",        met: /[^A-Za-z0-9]/.test(data.password) },
  ];

  const loginResponse = async (e) => {
    e.preventDefault();

    const errors = {};
    if (currentState === "Sign Up" && !data.name.trim()) {
      errors.name = "Name can't be empty";
    }
    if (!data.email.trim()) {
      errors.email = "Email can't be empty";
    }
    if (!data.password.trim()) {
      errors.password = "Password can't be empty";
    }
    if (Object.keys(errors).length > 0) {
      setError(errors);
      toast.error("Please fill in all fields");
      return;
    }

    if (currentState === "Sign Up" && strength < 3) {
      setError((prev) => ({
        ...prev,
        password: "Password too weak — meet at least 3 of the 4 requirements.",
      }));
      toast.error("Password is too weak");
      return;
    }

    setLoading(true);
    try {
      const endPoint = currentState === "Sign Up" ? "register" : "login";
      const response = await axios.post(url + `/api/auth/${endPoint}`, data);
      if (response.data.success) {
        setUser(response.data.user);
        setData({ name: "", email: "", password: "" });
        toast.success(
          currentState === "Sign Up"
            ? `Welcome, ${response.data.user.name}! Account created.`
            : `Welcome back, ${response.data.user.name}!`
        );
        navigate("/home");
      } else {
        setError(response.data.errors || {});
        const msg = response.data.errors
          ? Object.values(response.data.errors)[0]
          : "Something went wrong";
        toast.error(msg);
      }
    } catch {
      toast.error("Server error. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await axios.post(url + "/api/auth/google-login", {
        token: tokenResponse.access_token,
      });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success(`Welcome, ${res.data.user.name}!`);
        navigate("/home");
      } else {
        toast.error(res.data.message || "Google login failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Google login failed. Try again.");
    }
    setGoogleLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google login failed. Try again."),
  });

  const onHandleData = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const switchState = () => {
    setCurrentState((s) => (s === "Sign Up" ? "Login" : "Sign Up"));
    setData({ name: "", email: "", password: "" });
    setError({ name: "", email: "", password: "" });
  };

  return (
    <div className="login">
      <form
        onSubmit={loginResponse}
        autoComplete="off"
        className="login-signup-form flex justify-center flex-col text-center py-12 px-12 rounded-2xl"
      >
        <input type="text" name="fakeuser" autoComplete="username" style={{ display: "none" }} />
        <input type="password" name="fakepass" autoComplete="new-password" style={{ display: "none" }} />

        <h3>{currentState === "Sign Up" ? "Create Account" : "Welcome Back"}</h3>
        <p className="mb-6">
          {currentState === "Sign Up" ? "Sign up to get started" : "Login to your account"}
        </p>

        {/* Google button */}
        <button
          type="button"
          className="google-btn"
          onClick={() => googleLogin()}
          disabled={googleLoading || loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Name — Sign Up only */}
        {currentState === "Sign Up" && (
          <div className="input-wrap mb-[14px] text-left">
            <div className="input-field flex items-center mb-[6px] gap-2 w-full py-[11px] px-6 rounded-[50px]">
              <label htmlFor="name">
                <img className="w-[15px] h-[15px] object-contain" src={assets.person_icon} />
              </label>
              <input
                autoComplete="new-name"
                className="w-full border-none outline-none px-[5px] bg-transparent"
                type="text"
                name="name"
                id="name"
                value={data.name}
                onChange={onHandleData}
                placeholder="Full Name"
              />
            </div>
            {error?.name && <p className="error-msg pl-5">{error.name}</p>}
          </div>
        )}

        {/* Email */}
        <div className="input-wrap mb-[14px] text-left">
          <div className="input-field flex items-center gap-2 mb-[6px] w-full py-[11px] px-6 rounded-[50px]">
            <label htmlFor="email">
              <img className="w-[15px] h-[15px] object-contain" src={assets.mail_icon} />
            </label>
            <input
              className="w-full border-none outline-none px-[5px] bg-transparent"
              type="email"
              name="email"
              id="email"
              value={data.email}
              onChange={onHandleData}
              placeholder="Email address"
              autoComplete="new-email"
            />
          </div>
          {error?.email && <p className="error-msg pl-5">{error.email}</p>}
        </div>

        {/* Password */}
        <div className="input-wrap mb-[6px] text-left">
          <div className="input-field flex items-center mb-[6px] gap-2 w-full py-[11px] px-6 rounded-[50px]">
            <label htmlFor="password">
              <img className="w-[15px] h-[15px] object-contain" src={assets.lock_icon} />
            </label>
            <input
              autoComplete="off"
              className="w-full border-none outline-none px-[5px] bg-transparent"
              type="password"
              name="password"
              id="password"
              value={data.password}
              onChange={onHandleData}
              placeholder="Password"
            />
          </div>
          {error?.password && <p className="error-msg pl-5">{error.password}</p>}

          {/* Strength meter — Sign Up only */}
          {currentState === "Sign Up" && data.password.length > 0 && (
            <div className="px-2 mt-[4px] mb-[4px]">
              <div className="flex items-center gap-3 mb-[8px]">
                <div className="strength-bar flex-1">
                  <div
                    className="strength-fill"
                    style={{ width: strengthInfo.width, backgroundColor: strengthInfo.color }}
                  />
                </div>
                <span className="strength-label" style={{ color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              </div>
              <div className="strength-hints">
                {hints.map((h) => (
                  <span key={h.label} className={`hint ${h.met ? "met" : ""}`}>
                    {h.met ? "✓" : "·"} {h.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Forgot password — Login only */}
        {currentState === "Login" && (
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate("/reset-password"); }}
            className="forgot-link text-left flex items-start mb-[10px] pl-2 mt-[4px]"
          >
            <span>Forgot Password?</span>
          </a>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-[13px] border-none outline-none rounded-[50px] text-white cursor-pointer mb-[18px] font-semibold mt-[14px]"
        >
          {loading ? "Please wait..." : currentState === "Sign Up" ? "Create Account" : "Sign In"}
        </button>

        <div className="sign-btn flex items-center justify-center gap-2">
          <p>
            {currentState === "Sign Up" ? "Already have an account?" : "Don't have an account?"}
          </p>
          <a className="switch-link" onClick={switchState} href="#">
            {currentState === "Sign Up" ? "Login" : "Sign Up"}
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
