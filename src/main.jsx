import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Menu } from '@headlessui/react'
import { HomeIcon, CogIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import Home from './Home'
import SwitchCommerceBranding from './pages/SwitchCommerceBranding.jsx';
import ClearChoiceBranding from './pages/ClearChoiceBranding.jsx';
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import './index.css'
import ProductsPage from './pages/products';

import EmailSignature from './pages/EmailSignature.jsx';
import Wallpapers from './pages/Wallpapers.jsx';


import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // List of searchable resources/pages with keywords and descriptions for fuzzy search
  // Email signature names and direct links
  const signatureNames = [
    "Austin Cashion", "Carlos Cotto", "Cathy Cranford", "Charles Wee", "Christian Michaels", "Dan Christiansen", "Danny Estes", "David Standeven", "Dawnise Mills", "Dwight Schrock", "Dylan Kapustka", "Eric Evans", "Greg Walker", "Hector Ortiz Perez", "Jay Bryan", "Jeff Childs", "Jon Eric Dinsmore", "Joni Watts", "Josh Carter", "Kevin Watts", "Kevin Weeber", "Komal Mehta", "LaSheika Brown", "Logan Brewner", "Luke Nowell", "Martin Garvie", "Masen Funderburk", "Matt Silvester", "Michael Willis", "Paul Willingham", "Renee Mesecher", "Rusty Prentice", "Susie Velasquez", "Tennessee Bonner", "Terrell Scott", "Trip Ochenski", "Tyrone Hill", "Victor Gardner Jr", "Wan-ye Davis", "William Rotel", "Zach Buie"
  ];
  const signatureItems = signatureNames.map(name => ({
    name,
    path: `/signatures/${name.replace(/ /g, "-").replace(/\./g, "")}.html`,
    description: `Email signature for ${name}`,
    keywords: ["signature", "email", name]
  }));

  // Knowledge Base products/use cases (add more as needed)
  const kbItems = [
    { name: "ACH Processing", path: "/products", description: "ACH product in Knowledge Base", keywords: ["ach", "processing", "knowledge base", "product"] },
    { name: "API Integration", path: "/products", description: "API integration info in Knowledge Base", keywords: ["api", "integration", "knowledge base", "product"] },
    { name: "Terminal Management", path: "/products", description: "Terminal management info in Knowledge Base", keywords: ["terminal", "management", "knowledge base", "product"] },
    // Add more products/use cases as needed
  ];

  const searchItems = [
    { name: "Home", path: "/", description: "Portal home page", keywords: ["main", "portal", "dashboard"] },
    { name: "Switch Commerce Brand Guidelines", path: "/switch-commerce/branding", description: "Switch Commerce branding guide", keywords: ["switch", "branding", "logo", "colors", "fonts"] },
    { name: "Switch Commerce Brochure", path: "/brochures/switch-brochure.pdf", external: true, description: "Switch Commerce PDF brochure", keywords: ["switch", "brochure", "pdf"] },
    { name: "Clear Choice Brand Guidelines", path: "/clear-choice/branding", description: "Clear Choice branding guide", keywords: ["clear choice", "branding", "logo", "colors", "fonts"] },
    { name: "Clear Choice Brochure", path: "/brochures/clearchoice-brochure.pdf", external: true, description: "Clear Choice PDF brochure", keywords: ["clear choice", "brochure", "pdf"] },
    { name: "Knowledge Base", path: "/products", description: "Product features, use cases, and sales resources", keywords: ["knowledge", "product", "features", "sales", "use case", "terminal", "ACH", "API", "Switch Commerce", "Clear Choice"] },
    { name: "Email Signature", path: "/email-signature", description: "Download your branded email signature", keywords: ["signature", "email"] },
    { name: "Wallpapers", path: "/wallpapers", description: "Branded desktop and mobile wallpapers", keywords: ["wallpaper", "background", "desktop", "mobile", "Switch Commerce", "Clear Choice"] },
    ...signatureItems,
    ...kbItems,
  ];

  // Fuzzy filter search results
  const filteredResults = searchQuery.trim()
    ? searchItems.filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
        );
      })
    : [];

  // Toggle dark mode by adding/removing a class on body
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Close search modal on Escape
  React.useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return (
    <BrowserRouter>
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
                  <a href="/brochures/switch-brochure.pdf" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Switch Commerce Brochure</a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/clear-choice/branding" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Clear Choice Brand Guidelines</Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a href="/brochures/clearchoice-brochure.pdf" target="_blank" rel="noopener noreferrer" className={`block px-4 py-2 text-gray-800 dark:text-gray-200 ${active ? 'bg-gray-200 dark:bg-gray-600' : ''}`}>Clear Choice Brochure</a>
                )}
              </Menu.Item>
              </Menu.Items>
            </Menu>
            <Link to="/products" className="inline-flex items-center text-gray-200 hover:text-white">
              Knowledge Base
            </Link>
          </div>
          <div className="flex items-center gap-4 text-gray-200">
            {/* MagnifyingGlassIcon hidden for now */}
            <CogIcon className="h-5 w-5 hover:text-white cursor-pointer" onClick={() => setDarkMode(m => !m)} />
          </div>
        </div>
      </nav>
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

      {/* Search Modal hidden for now */}
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);