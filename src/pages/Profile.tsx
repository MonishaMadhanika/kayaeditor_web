import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import { useAuth } from "../components/AuthProvider";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { ArrowLeft, LogOut, User } from "lucide-react";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const role = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const { notify } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    notify('Logged out', 'success');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-ocean-50 dark:bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ocean-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>Back</Button>
          <h2 className="text-ocean-700 dark:text-white font-semibold">Profile</h2>
        </div>
        <Button variant="danger" size="sm" onClick={handleLogout} leftIcon={<LogOut size={16} />}>Log out</Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-ocean-100 dark:border-gray-700 rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-ocean-100 text-ocean-700 flex items-center justify-center">
              <User />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Signed in as</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{user?.email ?? 'Unknown'}</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">Role: <span className="font-medium">{role ?? 'Unknown'}</span></div>
          <div className="flex justify-end">
            <Button variant="danger" onClick={handleLogout} leftIcon={<LogOut size={16} />}>Log out</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
