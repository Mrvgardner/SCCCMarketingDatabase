import React, { lazy, memo, Suspense, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import Home from './Home'
import Login from './pages/Login.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop.jsx';
import { bootstrapNative } from './native/bootstrap';
import { isNativeApp } from './api/apiBase';
import { tradeShows as seedTradeShows } from './data/tradeShows';
import { forwardTokenToAppIfPending, startAppAuthFromRoot, deepLinkFromIdentitySession } from './native/appAuthBridge';

// The app opens straight into the current show rather than a list of one.
// Read from the seed because this has to resolve synchronously at route time;
// the screens themselves then load live data over the top.
const firstUpcomingEventId =
  (seedTradeShows.find((event) => event.status !== 'past') || seedTradeShows[0])?.id || '';
import './index.css'

// Service workers do not exist on the capacitor:// origin, and calling
// registerSW there throws during module evaluation — which kills the whole
// bundle before React mounts and leaves a blank screen with no visible error.
// The native shell gets its offline behaviour from the platform instead, so
// this is web-only by design. Dynamic import so the native bundle never even
// evaluates the module.
if (!isNativeApp() && "serviceWorker" in navigator) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch((error) => console.error("Service worker registration failed", error));
}

// If the native app started this sign-in, the token has just landed in the
// fragment — forward it to the app and stop. Must run before anything renders,
// and it is a no-op for every ordinary web visit.
forwardTokenToAppIfPending();

// The app opens the site at /?appauth=1 to begin a sign-in. Starting here
// rather than at /app-auth means Netlify sees the same Referer as the web
// sign-in that has always worked. No-op for every ordinary visit.
startAppAuthFromRoot();

// The identity widget consumes the token from the fragment before this module
// runs, so a returning app sign-in looks like an ordinary signed-in page load.
// If the app started it, send the user to /app-auth to collect the handoff.
if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/app-auth')) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (deepLinkFromIdentitySession()) window.location.replace('/app-auth');
    }, 400);
  });
}

// No-op on the web; closes the native splash screen and tints the status bar
// when running inside the iOS shell.
bootstrapNative();

// Route chunks. Each `imp` is a stable reference to a dynamic import so we can
// call it from hover handlers to prefetch the JS for a route the user is about
// to navigate to. The dedupe is automatic — Vite resolves a single Promise.
const routes = {
  switchCommerceBranding: () => import('./pages/SwitchCommerceBranding.jsx'),
  clearChoiceBranding:    () => import('./pages/ClearChoiceBranding.jsx'),
  clearChoice:            () => import('./ClearChoice.jsx'),
  switchCommerce:         () => import('./SwitchCommerce.jsx'),
  productsPage:           () => import('./pages/products'),
  emailSignature:         () => import('./pages/EmailSignature.jsx'),
  wallpapers:             () => import('./pages/Wallpapers.jsx'),
  marketingRequest:       () => import('./pages/MarketingRequest.jsx'),
  printCollateral:        () => import('./pages/PrintCollateral.jsx'),
  fieldNotes:             () => import('./pages/FieldNotes.jsx'),
  events:                 () => import('./pages/Events.jsx'),
  birthdays:              () => import('./pages/Birthdays.jsx'),
  anniversaries:          () => import('./pages/Anniversaries.jsx'),
  adminDashboard:         () => import('./pages/admin/AdminDashboard.jsx'),
  productsAdmin:          () => import('./pages/admin/ProductsAdmin.jsx'),
  productForm:            () => import('./pages/admin/ProductForm.jsx'),
  fieldNotesAdmin:        () => import('./pages/admin/FieldNotesAdmin.jsx'),
  fieldNoteForm:          () => import('./pages/admin/FieldNoteForm.jsx'),
  tradeShowsAdmin:        () => import('./pages/admin/TradeShowsAdmin.jsx'),
  tradeShowEditor:        () => import('./pages/admin/TradeShowEditor.jsx'),
  appAuthRedirect:        () => import('./pages/AppAuthRedirect.jsx'),
  tripLayout:             () => import('./pages/trip/TripLayout.jsx'),
  tripToday:              () => import('./pages/trip/TripToday.jsx'),
  tripSchedule:           () => import('./pages/trip/TripSchedule.jsx'),
  tripMoney:              () => import('./pages/trip/TripMoney.jsx'),
  tripBooth:              () => import('./pages/trip/TripBooth.jsx'),
  tripTeam:               () => import('./pages/trip/TripTeam.jsx'),
  tripMore:               () => import('./pages/trip/TripMore.jsx'),
};

