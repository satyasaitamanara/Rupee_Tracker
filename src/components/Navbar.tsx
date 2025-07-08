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
      <nav className="navbar-enhanced">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 glow-purple">
                    <IndianRupee className="h-8 w-8 text-purple-400" />
                  </div>
                  <span className="ml-3 text-xl font-bold gradient-text">
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
                      `inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-400/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            
            {/* User dropdown and mobile menu button */}
            <div className="flex items-center">
              <div className="hidden sm:flex sm:items-center sm:ml-6">
                <div className="ml-3 relative flex items-center">
                  <span className="text-sm font-semibold text-white mr-4">
                    {user?.username}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-danger"
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
                  className="inline-flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-200"
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
          <div className="pt-4 pb-3 space-y-2 px-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
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
            <div className="mt-4 px-4 py-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-white">{user?.username}</div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="btn-danger text-sm px-3 py-2"
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
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold gradient-text">
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