import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">FormGenie</span>
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-700 mr-4 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {user.username} ({user.role})
                </span>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium mr-2 flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="ml-2 btn-primary !py-1.5 !px-3 text-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
