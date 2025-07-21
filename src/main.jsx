import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import './index.css'
import ProductsPage from './pages/products'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-6 mb-6">
            <Link to="/" className="text-lg font-semibold hover:text-blue-600">Home</Link>
            <Link to="/switch-commerce" className="text-lg hover:text-blue-600">Switch Commerce</Link>
            <Link to="/clear-choice" className="text-lg hover:text-orange-600">Clear Choice</Link>
            <Link to="/products" className="text-lg hover:text-blue-600">Knowledge Base</Link>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clear-choice" element={<ClearChoice />} />
          <Route path="/switch-commerce" element={<SwitchCommerce />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)