import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, CogIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import Home from './Home'
import SwitchCommerceBranding from './pages/SwitchCommerceBranding.jsx';
import ClearChoiceBranding from './pages/ClearChoiceBranding.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import ProductsPage from './pages/products';
import EmailSignature from './pages/EmailSignature.jsx';
import Wallpapers from './pages/Wallpapers.jsx';
import Navbar from './components/Navbar.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { useState } from 'react';
import './index.css'

function App() {
  console.log('App component is rendering - Original');
  const [darkMode, setDarkMode] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <BrowserRouter>
      <ThemeProvider>
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clear-choice" element={<ClearChoice />} />
          <Route path="/switch-commerce" element={<SwitchCommerce />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/switch-commerce/branding" element={<SwitchCommerceBranding />} />
          <Route path="/clear-choice/branding" element={<ClearChoiceBranding />} />
          <Route path="/email-signature" element={<EmailSignature />} />
          <Route path="/wallpapers" element={<Wallpapers />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
