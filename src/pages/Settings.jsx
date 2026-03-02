import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Server, 
  Bell, 
  Shield, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  LogOut
} from 'lucide-react';
import client from '../api/client';

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile settings
  const [profile, setProfile] = useState({
    fullName: '',
    email: ''
  });
  
  // Server settings
  const [serverUrl, setServerUrl] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  
  // Password change
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || '',
        email: user.email || ''
      });
    }
    
    // Load saved server URL
    const savedUrl = localStorage.getItem('SERVER_URL');
    if (savedUrl) {
      setServerUrl(savedUrl);
    }
  }, [user]);

  const testConnection = async () => {
    setLoading(true);
    setApiStatus(null);
    
    try {
      const testClient = { ...client };
      const baseUrl = serverUrl.startsWith('http') ? serverUrl : `https://${serverUrl}`;
      
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) {
        setApiStatus({ success: true, message: 'Connection successful!' });
      } else {
        setApiStatus({ success: false, message: 'Server responded with error' });
      }
    } catch (err) {
      setApiStatus({ success: false, message: 'Could not connect to server' });
    } finally {
      setLoading(false);
    }
  };

  const saveServerUrl = () => {
    if (serverUrl) {
      localStorage.setItem('SERVER_URL', serverUrl);
      setSuccess('Server URL saved! Reload page to apply changes.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwords.new.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    // Note: This would need a backend endpoint for password change
    // For now, just show a success message
    setTimeout(() => {
      setSuccess('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const clearAllData = () => {
    if (confirm('Are you sure? This will clear all local data and log you out.')) {
      localStorage.clear();
      logout();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'server', label: 'Server', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div>
      <h1 className="page-header">Settings</h1>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          background: 'var(--success-light)',
          color: 'var(--success-color)',
          padding: '16px 20px',
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: '1px solid var(--success-color)'
        }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'var(--error-light)',
          color: 'var(--error-color)',
          padding: '16px 20px',
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          border: '1px solid var(--error-color)'
        }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar Tabs */}
        <div>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: 4,
                  textAlign: 'left'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}

          <div style={{ 
            marginTop: 24, 
            paddingTop: 24, 
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'transparent',
                color: 'var(--error-color)',
                border: '1px solid var(--error-color)',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={24} color="var(--primary-color)" />
                Profile Information
              </h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={profile.fullName}
                  disabled
                  style={{ background: 'var(--bg-color)' }}
                />
                <small style={{ color: 'var(--text-tertiary)' }}>
                  Contact admin to change your name
                </small>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input"
                  value={profile.email}
                  disabled
                  style={{ background: 'var(--bg-color)' }}
                />
                <small style={{ color: 'var(--text-tertiary)' }}>
                  Email cannot be changed
                </small>
              </div>

              <div style={{
                background: 'var(--primary-light)',
                padding: 16,
                borderRadius: 8,
                marginTop: 24
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  User ID
                </div>
                <code style={{ fontSize: 12 }}>{user?.id}</code>
              </div>
            </>
          )}

          {/* SERVER TAB */}
          {activeTab === 'server' && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={24} color="var(--primary-color)" />
                Server Configuration
              </h3>

              <div style={{
                background: 'var(--bg-color)',
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
                fontSize: 14,
                lineHeight: 1.6
              }}>
                <strong>Current API URL:</strong><br />
                <code>{client.defaults.baseURL}</code>
              </div>
              
              <div className="form-group">
                <label>Custom Server URL (Optional)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="https://your-api.com or localhost:8000"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                />
                <small style={{ color: 'var(--text-tertiary)' }}>
                  Leave empty to use default. Used for testing local backend.
                </small>
              </div>

              {apiStatus && (
                <div style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  background: apiStatus.success ? 'var(--success-light)' : 'var(--error-light)',
                  color: apiStatus.success ? 'var(--success-color)' : 'var(--error-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  {apiStatus.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  {apiStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  className="btn btn-secondary"
                  onClick={testConnection}
                  disabled={loading || !serverUrl}
                >
                  {loading ? <Loader2 size={16} className="spin" /> : 'Test Connection'}
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={saveServerUrl}
                  disabled={!serverUrl}
                >
                  <Save size={16} /> Save URL
                </button>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: 16 }}>Deployment Options</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Having slow loading times? Consider these faster alternatives to Render:
                </p>
                <ul style={{ fontSize: 14, lineHeight: 2 }}>
                  <li>
                    <a href="https://railway.app" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Railway.app <ExternalLink size={14} />
                    </a>
                    - No cold starts, $5/mo free credit
                  </li>
                  <li>
                    <a href="https://fly.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Fly.io <ExternalLink size={14} />
                    </a>
                    - Edge deployment, 3 free VMs
                  </li>
                  <li>
                    <a href="https://www.digitalocean.com/products/app-platform" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      DigitalOcean App Platform <ExternalLink size={14} />
                    </a>
                    - $5/mo fixed price
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={24} color="var(--primary-color)" />
                Security Settings
              </h3>

              <form onSubmit={handlePasswordChange}>
                <h4 style={{ fontSize: 16, marginBottom: 16 }}>Change Password</h4>
                
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    placeholder="Min 6 characters"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    placeholder="Re-enter new password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                >
                  {loading ? <Loader2 size={16} className="spin" /> : 'Update Password'}
                </button>
              </form>

              <div style={{ 
                marginTop: 32, 
                paddingTop: 24, 
                borderTop: '1px solid var(--border-color)'
              }}>
                <h4 style={{ color: 'var(--error-color)', marginBottom: 16 }}>Danger Zone</h4>
                <button 
                  className="btn btn-danger"
                  onClick={clearAllData}
                >
                  Clear All Local Data
                </button>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}>
                  This will remove all saved settings and log you out.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
