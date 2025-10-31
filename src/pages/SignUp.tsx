import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../service/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../components/mode/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { authStyles } from "./styles/authStyles";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Signup: React.FC = () => {
    const [state, setState] = useState({
        email: "",
        password: "",
        role: "editor",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleChange =
        (field: keyof typeof state) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                setState((prev) => ({ ...prev, [field]: e.target.value }));
            };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const { email, password } = state;
        setSuccess("");
        setState(prev => ({ ...prev, message: "" }));
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: state.role,
            });
            setSuccess("Sign up successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error: any) {
            setSuccess("");
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

            {/* Signup Card */}
            <div className={authStyles.card(theme)}>
                <h1 className={authStyles.heading}>
                    Create Your <span className="text-[#1a6aff]">Kaya</span> Account
                </h1>

                <form onSubmit={handleSignup} className="space-y-4">
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

                    <label className="block">
                        <span className="block text-sm mb-1">Role</span>
                        <select
                            value={state.role}
                            onChange={handleChange("role")}
                            className={authStyles.input}
                        >
                            <option value="editor">Editor (can create/edit)</option>
                            <option value="viewer">Viewer (read-only)</option>
                        </select>
                    </label>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Sign Up"}
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
                    Already have an account?{" "}
                    <Link to="/login" className={authStyles.link}>
                        Log in
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

export default Signup;
