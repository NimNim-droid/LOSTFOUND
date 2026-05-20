import { Link } from 'react-router-dom';
import { Search, PlusCircle, AlertCircle, MapPin, Clock, MessageSquare, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  // Mock data for a specific user's dashboard
  const myReports = [
    { id: '1', title: 'Car Keys (Honda)', type: 'lost', status: 'searching', date: 'Oct 24', matches: 1 },
    { id: '2', title: 'Blue Hydroflask', type: 'found', status: 'returned', date: 'Oct 15', matches: 0 },
  ];

  const smartMatches = [
    { id: '3', title: 'Found: Honda Keys', location: 'Parking Lot B', time: '1 hour ago', matchFor: 'Car Keys (Honda)' },
  ];

  const recentMessages = [
    { id: '1', from: 'Sarah M.', item: 'Car Keys (Honda)', msg: 'Hi, I think I found your keys!', time: '10 mins ago', unread: true }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome & Quick Stats */}
      <div className="dashboard-header mb-8">
        <div className="welcome-section">
          <h1>Welcome back, <span className="text-primary">{user?.name || 'User'}</span></h1>
          <p className="text-secondary">Here is what's happening with your items today.</p>
        </div>
        <div className="quick-actions">
          <Link to="/report-lost" className="btn btn-warning text-white">
            <AlertCircle size={18} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-primary">
            <PlusCircle size={18} /> Report Found
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: My Reports & Matches */}
        <div className="dashboard-main">
          
          {/* Smart Matches Alert Box */}
          {smartMatches.length > 0 && (
            <section className="dashboard-card border-warning bg-warning-light mb-8">
              <div className="card-header">
                <h3 className="flex-items-center text-warning" style={{gap: '0.5rem', margin: 0}}>
                  <Bell size={20} /> 
                  Action Required: Potential Matches
                </h3>
              </div>
              <div className="card-body">
                <p className="mb-4">We found items that match your active reports. Please review them.</p>
                {smartMatches.map(match => (
                  <div key={match.id} className="match-alert-item">
                    <div>
                      <span className="badge badge-found mb-2">Potential Match For: {match.matchFor}</span>
                      <h4>{match.title}</h4>
                      <p className="text-secondary flex-items-center" style={{gap: '0.5rem', fontSize: '0.85rem'}}>
                        <MapPin size={14}/> {match.location} • <Clock size={14}/> {match.time}
                      </p>
                    </div>
                    <Link to={`/item/${match.id}`} className="btn btn-outline border-warning text-warning">Review Match</Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* My Reports */}
          <section className="dashboard-card">
            <div className="card-header border-bottom">
              <h3>My Active Reports</h3>
            </div>
            <div className="reports-list">
              {myReports.map(report => (
                <div key={report.id} className="report-list-item">
                  <div className="report-info">
                    <span className={`badge badge-${report.type === 'lost' ? 'lost' : 'found'} mb-2`}>
                      {report.type.toUpperCase()}
                    </span>
                    <h4>{report.title}</h4>
                    <span className="text-secondary" style={{fontSize: '0.85rem'}}>Reported on {report.date}</span>
                  </div>
                  
                  <div className="report-status">
                    {report.status === 'searching' ? (
                      <span className="status-indicator searching">
                        <span className="dot"></span> Searching
                      </span>
                    ) : (
                      <span className="status-indicator returned flex-items-center" style={{gap: '0.25rem', color: '#10b981'}}>
                        <CheckCircle size={16} /> Returned
                      </span>
                    )}
                    
                    {report.matches > 0 && (
                      <span className="match-count text-warning">
                        {report.matches} Potential Match
                      </span>
                    )}
                  </div>
                  
                  <div className="report-actions">
                    <Link to={`/item/${report.id}`} className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Messages & Stats */}
        <div className="dashboard-sidebar">
          
          <section className="dashboard-card mb-8">
            <div className="card-header border-bottom flex-between">
              <h3>Messages</h3>
              <span className="badge" style={{background: 'var(--primary-color)', color: 'white'}}>{recentMessages.length} New</span>
            </div>
            <div className="messages-list">
              {recentMessages.map(msg => (
                <div key={msg.id} className={`message-item ${msg.unread ? 'unread' : ''}`}>
                  <div className="message-header flex-between">
                    <strong>{msg.from}</strong>
                    <span className="text-secondary" style={{fontSize: '0.75rem'}}>{msg.time}</span>
                  </div>
                  <p className="text-secondary" style={{fontSize: '0.85rem', marginBottom: '0.25rem'}}>Re: {msg.item}</p>
                  <p className="message-preview text-primary">{msg.msg}</p>
                </div>
              ))}
              <Link to="/messages" className="view-all-link">View All Messages &rarr;</Link>
            </div>
          </section>

          <section className="dashboard-card bg-primary-light">
            <div className="card-body text-center">
              <h3 className="text-primary mb-2">Community Impact</h3>
              <h1 className="text-primary mb-2" style={{fontSize: '3rem'}}>1</h1>
              <p className="text-secondary">Items successfully returned to their owners thanks to you!</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}