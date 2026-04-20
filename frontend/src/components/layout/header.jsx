import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  Users,
  LogIn,
  UserPlus,
  Settings,
  FileText,
  Mail,
  ChevronRight,
  Info,
  User,
  KeyRound,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
// import Login from '../auth/loginModal';

// Header Component
export default function Header({ toggleMobileMenu, isMobileMenuOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <img src="/vite.svg" alt="Logo" className="h-5 w-5 rounded-full" />
            <h3 className="text-xl font-bold">Consiliul Județean Teleorman</h3>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="text-white hover:text-red-300! transition-colors no-underline!"
            >
              <div className="flex items-center space-x-1">
                <Home size={16} />
                <span>Home</span>
              </div>
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-red-300! transition-colors no-underline!"
            >
              <div className="flex items-center space-x-1">
                <Users size={16} />
                <span>About</span>
              </div>
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-red-300! transition-colors no-underline!"
            >
              <div className="flex items-center space-x-1">
                <Mail size={16} />
                <span>Contact</span>
              </div>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-5 py-1 rounded font-semibold hover:text-black! transition-colors no-underline!"
                >
                  <div className="flex items-center space-x-1 no-underline">
                    <LogIn size={16} />
                    <span>Login</span>
                  </div>
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-5 py-1 rounded font-semibold hover:text-black! transition-colors no-underline!"
                >
                  <div className="flex items-center space-x-1 no-underline">
                    <UserPlus size={16} />
                    <span>Register</span>
                  </div>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                  >
                    <span>{user?.full_name}</span>
                    <ChevronDown size={16} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded shadow-lg z-50">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 no-underline! text-gray-800!"
                      >
                        <User size={15} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/change-password"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-blue-50 no-underline! text-gray-800!"
                      >
                        <KeyRound size={15} />
                        <span>Change password</span>
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="hidden sm:block bg-white text-blue-600 px-5 py-1 rounded font-semibold hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
