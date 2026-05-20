import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserCircle, LogOut, Search } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Explore from './pages/Explore';
import BrowseItems from './pages/BrowseItems';
import LostForm from './pages/LostForm';
import FoundForm from './pages/FoundForm';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/" className="nav-brand" style={{marginRight: '1rem'}}>
          TRACEBACK
        </Link>
        <Link to="/items" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '1rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px'}}>
          <Search size={16} /> Search...
        </Link>
        <Link to="/" className="nav-link">Explore</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/report-lost" className="nav-link">Report</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <span className="text-secondary" style={{fontSize: '0.9rem', fontWeight: '500'}}>{user.name}</span>
            <button onClick={logout} className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-link" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            Login <UserCircle size={20} className="text-primary" />
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content" style={{padding: '0', maxWidth: '100%'}}>
            <div style={{padding: '0 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%'}}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Explore />} />
                <Route path="/items" element={<BrowseItems />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/report-lost" element={<ProtectedRoute><LostForm /></ProtectedRoute>} />
                <Route path="/report-found" element={<ProtectedRoute><FoundForm /></ProtectedRoute>} />
                <Route path="/item/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