const SwitchCommerceBranding = lazy(routes.switchCommerceBranding);
const ClearChoiceBranding    = lazy(routes.clearChoiceBranding);
const ClearChoice            = lazy(routes.clearChoice);
const SwitchCommerce         = lazy(routes.switchCommerce);
const ProductsPage           = lazy(routes.productsPage);
const EmailSignature         = lazy(routes.emailSignature);
const Wallpapers             = lazy(routes.wallpapers);
const MarketingRequest       = lazy(routes.marketingRequest);
const PrintCollateral        = lazy(routes.printCollateral);
const FieldNotes             = lazy(routes.fieldNotes);
const Events                 = lazy(routes.events);
const Birthdays              = lazy(routes.birthdays);
const Anniversaries          = lazy(routes.anniversaries);
const AdminDashboard         = lazy(routes.adminDashboard);
const ProductsAdmin          = lazy(routes.productsAdmin);
const ProductForm            = lazy(routes.productForm);
const FieldNotesAdmin        = lazy(routes.fieldNotesAdmin);
const FieldNoteForm          = lazy(routes.fieldNoteForm);
const TradeShowsAdmin        = lazy(routes.tradeShowsAdmin);
const TradeShowEditor        = lazy(routes.tradeShowEditor);
const AppAuthRedirect        = lazy(routes.appAuthRedirect);
const TripLayout             = lazy(routes.tripLayout);
const TripToday              = lazy(routes.tripToday);
const TripSchedule           = lazy(routes.tripSchedule);
const TripMoney              = lazy(routes.tripMoney);
const TripBooth              = lazy(routes.tripBooth);
const TripTeam               = lazy(routes.tripTeam);
const TripMore               = lazy(routes.tripMore);

// Idempotent fire-and-forget; ignore the resolved module.
const prefetch = (imp) => { try { imp(); } catch {} };

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

