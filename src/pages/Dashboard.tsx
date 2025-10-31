import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeAccessibleDiagrams, createDiagram } from "../service/action";
import { useAuth } from "../components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import DiagramsList from "../components/DiagramList";
import Sidebar from "../components/menu/Sidebar";
import { Diagram } from "../types";
import Button from "../components/ui/Button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "../components/ui/Toast";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [activeMenu, setActiveMenu] = useState("All Diagrams");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const role = localStorage.getItem("userRole");
  const { notify } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeAccessibleDiagrams(
      user.uid,
      user.email ?? "",
      (ds: Diagram[]) => {
        setDiagrams(ds);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    const blankStage = {
      attrs: { width: 1024, height: 768 },
      className: "Stage",
      children: [],
    };
    const id = await createDiagram({
      name: "Untitled diagram",
      ownerId: user.uid,
      stageJson: blankStage,
      thumbnail: "",
    });
    setCreating(false);
    notify('Diagram created', 'success');
    navigate(`/diagram/${id}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-neutral-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar as subcomponent */}
      <Sidebar darkMode={darkMode} onLogout={handleLogout} />
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header
          className={`flex justify-between items-center p-4 border-b ${
            darkMode ? "border-neutral-700" : "border-neutral-200"
          }`}
        >
          <div />
          <Button
            variant="secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </Button>
        </header>
        {/* Content - Always show diagrams */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Top bar above diagrams */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-white">All Diagrams</h2>
            <div />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-full text-blue-600 text-lg">
              <Loader2 className="animate-spin mr-2" /> Loading diagrams...
            </div>
          ) : diagrams.length > 0 ? (
            <>
              {role === "editor" && (
                <div className="mb-4">
                  <Button onClick={handleCreate} leftIcon={<PlusCircle size={18} />}>
                    {creating ? "Creating..." : "Create New Diagram"}
                  </Button>
                </div>
              )}
              <DiagramsList diagrams={diagrams} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full relative">
              <div className={`absolute inset-0 ${darkMode ? 'bg-neutral-900' : 'bg-neutral-50'} opacity-100`} />
              <div className="relative z-10 text-center">
                <h2 className="text-2xl font-semibold mb-4">
                  No diagrams found
                </h2>
                {role === "editor" && (
                <Button onClick={handleCreate} leftIcon={<PlusCircle size={18} />}> 
                  {creating ? "Creating..." : "Create a Kaya Diagram"}
                </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
