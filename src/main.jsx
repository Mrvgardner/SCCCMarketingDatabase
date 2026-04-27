import React, { lazy, Suspense, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import Home from './Home'
import Login from './pages/Login.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css'

const SwitchCommerceBranding = lazy(() => import('./pages/SwitchCommerceBranding.jsx'));
const ClearChoiceBranding = lazy(() => import('./pages/ClearChoiceBranding.jsx'));
const ClearChoice = lazy(() => import('./ClearChoice.jsx'));
const SwitchCommerce = lazy(() => import('./SwitchCommerce.jsx'));
const ProductsPage = lazy(() => import('./pages/products'));
const EmailSignature = lazy(() => import('./pages/EmailSignature.jsx'));
const Wallpapers = lazy(() => import('./pages/Wallpapers.jsx'));
const MarketingRequest = lazy(() => import('./pages/MarketingRequest.jsx'));
const PrintCollateral = lazy(() => import('./pages/PrintCollateral.jsx'));
const OnePagerBuilder = lazy(() => import('./pages/OnePagerBuilder.jsx'));
const FieldNotes = lazy(() => import('./pages/FieldNotes.jsx'));
const Birthdays = lazy(() => import('./pages/Birthdays.jsx'));
const Anniversaries = lazy(() => import('./pages/Anniversaries.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin.jsx'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm.jsx'));
const FieldNotesAdmin = lazy(() => import('./pages/admin/FieldNotesAdmin.jsx'));
const FieldNoteForm = lazy(() => import('./pages/admin/FieldNoteForm.jsx'));

function RouteFallback() {
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-400 flex items-center justify-center">
      <div className="inline-block h-8 w-8 border-4 border-[#0951fa] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <div className="flex-1 flex flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
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
          <h1 className="font-switch-bold text-2xl mb-2">Admin access required</h1>
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

function TopNav({ user, logout, isAdmin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  React.useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const primaryLinkClass = "px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors";
  const mobileLinkClass = "block px-3 py-3 rounded-lg text-base font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors";

  return (
    <nav className="bg-gray-900 border-b border-white/10 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
          aria-label="Home"
        >
          <img src="/logos/switch/Logo Icon/SC Logo - White.png" alt="Home" className="h-8 w-8 object-contain" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 lg:gap-4">
          <Link to="/products" className={primaryLinkClass}>Knowledge Base</Link>
          <Link to="/field-notes" className={primaryLinkClass}>Field Notes</Link>
          <Link to="/marketing-request" className={primaryLinkClass}>Marketing Request</Link>
          <Menu as="div" className="relative">
            <Menu.Button className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              Other
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-gray-800 border border-white/10 shadow-2xl z-20 py-1 focus:outline-none">
              <Menu.Item>{({ active }) => (
                <Link to="/print-collateral" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>Brochures & One-Pagers</Link>
              )}</Menu.Item>
              <Menu.Item>{({ active }) => (
                <Link to="/email-signature" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>Email Signatures</Link>
              )}</Menu.Item>
              <Menu.Item>{({ active }) => (
                <Link to="/wallpapers" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>Wallpapers</Link>
              )}</Menu.Item>
            </Menu.Items>
          </Menu>
          {isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0951fa]/20 border border-[#0951fa]/40 text-[#0a7cff] hover:bg-[#0951fa]/30 transition-colors text-xs font-semibold">
              Admin
            </Link>
          )}
        </div>

        {/* Right cluster: name + sign out (desktop) */}
        <div className="hidden md:flex items-center gap-4 text-gray-200 flex-shrink-0">
          <div className="text-right text-xs leading-tight hidden lg:block">
            <div className="text-gray-300 truncate max-w-[180px]" title={user.email}>
              {user.user_metadata?.full_name || user.email}
            </div>
            {isAdmin && <div className="text-[#0a7cff]">Admin</div>}
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden flex-1 items-center justify-end">
          {isAdmin && (
            <Link to="/admin" className="mr-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0951fa]/20 border border-[#0951fa]/40 text-[#0a7cff] text-[11px] font-semibold">
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-white/10 bg-gray-900 px-4 py-3 space-y-1">
          <Link to="/products" className={mobileLinkClass}>Knowledge Base</Link>
          <Link to="/field-notes" className={mobileLinkClass}>Field Notes</Link>
          <Link to="/marketing-request" className={mobileLinkClass}>Marketing Request</Link>
          <div className="pt-2 mt-2 border-t border-white/10">
            <div className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider text-gray-500">Downloads</div>
            <Link to="/print-collateral" className={mobileLinkClass}>Brochures & One-Pagers</Link>
            <Link to="/email-signature" className={mobileLinkClass}>Email Signatures</Link>
            <Link to="/wallpapers" className={mobileLinkClass}>Wallpapers</Link>
          </div>
          <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-gray-400 truncate pr-3">
              {user.user_metadata?.full_name || user.email}
            </div>
            <button onClick={logout} className="text-sm text-gray-300 hover:text-white transition-colors flex-shrink-0">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function AppShell() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      {user && <TopNav user={user} logout={logout} isAdmin={isAdmin} />}
      <Suspense fallback={<RouteFallback />}>
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
        <Route path="/one-pager-builder" element={<ProtectedRoute><OnePagerBuilder /></ProtectedRoute>} />
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
      </Suspense>
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
