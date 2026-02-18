import React, { useState, useEffect } from "react";
import client from "../api/client";
import { Fish, Scale, AlertTriangle, Save } from "lucide-react";

export default function Operations() {
  const [activeTab, setActiveTab] = useState("stocking");
  const [stockings, setStockings] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get("/api/stocking/active").then((res) => setStockings(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === "stocking") {
        await client.post("/api/stocking/", {
          pond_id: formData.pondId,
          fry_type: formData.fryType,
          fry_quantity: formData.qty,
          stocking_date: new Date().toISOString().split("T")[0],
        });
        alert("Stocking Added!");
      } else if (activeTab === "harvest") {
        await client.post("/api/harvest/", {
          stocking_id: formData.stockId,
          total_weight_kg: formData.weight,
          market_price_per_kg: formData.price,
          harvest_date: new Date().toISOString().split("T")[0],
        });
        alert("Harvest Recorded!");
      }
      setFormData({});
    } catch (err) {
      alert("Error submitting form");
    } finally {
        setLoading(false);
    }
  };

  const tabs = [
      { id: 'stocking', label: 'Stocking', icon: Fish, color: 'var(--primary-color)' },
      { id: 'harvest', label: 'Harvest', icon: Scale, color: 'var(--success-color)' },
      { id: 'mortality', label: 'Mortality', icon: AlertTriangle, color: 'var(--error-color)' },
  ];

  return (
    <div>
      <h1 className="page-header">Farm Operations</h1>

      <div style={{display: 'flex', gap: 12, marginBottom: 32}}>
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
              )
          })}
      </div>

      <div className="card" style={{maxWidth: 600, margin: '0 auto'}}>
        <form onSubmit={handleSubmit}>
          {activeTab === "stocking" && (
            <>
              <h3 style={{marginBottom: 24, display:'flex', alignItems:'center', gap: 10}}>
                  <div style={{padding:8, background: 'var(--primary-light)', borderRadius: 8}}>
                    <Fish size={24} color="var(--primary-color)"/>
                  </div>
                  New Stocking
              </h3>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Pond ID</label>
                <input name="pondId" className="form-input" onChange={handleChange} required placeholder="Enter Pond ID" />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Fry Type</label>
                <input name="fryType" className="form-input" placeholder="e.g. Tilapia" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Quantity (pcs)</label>
                <input name="qty" type="number" className="form-input" onChange={handleChange} required />
              </div>
            </>
          )}

          {activeTab === "harvest" && (
            <>
              <h3 style={{marginBottom: 24, display:'flex', alignItems:'center', gap: 10}}>
                  <div style={{padding:8, background: 'var(--success-light)', borderRadius: 8}}>
                    <Scale size={24} color="var(--success-color)"/>
                  </div>
                  Record Harvest
              </h3>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Select Batch</label>
                <select name="stockId" className="form-input" onChange={handleChange} required>
                  <option value="">Select Fish Batch...</option>
                  {stockings.map((s) => (
                    <option key={s.id} value={s.id}>{s.label || `Stock #${s.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Total Weight (kg)</label>
                <input name="weight" type="number" className="form-input" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 500}}>Price (₱/kg)</label>
                <input name="price" type="number" className="form-input" onChange={handleChange} required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: 16, justifyContent: 'center'}} disabled={loading}>
            <Save size={18}/> {loading ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
