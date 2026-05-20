import { ShieldCheck } from 'lucide-react';
import './Forms.css';

export default function FoundForm() {
  return (
    <div className="form-page-container" style={{maxWidth: '800px', display: 'block'}}>
      <h1 className="mb-8">Report a Found Item</h1>
      
      <form className="card form-card">
        <div className="form-group">
          <label className="form-label">What did you find?</label>
          <input type="text" className="form-control" placeholder="e.g., iPhone 13" />
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
            <label className="form-label">Date Found</label>
            <input type="date" className="form-control" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Where did you find it?</label>
          <input type="text" className="form-control" placeholder="e.g., On a bench in the park" />
        </div>

        <div className="verification-section">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <ShieldCheck className="text-primary" />
            Security Verification
          </h3>
          <p className="text-secondary" style={{fontSize: '0.9rem', marginBottom: '1rem'}}>
            Add a question only the true owner could answer. Do not upload photos that reveal this information.
          </p>
          
          <div className="form-group">
            <label className="form-label">Verification Question</label>
            <input type="text" className="form-control" placeholder="e.g., What is the lock screen wallpaper?" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Current Location of Item</label>
          <select className="form-control">
            <option>I have it with me</option>
            <option>Turned in to Front Desk / Security</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-4">
          Submit Found Report
        </button>
      </form>
    </div>
  );
}
