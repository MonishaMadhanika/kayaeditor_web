import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthProvider";
import DiagramEditor from "./pages/DiagramEditor";
import Profile from "./pages/Profile";
import { ToastProvider } from "./components/ui/Toast";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["editor", "viewer"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagram/:id"
            element={
              <ProtectedRoute allowedRoles={["editor", "viewer"]}>
                <DiagramEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["editor", "viewer"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="flex min-h-screen items-center justify-center text-red-600 text-xl font-semibold">
                Unauthorized Access
              </div>
            }
          />
          <Route path="*" element={<Login />} />
        </Routes>
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
