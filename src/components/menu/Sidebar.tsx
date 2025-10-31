import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { SidebarProps } from "../../types";
import { IconType } from "react-icons";

const MenuIcon = FiMenu as IconType;
const CloseIcon = FiX as IconType;

const Sidebar: React.FC<SidebarProps> = ({
    darkMode,
    onLogout,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { name: "All Diagrams", icon: "📄" }
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Header */}
            <div
                className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
                    }`}
            >
                <h1 className="text-xl font-bold text-primary-600">Kaya Editor</h1>
                <button onClick={toggleMenu}>
                    {isOpen ? (
                        <CloseIcon className={`text-2xl ${darkMode ? "text-white" : "text-gray-800"}`} />
                    ) : (
                        <MenuIcon className={`text-2xl ${darkMode ? "text-white" : "text-gray-800"}`} />
                    )}

                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 transform transition-transform duration-300 z-40 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} 
        border-r flex flex-col justify-between`}
            >
                <div className="p-6 flex-1 flex flex-col">
                    {/* Logo */}
                    <h1 className="hidden md:block text-2xl font-bold mb-10 text-center text-primary-600">
                        Kaya Editor
                    </h1>

                    {/* Menu */}
                    <nav className="space-y-2 flex-1">
                        {/* Profile entry */}
                        <button
                            onClick={() => navigate('/profile')}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-md font-medium transition ${darkMode ? 'bg-neutral-700 text-white hover:bg-neutral-600' : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'}`}
                        >
                            <span className="flex items-center"><span className="mr-3">👤</span>Profile</span>
                            <span className={`text-xs ${darkMode ? 'text-white/80' : 'text-primary-600'}`}>Open</span>
                        </button>
                        {/* All menu logic for selecting menu removed, keep only display */}
                        {menuItems.map((item) => (
                            <div
                                key={item.name}
                                className={`flex items-center w-full text-left px-4 py-2 rounded-md font-medium ${darkMode
                                    ? "text-gray-200"
                                    : "text-gray-800"
                                }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Divider */}
                <div
                    className={`mx-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                />

                {/* Logout */}
                <div className="p-6">
                    <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 rounded-md bg-[#A62A07] text-white hover:bg-red-800 transition"
                    >
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={toggleMenu}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                />
            )}
        </>
    );
};

export default Sidebar;
