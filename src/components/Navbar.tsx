import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  IndianRupee, 
  LayoutDashboard, 
  ListOrdered, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/dashboard/transactions', label: 'Transactions', icon: <ListOrdered className="w-5 h-5" /> },
    { path: '/dashboard/add-transaction', label: 'Add Transaction', icon: <PlusCircle className="w-5 h-5" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <IndianRupee className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    Rupee Tracker
                  </span>
                </Link>
              </div>
              
              {/* Desktop navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            
            {/* User dropdown and mobile menu button */}
            <div className="flex items-center">
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <div className="ml-3 relative flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-3">
                    {user?.username}
                  </span>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" />
                  ) : (
                    <Menu className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
                onClick={closeMobileMenu}
              >
                <div className="flex items-center">
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </div>
              </NavLink>
            ))}
            <div className="mt-3 px-3 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-base font-medium text-gray-800">{user?.username}</div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Page header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/dashboard/transactions' && 'Transactions'}
            {location.pathname === '/dashboard/add-transaction' && 'Add Transaction'}
            {location.pathname.startsWith('/dashboard/edit-transaction') && 'Edit Transaction'}
          </h1>
        </div>
      </header>
    </>
  );
};

export default Navbar;