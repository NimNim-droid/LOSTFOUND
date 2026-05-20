import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Shield, Users } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password);
    } else {
      register(name, email, password);
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-layout">
      {/* Left Branding Panel */}
      <div className="auth-branding">
        <div className="branding-content">
          <h1 className="branding-title">Join the community of finders and seekers.</h1>
          <p className="branding-desc">
            TRACEBACK is the world's most secure and efficient network for reuniting lost items 
            with their owners through community-driven logistics.
          </p>
          
          <div className="branding-badges">
            <div className="trust-badge">
              <Shield size={18} className="text-success" />
              <span>Secure Data</span>
            </div>
            <div className="trust-badge">
              <Users size={18} className="text-success" />
              <span>Verified Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <Link to="/" className="auth-logo">
            TRACEBACK
          </Link>

          <div className="auth-toggle-pill">
            <button 
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Log In
            </button>
            <button 
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label-sm">Full Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    className="form-control input-light pl-10" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label-sm">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  className="form-control input-light pl-10" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex-between">
                <label className="form-label-sm">Password</label>
                {isLogin && <a href="#" className="forgot-link">Forgot Password?</a>}
              </div>
              <div className="input-icon-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  className="form-control input-light pl-10" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-dark w-100 mt-4">
              {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-login">
            <button className="btn btn-outline w-100 social-btn">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-icon" />
              Google
            </button>
          </div>

          <p className="auth-terms">
            By continuing, you agree to TRACEBACK's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
      
      {/* Global Footer specifically for auth layout context */}
      <footer className="auth-footer">
        <div className="footer-left">
          <div className="footer-logo">TRACEBACK</div>
          <div className="footer-copyright">© 2024 TRACEBACK. Secure community logistics.</div>
        </div>
        <div className="footer-links">
          <a href="#">Contact</a>
          <a href="#">FAQ</a>
          <a href="#">Safety Tips</a>
          <a href="#">Legal</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
