import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, CogIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import Home from './Home'
import SwitchCommerceBranding from './pages/SwitchCommerceBranding.jsx';
import ClearChoiceBranding from './pages/ClearChoiceBranding.jsx';
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import ProductsPage from './pages/products';
import EmailSignature from './pages/EmailSignature.jsx';
import Wallpapers from './pages/Wallpapers.jsx';
import MarketingRequest from './pages/MarketingRequest.jsx';
import PrintCollateral from './pages/PrintCollateral.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState } from 'react';
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <>
      {user && (
        <nav className="bg-gray-800 p-4 shadow">
          <div className="max-w-5xl mx-auto flex items-center gap-6">
            <div className="flex flex-1 items-center justify-center gap-6">
              <Link to="/" className="text-gray-200 hover:text-white">
                <HomeIcon className="h-6 w-6" />
              </Link>
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center text-gray-200 hover:text-white">
                  Team Assets
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </Menu.Button>
                <Menu.Items className="absolute mt-2 w-48 bg-white dark:bg-gray-700 rounded shadow-lg z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/switch-commerce/branding" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Switch Commerce Brand Guidelines</Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a href="/brochures/SwitchCommerceClearChoiceBrochure.pdf" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Switch Commerce Brochure</a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link to="/clear-choice/branding" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Clear Choice Brand Guidelines</Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a href="/brochures/SwitchCommerceClearChoiceBrochure.pdf" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Clear Choice Brochure</a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
              <Link to="/products" className="inline-flex items-center text-gray-200 hover:text-white">
                Knowledge Base
              </Link>
            </div>
            <div className="flex items-center gap-4 text-gray-200">
              <CogIcon className="h-5 w-5 hover:text-white cursor-pointer" onClick={() => setDarkMode(m => !m)} />
              <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/clear-choice" element={<ProtectedRoute><ClearChoice /></ProtectedRoute>} />
        <Route path="/switch-commerce" element={<ProtectedRoute><SwitchCommerce /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path="/switch-commerce/branding" element={<ProtectedRoute><SwitchCommerceBranding /></ProtectedRoute>} />
        <Route path="/clear-choice/branding" element={<ProtectedRoute><ClearChoiceBranding /></ProtectedRoute>} />
        <Route path="/email-signature" element={<ProtectedRoute><EmailSignature /></ProtectedRoute>} />
        <Route path="/wallpapers" element={<ProtectedRoute><Wallpapers /></ProtectedRoute>} />
        <Route path="/marketing-request" element={<ProtectedRoute><MarketingRequest /></ProtectedRoute>} />
        <Route path="/print-collateral" element={<ProtectedRoute><PrintCollateral /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
