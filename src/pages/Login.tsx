import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../service/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { AppUser } from "../types";
import { useTheme } from "../components/mode/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { authStyles } from "./styles/authStyles";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Login: React.FC = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ✅ Curried input handler
  const handleChange =
    (field: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = state;
    setSuccess("");
    if (!email && !password) {
      setState((prev) => ({ ...prev, message: "Please enter both email and password." }));
      return;
    }
    if (!email) {
      setState((prev) => ({ ...prev, message: "Please enter your email." }));
      return;
    }
    if (!password) {
      setState((prev) => ({ ...prev, message: "Please enter your password." }));
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as AppUser;
        localStorage.setItem("userRole", data.role);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        setState((prev) => ({ ...prev, message: "User role not found." }));
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={authStyles.container(theme) + " min-h-screen flex flex-col justify-center items-center " + (theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
        : "bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50"
      )}
    >
      {/* Overlay removed for clarity, or you can add a soft overlay if desired */}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/40 hover:bg-white/70 transition-all shadow-md backdrop-blur-sm"
      >
        {theme === "dark" ? (
          <Sun size={22} className="text-yellow-400" />
        ) : (
          <Moon size={22} className="text-blue-700" />
        )}
      </button>

      {/* Login Card */}
      <div className={authStyles.card(theme)}>
        <h1 className={authStyles.heading}>
          Welcome to <span className="text-[#1a6aff]">Kaya</span> Editor
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={state.email}
            onChange={handleChange("email")}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={state.password}
            onChange={handleChange("password")}
            placeholder="Enter your password"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Log In"}
          </Button>
        </form>
        {loading && (
          <div className="mt-3 text-center text-blue-500">Loading, please wait...</div>
        )}
        {success && (
          <p className="mt-3 text-center text-sm text-green-600">{success}</p>
        )}
        {state.message && (
          <p className="mt-3 text-center text-sm text-red-500">{state.message}</p>
        )}

        <p className="text-center text-xs sm:text-sm mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className={authStyles.link}>
            Sign up now
          </Link>
        </p>
      </div>

      {/* Kaya Watermark */}
      <h1
        className={authStyles.watermark(theme)}
        style={{ bottom: "5%", left: "8%", zIndex: 0 }}
      >
        KAYA
      </h1>
    </div>
  );
};

export default Login;
