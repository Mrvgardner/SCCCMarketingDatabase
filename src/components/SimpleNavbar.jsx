import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    console.log("Mobile menu toggled:", newState ? "OPEN" : "CLOSED");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm relative">
      {/* MOBILE VIEW debug indicator - Will show in top-right */}
      <div className="md:hidden absolute top-0 right-0 bg-red-500 text-white text-xs p-1 m-1 rounded-md z-50">
        MOBILE
      </div>
      
      {/* Always visible navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-gray-900 dark:text-white font-bold text-xl">
            Switch Portal
          </Link>
          
          {/* Hamburger Button - Only visible on mobile - EXTRA PROMINENT */}
          <button 
            className="block md:hidden p-3 bg-orange-500 text-white rounded-md text-2xl font-bold shadow-lg"
            onClick={toggleMobileMenu}
            style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 999 }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 dark:text-gray-300">
              Home
            </Link>
            <Link to="/products" className="text-gray-600 dark:text-gray-300">
              Knowledge Base
            </Link>
            <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-blue-900 z-50 flex flex-col p-6 items-center">
          <div className="flex justify-end w-full">
            <button 
              onClick={toggleMobileMenu}
              className="text-white text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          
          <div className="flex flex-col space-y-6 items-center mt-16">
            <Link 
              to="/" 
              className="text-white text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              to="/products" 
              className="text-white text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Knowledge Base
            </Link>
            
            <div className="w-full border-t border-blue-800 pt-4 mt-4">
              <div className="text-white text-lg font-medium mb-4 text-center">Team Assets</div>
              
              <div className="flex flex-col space-y-4 items-center">
                <a 
                  href="/brochures/switch-brochure.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Switch Brochure
                </a>
                
                <a 
                  href="/brochures/clearchoice-brochure.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Clear Choice Brochure
                </a>
              </div>
            </div>
            
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-full"
            >
              {theme === 'dark' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
