import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  X,
  TrendingUp,
  Calculator,
  Loader2,
  Sprout
} from 'lucide-react';

// ==================== AI CHAT COMPONENT ====================
function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await client.get('/api/chat/history');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load chat history');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg = { 
      id: Date.now(), 
      sender: 'user', 
      text: userMsg || '(Image attached)',
      image: selectedImage?.name,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const formData = new FormData();
      formData.append('message', userMsg);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await client.post('/api/chat/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.response,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        paddingBottom: 16, 
        borderBottom: '1px solid var(--border-color)',
        marginBottom: 16
      }}>
        <div style={{ 
          background: 'var(--primary-light)', 
          padding: 10, 
          borderRadius: 12 
        }}>
          <Brain color="var(--primary-color)" size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>AquaBot AI Assistant</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
            Ask about fish health, pond management, or upload photos for analysis
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-tertiary)',
            padding: '40px 20px'
          }}>
            <Sprout size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>Start a conversation with AquaBot!</p>
            <p style={{ fontSize: 12 }}>Try: "What causes green water?" or "How much should I feed my tilapia?"</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`chat-message ${msg.sender}`}
          >
            {msg.image && (
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                📎 {msg.image}
              </div>
            )}
            {msg.text}
          </div>
        ))}
        
        {loading && (
          <div className="chat-message bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Loader2 size={16} className="spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-container">
        {selectedImage && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '4px 12px',
            background: 'var(--primary-light)',
            borderRadius: 16,
            fontSize: 12
          }}>
            <ImageIcon size={14} />
            {selectedImage.name}
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: 2
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        <label style={{ cursor: 'pointer', padding: 8 }}>
          <ImageIcon size={20} color="var(--text-tertiary)" />
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </label>
        
        <input
          type="text"
          className="chat-input"
          placeholder="Ask AquaBot anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        
        <button 
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading || (!input.trim() && !selectedImage)}
          style={{ padding: '10px 16px' }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

// ==================== YIELD PREDICTOR COMPONENT ====================
function YieldPredictor() {
  const [formData, setFormData] = useState({
    fry_quantity: '',
    days_cultured: '',
    area_sqm: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await client.post('/api/predict/', {
        fry_quantity: parseInt(formData.fry_quantity),
        days_cultured: parseInt(formData.days_cultured),
        area_sqm: parseFloat(formData.area_sqm)
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: 24 
      }}>
        <div style={{ 
          background: 'var(--success-light)', 
          padding: 10, 
          borderRadius: 12 
        }}>
          <TrendingUp color="var(--success-color)" size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>Yield Predictor</h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
            AI-powered harvest estimation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fry Quantity (pcs)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 10000"
            value={formData.fry_quantity}
            onChange={(e) => setFormData({...formData, fry_quantity: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Days to Culture</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 120"
            value={formData.days_cultured}
            onChange={(e) => setFormData({...formData, days_cultured: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Pond Area (m²)</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g., 1000"
            value={formData.area_sqm}
            onChange={(e) => setFormData({...formData, area_sqm: e.target.value})}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-success"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Calculating...</>
          ) : (
            <><Calculator size={18} /> Predict Yield</>
          )}
        </button>
      </form>

      {error && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: 'var(--error-light)', 
          color: 'var(--error-color)',
          borderRadius: 8,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {result && (
        <div className="prediction-result" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Predicted Harvest
          </div>
          <div className="prediction-value">
            {result.predicted_yield_kg} <span style={{ fontSize: 24 }}>kg</span>
          </div>
          <div style={{ 
            marginTop: 16, 
            paddingTop: 16, 
            borderTop: '1px solid var(--success-color)',
            fontSize: 18,
            color: 'var(--success-color)'
          }}>
            Est. Revenue: <strong>₱{result.estimated_revenue.toLocaleString()}</strong>
          </div>
          <div style={{ 
            marginTop: 12, 
            fontSize: 12, 
            color: 'var(--text-tertiary)',
            fontStyle: 'italic'
          }}>
            Based on historical data and pond conditions
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN AI TOOLS PAGE ====================
export default function AI_Tools() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'predict', label: 'Yield Predictor', icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="page-header">AI Tools</h1>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="card"
              style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: isActive ? '2px solid var(--primary-color)' : '1px solid transparent',
                background: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              <Icon 
                size={24} 
                color={isActive ? 'var(--primary-color)' : 'var(--text-tertiary)'} 
              />
              <span style={{
                fontWeight: 600,
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontSize: 16
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && <AIChat />}
      {activeTab === 'predict' && <YieldPredictor />}
    </div>
  );
}
