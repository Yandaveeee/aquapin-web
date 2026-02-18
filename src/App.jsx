import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Map, ClipboardList, Sprout, Settings as SettingsIcon, LogOut } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MapManager from './pages/MapManager';
import Operations from './pages/Operations';
import AI_Tools from './pages/AI_Tools';
import Settings from './pages/Settings';
import PondDetail from './pages/PondDetail';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { logout } = useContext(AuthContext);

  const linkStyle = (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
      textDecoration: 'none',
      borderRadius: 'var(--radius-md)',
      marginBottom: '8px',
      transition: 'all 0.2s',
      background: active ? 'var(--primary-light)' : 'transparent',
      fontWeight: active ? 600 : 500
  });

  return (
    <nav style={{
        width: '260px',
        height: '100vh',
        background: 'white',
        borderRight: '1px solid var(--border-color)',
        padding: '24px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
    }}>
      <h2 style={{
          color: 'var(--primary-dark)', 
          marginBottom: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10,
          fontSize: '24px'
      }}>
        🌊 AquaPin
      </h2>
      
      <Link to="/" style={linkStyle(isActive('/'))}>
        <LayoutDashboard size={20}/> Dashboard
      </Link>
      <Link to="/map" style={linkStyle(isActive('/map'))}>
        <Map size={20}/> Pond Map
      </Link>
      <Link to="/ops" style={linkStyle(isActive('/ops'))}>
        <ClipboardList size={20}/> Operations
      </Link>
      <Link to="/predict" style={linkStyle(isActive('/predict'))}>
        <Sprout size={20}/> AI Tools
      </Link>
      
      <div style={{flex: 1}}></div>
      
      <Link to="/settings" style={linkStyle(isActive('/settings'))}>
        <SettingsIcon size={20}/> Settings
      </Link>
      <button onClick={logout} style={{
          ...linkStyle(false), 
          border: 'none', 
          cursor: 'pointer', 
          width: '100%', 
          textAlign: 'left',
          marginTop: '8px',
          color: 'var(--error-color)'
      }}>
        <LogOut size={20}/> Logout
      </button>
    </nav>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>
          Loading Farm Data...
      </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{
        paddingLeft: '260px', 
        minHeight: '100vh', 
        background: 'var(--bg-color)'
    }}>
      <main style={{
          padding: '40px', 
          maxWidth: '1200px', 
          margin: '0 auto'
      }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapManager /></ProtectedRoute>} />
          <Route path="/pond/:id" element={<ProtectedRoute><PondDetail /></ProtectedRoute>} />
          <Route path="/ops" element={<ProtectedRoute><Operations /></ProtectedRoute>} />
          <Route path="/predict" element={<ProtectedRoute><AI_Tools /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
