import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import './index.css'
import ProductsPage from './pages/products';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <nav className="bg-gray-100 p-4 shadow mb-6">
        <div className="max-w-5xl mx-auto flex gap-6">
          <Link to="/" className="text-lg font-semibold text-gray-800 hover:text-blue-600">Home</Link>
           <Link to="/switch-commerce" className="text-lg text-gray-800 hover:text-blue-600">Switch Commerce</Link>
          <Link to="/clear-choice" className="text-lg text-gray-800 hover:text-orange-600">Clear Choice</Link>
          <Link to="/products" className="text-lg text-gray-800 hover:text-blue-600">
  Knowledge Base
</Link>
        </div>
      </nav>
     <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/clear-choice" element={<ClearChoice />} />
  <Route path="/switch-commerce" element={<SwitchCommerce />} />
  <Route path="/products" element={<ProductsPage />} /> {/* Add this line */}
</Routes>
    </BrowserRouter>
  </React.StrictMode>
)