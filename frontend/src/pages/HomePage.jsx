import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <Navigation />
      <div className="home-container">
        <h1>Welcome to TeamStash OAuth Prototype</h1>
        <div className="user-info">
          <h2>User Information</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
        </div>
        <div className="info-section">
          <h2>About This Prototype</h2>
          <p>This is a demonstration of OAuth-based authentication architecture where:</p>
          <ul>
            <li>Web users authenticate via traditional session-based login (what you're using now)</li>
            <li>External programs (browser extensions, plugins) authenticate using OAuth</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