// Same auth gate as ProtectedRoute but without the site header/footer wrapper.
// The trip screens are a full-bleed app surface with their own tab bar; the
// marketing chrome around them would be wrong on every screen.
function TripRoute({ children }) {
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

const TopNav = memo(function TopNav({ user, logout, isAdmin }) {
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
          <img
            src="/logos/switch/Logo Icon/SC Logo - White.png"
            alt="Home"
            width="32"
            height="32"
            decoding="async"
            fetchpriority="high"
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-2 lg:gap-4">
          <Link to="/products" className={primaryLinkClass}
            onMouseEnter={() => prefetch(routes.productsPage)}
            onFocus={() => prefetch(routes.productsPage)}>Knowledge Base</Link>
          <Link to="/field-notes" className={primaryLinkClass}
            onMouseEnter={() => prefetch(routes.fieldNotes)}
            onFocus={() => prefetch(routes.fieldNotes)}>Field Notes</Link>
          <Menu as="div" className="relative">
            <Menu.Button
              onMouseEnter={() => {
                prefetch(routes.switchCommerceBranding);
                prefetch(routes.clearChoiceBranding);
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              Brand Kits
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg bg-gray-800 border border-white/10 shadow-2xl z-20 py-1 focus:outline-none">
              <Menu.Item>{({ active }) => (
                <Link to="/switch-commerce/branding" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>Switch Commerce Brand Kit</Link>
              )}</Menu.Item>
              <Menu.Item>{({ active }) => (
                <Link to="/clear-choice/branding" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>ClearChoice Brand Kit</Link>
              )}</Menu.Item>
            </Menu.Items>
          </Menu>
          <Link to="/marketing-request" className={primaryLinkClass}
            onMouseEnter={() => prefetch(routes.marketingRequest)}
            onFocus={() => prefetch(routes.marketingRequest)}>Marketing Request</Link>
          <Menu as="div" className="relative">
            <Menu.Button
              onMouseEnter={() => {
                prefetch(routes.printCollateral);
                prefetch(routes.emailSignature);
                prefetch(routes.wallpapers);
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
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
              <Menu.Item>{({ active }) => (
                <Link to="/events" className={`block px-4 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-gray-200'}`}>Trade Shows</Link>
              )}</Menu.Item>
            </Menu.Items>
          </Menu>
          {isAdmin && (
            <Link to="/admin"
              onMouseEnter={() => prefetch(routes.adminDashboard)}
              onFocus={() => prefetch(routes.adminDashboard)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0951fa]/20 border border-[#0951fa]/40 text-[#0a7cff] hover:bg-[#0951fa]/30 transition-colors text-xs font-semibold">
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
            <div className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider text-gray-500">Brand Kits</div>
            <Link to="/switch-commerce/branding" className={mobileLinkClass}>Switch Commerce Brand Kit</Link>
            <Link to="/clear-choice/branding" className={mobileLinkClass}>ClearChoice Brand Kit</Link>
          </div>
          <div className="pt-2 mt-2 border-t border-white/10">
            <div className="px-3 pt-1 pb-2 text-[11px] uppercase tracking-wider text-gray-500">Other</div>
            <Link to="/print-collateral" className={mobileLinkClass}>Brochures & One-Pagers</Link>
            <Link to="/email-signature" className={mobileLinkClass}>Email Signatures</Link>
            <Link to="/wallpapers" className={mobileLinkClass}>Wallpapers</Link>
            <Link to="/events" className={mobileLinkClass}>Trade Shows</Link>
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
});

// The iOS app is a trade show tool, not the marketing site in a box. It
// carries only the event routes — no knowledge base, brand kits, wallpapers,
// signatures or field notes. That is both what the team wants on a phone at a
// booth and what keeps the app from reading as a repackaged website.
//
// Everything outside this route set is unreachable in the shell. The other
// pages are lazy-loaded, so their chunks are never fetched either.
function NativeAppShell() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/app-auth" element={<AppAuthRedirect />} />
          <Route path="/trip/:eventId" element={<TripRoute><TripLayout /></TripRoute>}>
            <Route index element={<Navigate to="today" replace />} />
            <Route path="today" element={<TripToday />} />
            <Route path="trip" element={<TripSchedule />} />
            <Route path="money" element={<TripMoney />} />
            <Route path="booth" element={<TripBooth />} />
            <Route path="team" element={<TripTeam />} />
            <Route path="more" element={<TripMore />} />
          </Route>
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/events/:eventId" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/admin/events" element={<AdminRoute><TradeShowsAdmin /></AdminRoute>} />
          <Route path="/admin/events/:eventId" element={<AdminRoute><TradeShowEditor /></AdminRoute>} />
          {/* Anything else — including the launch path "/" — lands on the
              current show. Without this a stray path renders nothing at all,
              which is the blank screen that cost so long to diagnose. */}
          <Route path="*" element={<Navigate to={`/trip/${firstUpcomingEventId}/today`} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function AppShell() {
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  // The trade show hub is the PWA's start_url and is meant to read as its own
  // app, so the marketing-site nav is hidden inside it. Every /events view
  // offers its own way back: EventAppMenu on a detail page, a header link on
  // the index. /admin/events keeps the nav — admins move between sections.
  const inTradeShowApp = pathname === '/events' || pathname.startsWith('/events/')
    || pathname.startsWith('/trip/');

  return (
    <>
      {user && !inTradeShowApp && <TopNav user={user} logout={logout} isAdmin={isAdmin} />}
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app-auth" element={<AppAuthRedirect />} />
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
        <Route path="/field-notes/:id" element={<ProtectedRoute><FieldNotes /></ProtectedRoute>} />
        <Route path="/trip/:eventId" element={<TripRoute><TripLayout /></TripRoute>}>
          <Route index element={<Navigate to="today" replace />} />
          <Route path="today" element={<TripToday />} />
          <Route path="trip" element={<TripSchedule />} />
          <Route path="money" element={<TripMoney />} />
          <Route path="booth" element={<TripBooth />} />
          <Route path="team" element={<TripTeam />} />
            <Route path="more" element={<TripMore />} />
        </Route>
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/:eventId" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/birthdays" element={<ProtectedRoute><Birthdays /></ProtectedRoute>} />
        <Route path="/anniversaries" element={<ProtectedRoute><Anniversaries /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductsAdmin /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />
        <Route path="/admin/field-notes" element={<AdminRoute><FieldNotesAdmin /></AdminRoute>} />
        <Route path="/admin/field-notes/new" element={<AdminRoute><FieldNoteForm /></AdminRoute>} />
        <Route path="/admin/field-notes/:id/edit" element={<AdminRoute><FieldNoteForm /></AdminRoute>} />
        <Route path="/admin/events" element={<AdminRoute><TradeShowsAdmin /></AdminRoute>} />
        <Route path="/admin/events/:eventId" element={<AdminRoute><TradeShowEditor /></AdminRoute>} />
      </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {isNativeApp() ? <NativeAppShell /> : <AppShell />}
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
