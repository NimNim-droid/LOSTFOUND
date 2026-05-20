import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import './BrowseItems.css';

const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Brown Leather Wallet',
    status: 'lost',
    date: 'Oct 24, 2024 • 2:30 PM',
    location: 'Downtown Transit Center, Seattle',
    img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    title: 'Golden Retriever',
    status: 'found',
    date: 'Oct 23, 2024 • Morning',
    location: 'Discovery Park, North Entrance',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    title: 'Keys with Blue Carabiner',
    status: 'lost',
    date: 'Oct 22, 2024 • 6:00 PM',
    location: 'Green Lake Path, near boat house',
    img: 'https://images.unsplash.com/photo-1584650589255-70783a040b15?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 4,
    title: 'Wireless Earbuds Case',
    status: 'found',
    date: 'Oct 21, 2024',
    location: 'Main Library, 2nd Floor',
    img: null
  }
];

export default function BrowseItems() {
  const [activeFilters, setActiveFilters] = useState({
    lost: true,
    found: true,
    category: 'all',
    dateRange: '30days'
  });

  return (
    <div className="browse-container">
      {/* Sidebar Filters */}
      <aside className="filters-sidebar">
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="btn-reset">Reset</button>
        </div>

        <div className="filter-group">
          <h4 className="filter-title">STATUS</h4>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            Lost
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            Found
          </label>
        </div>

        <div className="filter-group">
          <h4 className="filter-title">CATEGORY</h4>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="flex-1">Electronics</span>
            <span className="count">42</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span className="flex-1">Keys & Wallets</span>
            <span className="count">18</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="flex-1">Pets</span>
            <span className="count">7</span>
          </label>
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="flex-1">Clothing</span>
            <span className="count">24</span>
          </label>
        </div>

        <div className="filter-group border-none">
          <h4 className="filter-title">DATE</h4>
          <select className="form-control" defaultValue="30days">
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="browse-main">
        <div className="browse-header">
          <div>
            <h1>Recent Items</h1>
            <p className="text-secondary">Showing 124 active reports in your area.</p>
          </div>
          <div className="sort-by">
            <span className="text-secondary" style={{fontSize: '0.9rem', marginRight: '0.5rem'}}>Sort by:</span>
            <select className="sort-select">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>
        </div>

        <div className="items-grid">
          {MOCK_ITEMS.map(item => (
            <Link to={`/item/${item.id}`} key={item.id} className="item-card">
              <div className="item-image-container">
                {item.img ? (
                  <img src={item.img} alt={item.title} className="item-image" />
                ) : (
                  <div className="item-image-placeholder">
                    <ImageIcon size={32} className="text-secondary" opacity={0.5} />
                  </div>
                )}
                <span className={`badge item-badge badge-${item.status}`}>
                  <Search size={12} style={{marginRight: '4px'}} /> 
                  {item.status.toUpperCase()}
                </span>
              </div>
              <div className="item-details">
                <h3>{item.title}</h3>
                <p className="item-meta">
                  <Calendar size={14} /> {item.date}
                </p>
                <p className="item-meta">
                  <MapPin size={14} /> {item.location}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="load-more-container">
          <button className="btn btn-outline">Load More Items</button>
        </div>
      </main>
    </div>
  );
}
