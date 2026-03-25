import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowMenu(false);
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/dashboard" className="text-2xl font-bold">
                    💰 Expense Tracker
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/dashboard" className="hover:text-gray-200 transition">Dashboard</Link>
                    <Link to="/expenses" className="hover:text-gray-200 transition">Expenses</Link>
                    <Link to="/incomes" className="hover:text-gray-200 transition">Incomes</Link>
                    <Link to="/profile" className="hover:text-gray-200 transition">Profile</Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-white focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMenu && (
                <div className="md:hidden bg-blue-700 px-6 py-4 space-y-2">
                    <Link
                        to="/dashboard"
                        className="block py-2 hover:text-gray-200 transition"
                        onClick={() => setShowMenu(false)}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/expenses"
                        className="block py-2 hover:text-gray-200 transition"
                        onClick={() => setShowMenu(false)}
                    >
                        Expenses
                    </Link>
                    <Link
                        to="/incomes"
                        className="block py-2 hover:text-gray-200 transition"
                        onClick={() => setShowMenu(false)}
                    >
                        Incomes
                    </Link>
                    <Link
                        to="/profile"
                        className="block py-2 hover:text-gray-200 transition"
                        onClick={() => setShowMenu(false)}
                    >
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left py-2 text-red-300 hover:text-red-200 transition"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
