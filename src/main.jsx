import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
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
import FieldNotes from './pages/FieldNotes.jsx';
import Birthdays from './pages/Birthdays.jsx';
import Anniversaries from './pages/Anniversaries.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductsAdmin from './pages/admin/ProductsAdmin.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import FieldNotesAdmin from './pages/admin/FieldNotesAdmin.jsx';
import FieldNoteForm from './pages/admin/FieldNoteForm.jsx';
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

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-400 flex items-center justify-center">
        <div className="inline-block h-8 w-8 border-4 border-[#0951fa] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Admin access required</h1>
          <p className="text-gray-400 mb-6">
            Your account doesn't have the <code className="px-2 py-0.5 rounded bg-gray-800 text-[#0a7cff]">admin</code> role in Netlify Identity.
            Ask a site admin to assign it, then sign out and back in to refresh your token.
          </p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-[#0951fa] hover:bg-[#0951fa]/90 text-white font-semibold rounded-lg transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    );
  }
  return children;
}

function AppShell() {
  const { user, logout, isAdmin } = useAuth();

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
              {isAdmin && (
                <Link to="/admin" className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0951fa]/20 border border-[#0951fa]/40 text-[#0a7cff] hover:bg-[#0951fa]/30 transition-colors text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-200">
              <div className="text-right text-xs leading-tight hidden sm:block">
                <div className="text-gray-300 truncate max-w-[180px]" title={user.email}>
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div className={isAdmin ? "text-[#0a7cff]" : "text-gray-500"}>
                  {isAdmin ? "Admin" : "Viewer"}
                </div>
              </div>
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
        <Route path="/field-notes" element={<ProtectedRoute><FieldNotes /></ProtectedRoute>} />
        <Route path="/birthdays" element={<ProtectedRoute><Birthdays /></ProtectedRoute>} />
        <Route path="/anniversaries" element={<ProtectedRoute><Anniversaries /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductsAdmin /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />
        <Route path="/admin/field-notes" element={<AdminRoute><FieldNotesAdmin /></AdminRoute>} />
        <Route path="/admin/field-notes/new" element={<AdminRoute><FieldNoteForm /></AdminRoute>} />
        <Route path="/admin/field-notes/:id/edit" element={<AdminRoute><FieldNoteForm /></AdminRoute>} />
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
