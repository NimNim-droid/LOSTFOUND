import { useParams, Link } from 'react-router-dom';
import { MessageSquare, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  
  // Mock data simulation based on route
  const isFound = id === '1' || id === '2';

  return (
    <div className="detail-container">
      <div className="detail-header mb-8">
        <Link to="/" className="text-secondary" style={{textDecoration: 'underline'}}>&larr; Back to Dashboard</Link>
        <div className="title-row mt-4">
          <h1>{isFound ? 'Black iPhone 13' : 'Car Keys (Honda)'}</h1>
          <span className={`badge badge-${isFound ? 'found' : 'searching'} badge-lg`}>
            {isFound ? 'Found' : 'Searching'}
          </span>
        </div>
        <p className="text-secondary">Reported 2 hours ago • Reference ID: #{id}8832A</p>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card mb-8 p-6">
            <h3>Item Details</h3>
            <div className="info-grid mt-4">
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{isFound ? 'Electronics' : 'Keys'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value"><MapPin size={16}/> {isFound ? 'Central Library' : 'Parking Lot B'}</span>
              </div>
            </div>
            
            <h4 className="mt-8 mb-4">Description</h4>
            <p className="text-secondary">
              Black case with a small scratch on the bottom right corner.
            </p>

            {isFound && (
              <div className="verification-box mt-8">
                <div className="flex-row">
                  <ShieldCheck className="text-primary" size={24} />
                  <div>
                    <h4>Verification Required</h4>
                    <p>To claim this item, you must answer: "What is the lock screen wallpaper?"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card chat-card">
            <div className="chat-header">
              <MessageSquare size={20} />
              <h3>Secure Chat</h3>
            </div>
            <div className="chat-body">
              <div className="chat-message received">
                <p>Hello, I believe this is my item.</p>
                <span className="chat-time">10:42 AM</span>
              </div>
              <div className="chat-message sent">
                <p>Hi! Can you answer the verification question?</p>
                <span className="chat-time">10:45 AM</span>
              </div>
            </div>
            <div className="chat-input-area">
              <input type="text" className="form-control" placeholder="Type a message..." />
              <button className="btn btn-primary">Send</button>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="btn btn-outline w-100" style={{borderColor: '#10b981', color: '#10b981'}}>
              <CheckCircle size={18} /> Mark as Returned
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
