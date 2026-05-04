import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import CertLookup from './pages/CertLookup.jsx';
import RequestService from './pages/RequestService.jsx';
import Login from './pages/Login.jsx';
import Admin from './pages/Admin.jsx';
import AssetPage from './pages/AssetPage.jsx';
import './styles.css';

function App() {
  const path = window.location.pathname;
  const assetMatch = path.match(/^\/asset\/([^/]+)$/);
  if (assetMatch) return <AssetPage publicIdentifier={decodeURIComponent(assetMatch[1])} />;
  if (path === '/services') return <Services />;
  if (path === '/cert-lookup') return <CertLookup />;
  if (path === '/request-service') return <RequestService />;
  if (path === '/login') return <Login />;
  if (path === '/admin') return <Admin />;
  return <Home />;
}

createRoot(document.getElementById('root')).render(<App />);
