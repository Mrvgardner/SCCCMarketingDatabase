import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import ClearChoice from './ClearChoice.jsx'
import SwitchCommerce from './SwitchCommerce.jsx'
import './index.css'
import ProductsPage from './pages/products'
import SwitchBrochure from './pages/SwitchBrochure'
import ClearChoiceBrochure from './pages/ClearChoiceBrochure'
import ProductKnowledgeBase from './ProductKnowledgeBase'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clear-choice" element={<ClearChoice />} />
          <Route path="/switch-commerce" element={<SwitchCommerce />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/switch-brochure" element={<SwitchBrochure />} />
          <Route path="/clear-choice-brochure" element={<ClearChoiceBrochure />} />
          <Route path="/knowledge-base" element={<ProductKnowledgeBase />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)