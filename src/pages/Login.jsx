import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, Fish } from 'lucide-react';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
        return setError("Please fill in all required fields.");
    }
    if (isRegistering && !formData.fullName) {
        return setError("Please enter your full name.");
    }
    
    setLoading(true);
    let result;
    
    if (isRegistering) {
        result = await register(formData.email, formData.password, formData.fullName);
    } else {
        result = await login(formData.email, formData.password);
    }
    
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, #FFFFFF 100%)',
        padding: '20px'
    }}>
      <div className="card" style={{
          width: '100%', 
          maxWidth: '420px', 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Logo / Icon */}
        <div style={{
            background: 'var(--primary-light)', 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)'
        }}>
            <Fish color="var(--primary-color)" size={40} strokeWidth={1.5} />
        </div>
        
        <h1 style={{fontSize: '28px', marginBottom: '8px', color: 'var(--primary-dark)'}}>
            {isRegistering ? "Create Account" : "Welcome Back"}
        </h1>
        <p style={{color: 'var(--text-secondary)', marginBottom: '32px'}}>
          {isRegistering ? "Join AquaPin to manage your farm" : "Enter your credentials to access your farm"}
        </p>

        {error && (
            <div style={{
                background: 'var(--error-light)', 
                color: 'var(--error-color)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '24px',
                fontSize: '14px',
                border: '1px solid currentColor'
            }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
             <div className="form-group" style={{textAlign: 'left'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500}}>
                    <User size={18} /> Full Name
                </label>
                <input
                name="fullName"
                type="text"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                />
            </div>
          )}

          <div className="form-group" style={{textAlign: 'left'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500}}>
                <Mail size={18} /> Email Address
            </label>
            <input
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group" style={{textAlign: 'left'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500}}>
                <Lock size={18} /> Password
            </label>
            <input
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', padding: '14px', justifyContent: 'center', fontSize: '16px', marginTop: '16px'}}
            disabled={loading}
          >
            {loading ? <Loader2 className="spin" size={20}/> : (
                <>
                    {isRegistering ? "Create Account" : "Sign In"} <ArrowRight size={20} />
                </>
            )}
          </button>
        </form>
        
        <div style={{marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)'}}>
            <p style={{fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 16}}>
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="btn" 
                style={{
                    width: '100%', 
                    background: 'white', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-secondary)',
                    justifyContent: 'center'
                }}
            >
                {isRegistering ? "Sign In instead" : "Create New Account"}
            </button>
        </div>

      </div>
    </div>
  );
}
