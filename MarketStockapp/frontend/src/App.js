import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CategoryList from './pages/CategoryList';
import ProductList from './pages/ProductList';
import SalesHistory from './pages/SalesHistory';
import ForecastList from './pages/ForecastList';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-link">Anasayfa</Link>
          <Link to="/categories" className="nav-link">Kategoriler</Link>
          <Link to="/products" className="nav-link">Ürünler</Link>
          <Link to="/sales" className="nav-link">Satış Geçmişi</Link>
          <Link to="/forecasts" className="nav-link">Tahminler</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/forecasts" element={<ForecastList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
