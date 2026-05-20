import { Link } from 'react-router-dom';
import { Search, AlertCircle, Smartphone, Dog, Wallet, Key, CheckCircle } from 'lucide-react';
import './Explore.css';

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: Smartphone, desc: 'Phones, Laptops, Cameras' },
  { id: 'pets', name: 'Pets', icon: Dog, desc: 'Dogs, Cats, Others' },
  { id: 'wallets', name: 'Wallets', icon: Wallet, desc: 'Purses, Cardholders' },
  { id: 'keys', name: 'Keys', icon: Key, desc: 'Car Keys, Home Keys' },
];

const RECOVERIES = [
  {
    id: 1,
    title: 'Sony Alpha A7III',
    category: 'Electronics',
    time: '2 hours ago',
    desc: 'I lost my camera at Central Park during a photoshoot. Found it through Traceback within...',
    author: 'Sarah M.',
    location: 'New York, NY',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    title: 'Bella the Golden',
    category: 'Pets',
    time: '5 hours ago',
    desc: 'Bella slipped out of her harness. A kind neighbor posted her on Traceback immediately. So...',
    author: 'James L.',
    location: 'Austin, TX',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    title: 'Tan Leather Wallet',
    category: 'Wallets',
    time: 'Yesterday',
    desc: 'I left it on the train. I thought it was gone forever. Traceback\'s alert system is incredible.',
    author: 'Emily R.',
    location: 'Chicago, IL',
    img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400'
  }
];

export default function Explore() {
  return (
    <div className="explore-container">
      {/* Hero Section */}
      <section className="explore-hero">
        <div className="explore-hero-content">
          <h1>Lost something? We'll help you <span className="text-primary">Trace it Back.</span></h1>
          <p className="hero-subtitle">
            The world's most trusted network for reclaiming lost items. 
            Simple, secure, and community-driven recovery for the things that matter most.
          </p>
          
          <div className="hero-search-box">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="What did you lose?" className="hero-search-input" />
            <button className="btn btn-primary search-btn">Search</button>
          </div>
          
          <div className="hero-actions">
            <Link to="/report-lost" className="btn btn-warning text-white">
              <AlertCircle size={18} /> REPORT LOST
            </Link>
            <Link to="/report-found" className="btn btn-outline text-warning border-warning">
              I FOUND SOMETHING
            </Link>
          </div>
        </div>
        
        <div className="explore-hero-image">
          <div className="mock-illustration">
             {/* Using a placeholder gradient card for the illustration shown in the image */}
            <div className="stats-badge">
              <CheckCircle className="text-primary" size={24} />
              <div>
                <strong>14,200+ Items Recovered</strong>
                <p>Join our growing community today.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="explore-categories">
        <div className="section-header">
          <div>
            <h2>Browse by Category</h2>
            <p className="text-secondary">Find what you're looking for in our organized database.</p>
          </div>
          <Link to="/items" className="view-all">View All Categories &rarr;</Link>
        </div>
        
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-icon-wrapper">
                <cat.icon size={28} className="text-primary" />
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Recoveries Section */}
      <section className="explore-recoveries">
        <div className="text-center mb-8">
          <h2>Recent Recoveries</h2>
          <p className="text-secondary">Real stories of things finding their way home.</p>
        </div>
        
        <div className="recoveries-grid">
          {RECOVERIES.map(item => (
            <div key={item.id} className="recovery-card card">
              <div className="recovery-img-container">
                <img src={item.img} alt={item.title} className="recovery-img" />
                <span className="badge badge-reunited">
                  <CheckCircle size={14} /> REUNITED
                </span>
              </div>
              <div className="recovery-content">
                <div className="recovery-meta">
                  <span className="meta-tag">{item.category}</span>
                  <span className="meta-time">• {item.time}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="recovery-desc">"{item.desc}"</p>
                
                <div className="recovery-footer">
                  <div className="author-info">
                    <div className="author-avatar"></div>
                    <span className="author-name">{item.author}</span>
                  </div>
                  <span className="author-location">{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="explore-cta">
        <div className="cta-content">
          <h2>Lost peace of mind? Reclaim it today.</h2>
          <p>Join the TRACEBACK community and increase your chances of recovery by 400% with our automated matching algorithm.</p>
          <div className="cta-actions">
            <button className="btn btn-white">Get Started for Free</button>
            <button className="btn btn-outline-white">Learn How It Works</button>
          </div>
        </div>
      </section>
    </div>
  );
}
