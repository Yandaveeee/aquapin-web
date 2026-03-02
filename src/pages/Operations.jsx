import React, { useState, useEffect } from "react";
import client from "../api/client";
import { 
  Fish, 
  Scale, 
  AlertTriangle, 
  Save, 
  Loader2,
  CheckCircle,
  History,
  TrendingDown
} from "lucide-react";

export default function Operations() {
  const [activeTab, setActiveTab] = useState("stocking");
  const [stockings, setStockings] = useState([]);
  const [mortalityHistory, setMortalityHistory] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [ponds, setPonds] = useState([]);

  useEffect(() => {
    loadStockings();
    loadPonds();
    if (activeTab === 'mortality') {
      loadMortalityHistory();
    }
  }, [activeTab]);

  const loadStockings = async () => {
    try {
      const res = await client.get("/api/stocking/active");
      setStockings(res.data);
    } catch (err) {
      console.error("Failed to load stockings");
    }
  };

  const loadPonds = async () => {
    try {
      const res = await client.get("/api/ponds/");
      setPonds(res.data);
    } catch (err) {
      console.error("Failed to load ponds");
    }
  };

  const loadMortalityHistory = async () => {
    // Note: You may need to add this endpoint to your backend
    // For now, we'll show a placeholder
    setMortalityHistory([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      if (activeTab === "stocking") {
        await client.post("/api/stocking/", {
          pond_id: parseInt(formData.pondId),
          fry_type: formData.fryType,
          fry_quantity: parseInt(formData.qty),
          stocking_date: formData.date || new Date().toISOString().split("T")[0],
        });
        setSuccess("Stocking record added successfully!");
      } else if (activeTab === "harvest") {
        await client.post("/api/harvest/", {
          stocking_id: parseInt(formData.stockId),
          total_weight_kg: parseFloat(formData.weight),
          market_price_per_kg: parseFloat(formData.price),
          harvest_date: formData.date || new Date().toISOString().split("T")[0],
          fish_size: formData.fishSize || 'Standard',
        });
        setSuccess("Harvest recorded successfully!");
        loadStockings(); // Refresh active stockings
      } else if (activeTab === "mortality") {
        const res = await client.post("/api/mortality/", {
          stocking_id: parseInt(formData.stockId),
          loss_date: formData.date || new Date().toISOString().split("T")[0],
          quantity_lost: parseInt(formData.qtyLost),
          weight_lost_kg: parseFloat(formData.weightLost) || 0,
          cause: formData.cause,
          action_taken: formData.actionTaken || '',
        });
        setSuccess(`Mortality recorded. ${res.data.solution}`);
      }
      
      setFormData({});
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      alert(err.response?.data?.detail || "Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stocking', label: 'Stocking', icon: Fish, color: 'var(--primary-color)', bgColor: 'var(--primary-light)' },
    { id: 'harvest', label: 'Harvest', icon: Scale, color: 'var(--success-color)', bgColor: 'var(--success-light)' },
    { id: 'mortality', label: 'Mortality', icon: AlertTriangle, color: 'var(--error-color)', bgColor: 'var(--error-light)' },
  ];

  const lossCauses = [
    { value: 'Flood', label: 'Flood / Overflow', desc: 'Heavy rain or water overflow' },
    { value: 'Disease', label: 'Disease', desc: 'Illness or infection in fish' },
    { value: 'Heat', label: 'Heat / Low Oxygen', desc: 'High temperature or oxygen depletion' },
    { value: 'Theft', label: 'Theft / Predator', desc: 'Stolen or eaten by predators' },
    { value: 'Unknown', label: 'Unknown', desc: 'Cause not identified' },
  ];

  const fishSizes = [
    { value: 'Fingerling', label: 'Fingerling (< 50g)' },
    { value: 'Standard', label: 'Standard (50-200g)' },
    { value: 'Large', label: 'Large (> 200g)' },
    { value: 'Market', label: 'Market Size (> 500g)' },
  ];

  return (
    <div>
      <h1 className="page-header">Farm Operations</h1>

      {/* Success Message */}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
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
                border: isActive ? `2px solid ${tab.color}` : '1px solid transparent',
                background: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              <Icon size={24} color={isActive ? tab.color : 'var(--text-tertiary)'} />
              <span style={{
                fontWeight: 600,
                color: isActive ? tab.color : 'var(--text-secondary)',
                fontSize: 16
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          {/* STOCKING FORM */}
          {activeTab === "stocking" && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 8, background: 'var(--primary-light)', borderRadius: 8 }}>
                  <Fish size={24} color="var(--primary-color)" />
                </div>
                New Stocking
              </h3>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Select Pond</label>
                <select 
                  name="pondId" 
                  className="form-input" 
                  onChange={handleChange} 
                  required
                  value={formData.pondId || ''}
                >
                  <option value="">Choose a pond...</option>
                  {ponds.map((pond) => (
                    <option key={pond.id} value={pond.id}>{pond.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Fry Type</label>
                <input 
                  name="fryType" 
                  className="form-input" 
                  placeholder="e.g. Tilapia, Bangus, Shrimp" 
                  onChange={handleChange} 
                  required 
                  value={formData.fryType || ''}
                />
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Quantity (pcs)</label>
                <input 
                  name="qty" 
                  type="number" 
                  className="form-input" 
                  placeholder="Number of fingerlings"
                  onChange={handleChange} 
                  required 
                  value={formData.qty || ''}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Stocking Date</label>
                <input 
                  name="date" 
                  type="date" 
                  className="form-input" 
                  onChange={handleChange}
                  value={formData.date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}

          {/* HARVEST FORM */}
          {activeTab === "harvest" && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 8, background: 'var(--success-light)', borderRadius: 8 }}>
                  <Scale size={24} color="var(--success-color)" />
                </div>
                Record Harvest
              </h3>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Select Fish Batch</label>
                <select 
                  name="stockId" 
                  className="form-input" 
                  onChange={handleChange} 
                  required
                  value={formData.stockId || ''}
                >
                  <option value="">Select stocking batch...</option>
                  {stockings.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || `Stock #${s.id} - ${s.fry_type || 'Unknown'}`}
                    </option>
                  ))}
                </select>
                {stockings.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    No active stockings found. Add a stocking first.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Fish Size Grade</label>
                <select 
                  name="fishSize" 
                  className="form-input" 
                  onChange={handleChange}
                  value={formData.fishSize || 'Standard'}
                >
                  {fishSizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Total Weight (kg)</label>
                <input 
                  name="weight" 
                  type="number" 
                  step="0.1"
                  className="form-input" 
                  placeholder="Total harvest weight"
                  onChange={handleChange} 
                  required 
                  value={formData.weight || ''}
                />
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Price (₱/kg)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="Market price per kg"
                  onChange={handleChange} 
                  required 
                  value={formData.price || ''}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Harvest Date</label>
                <input 
                  name="date" 
                  type="date" 
                  className="form-input" 
                  onChange={handleChange}
                  value={formData.date || new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}

          {/* MORTALITY FORM */}
          {activeTab === "mortality" && (
            <>
              <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 8, background: 'var(--error-light)', borderRadius: 8 }}>
                  <TrendingDown size={24} color="var(--error-color)" />
                </div>
                Report Loss / Mortality
              </h3>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Select Fish Batch</label>
                <select 
                  name="stockId" 
                  className="form-input" 
                  onChange={handleChange} 
                  required
                  value={formData.stockId || ''}
                >
                  <option value="">Select stocking batch...</option>
                  {stockings.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || `Stock #${s.id} - ${s.fry_type || 'Unknown'}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Cause of Loss</label>
                <select 
                  name="cause" 
                  className="form-input" 
                  onChange={handleChange} 
                  required
                  value={formData.cause || ''}
                >
                  <option value="">Select cause...</option>
                  {lossCauses.map((cause) => (
                    <option key={cause.value} value={cause.value}>
                      {cause.label}
                    </option>
                  ))}
                </select>
                {formData.cause && (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {lossCauses.find(c => c.value === formData.cause)?.desc}
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Quantity Lost (pcs)</label>
                <input 
                  name="qtyLost" 
                  type="number" 
                  className="form-input" 
                  placeholder="Number of fish lost"
                  onChange={handleChange} 
                  required 
                  value={formData.qtyLost || ''}
                />
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Estimated Weight Lost (kg)</label>
                <input 
                  name="weightLost" 
                  type="number" 
                  step="0.1"
                  className="form-input" 
                  placeholder="Approximate weight (optional)"
                  onChange={handleChange}
                  value={formData.weightLost || ''}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Date of Loss</label>
                <input 
                  name="date" 
                  type="date" 
                  className="form-input" 
                  onChange={handleChange}
                  value={formData.date || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 500 }}>Action Taken (Optional)</label>
                <textarea 
                  name="actionTaken" 
                  className="form-input" 
                  rows="3"
                  placeholder="What did you do to address this?"
                  onChange={handleChange}
                  value={formData.actionTaken || ''}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Info Box */}
              <div style={{
                background: 'var(--warning-light)',
                border: '1px solid var(--warning-color)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <AlertTriangle size={18} color="var(--warning-color)" style={{ marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--warning-color)' }}>
                  <strong>Important:</strong> Reporting losses helps track mortality rates 
                  and improves AI recommendations for your farm.
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: 16, 
              justifyContent: 'center',
              background: activeTab === 'mortality' ? 'var(--error-color)' : undefined
            }} 
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Saving...</>
            ) : (
              <><Save size={18} /> Save Record</>
            )}
          </button>
        </form>
      </div>

      {/* Quick Stats */}
      <div className="card-grid" style={{ marginTop: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Fish size={32} color="var(--primary-color)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stockings.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Active Stockings</div>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <History size={32} color="var(--success-color)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 700 }}>View</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>History Logs</div>
        </div>

        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveTab('mortality')}>
          <AlertTriangle size={32} color="var(--error-color)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 24, fontWeight: 700 }}>Report</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Losses</div>
        </div>
      </div>
    </div>
  );
}
