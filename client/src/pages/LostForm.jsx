import { useState } from 'react';
import { Search } from 'lucide-react';
import './Forms.css';

export default function LostForm() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="form-page-container">
      <div className="form-main">
        <h1 className="mb-8">Report a Lost Item</h1>
        
        <form className="card form-card">
          <div className="form-group">
            <label className="form-label">What did you lose?</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g., Black iPhone 13 with blue case"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select className="form-control">
                <option>Electronics</option>
                <option>Wallet/ID</option>
                <option>Keys</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Date Lost</label>
              <input type="date" className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Last Known Location</label>
            <input type="text" className="form-control" placeholder="e.g., Main Library, 2nd Floor" />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Details</label>
            <textarea className="form-control" rows="4" placeholder="Any distinguishing marks, serial numbers, etc."></textarea>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4">
            Submit Lost Report
          </button>
        </form>
      </div>

      <div className="form-sidebar">
        <div className="card smart-match-card">
          <div className="smart-match-header">
            <Search size={20} className="text-primary" />
            <h3>Smart Match</h3>
          </div>
          <p className="text-secondary" style={{fontSize: '0.9rem', marginBottom: '1rem'}}>
            As you type, we'll show potential matches from recently found items.
          </p>
          
          {searchTerm.length > 2 ? (
            <div className="match-results">
              <div className="match-item">
                <h4>Black iPhone 13</h4>
                <p>Found at Central Library • 2h ago</p>
                <span className="badge badge-found">Found</span>
              </div>
            </div>
          ) : (
            <div className="match-empty">
              Type to see potential matches...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
