import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Scale, AlertTriangle, Sprout, ArrowUpRight, Plus, Map } from 'lucide-react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client.get('/api/analytics/summary')
      .then(res => setData(res.data))
      .catch(err => {
          console.error(err);
          setError("Could not load analytics. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
      <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{color: 'var(--text-tertiary)'}}>Loading Analytics...</div>
      </div>
  );

  if (error) return (
       <div style={{textAlign: 'center', padding: 40, color: 'var(--error-color)'}}>
          <AlertTriangle size={48} style={{marginBottom: 16}} />
          <h3>{error}</h3>
       </div>
  );

  // Check if it's a fresh account (no revenue, no harvest)
  const isEmpty = !data || (data.total_revenue === 0 && data.total_kg === 0 && data.total_loss_qty === 0);

  if (isEmpty) {
      return (
          <div style={{textAlign: 'center', padding: '60px 20px', maxWidth: 600, margin: '0 auto'}}>
              <div style={{
                  background: 'var(--primary-light)', 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px auto'
              }}>
                  <Sprout color="var(--primary-color)" size={40} />
              </div>
              <h1 className="page-header" style={{fontSize: 32, marginBottom: 16}}>Welcome to AquaPin!</h1>
              <p style={{color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40, lineHeight: 1.6}}>
                  Your farm dashboard is looking a bit empty. <br/>
                  Start by mapping your first pond to begin tracking your aquaculture success.
              </p>
              
              <button 
                className="btn btn-primary" 
                style={{padding: '16px 32px', fontSize: 18}}
                onClick={() => navigate('/map')}
              >
                  <Map size={24} /> Map Your First Pond
              </button>
          </div>
      );
  }

  const chartData = data.yearly_chart?.labels.map((label, index) => ({
    name: label,
    kg: data.yearly_chart.data[index]
  })) || [];

  return (
    <div>
      <h1 className="page-header">Farm Overview</h1>
      
      {/* KPI Cards Grid */}
      <div className="card-grid">
        {/* Revenue Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Revenue</span>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success-color)', marginTop: 8 }}>
                    ₱{data.total_revenue?.toLocaleString()}
                </div>
              </div>
              <div style={{background: 'var(--success-light)', padding: 12, borderRadius: 12}}>
                <TrendingUp size={24} color="var(--success-color)" />
              </div>
          </div>
          <div style={{display:'flex', gap: 6, marginTop: 16, fontSize: 13, color: 'var(--success-color)', fontWeight: 500}}>
             <ArrowUpRight size={16}/> +12% from last month
          </div>
        </div>

        {/* Harvest Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Harvest</span>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary-color)', marginTop: 8 }}>
                    {data.total_kg?.toLocaleString()} <span style={{fontSize: 18, color: 'var(--text-tertiary)'}}>kg</span>
                </div>
              </div>
              <div style={{background: 'var(--primary-light)', padding: 12, borderRadius: 12}}>
                <Scale size={24} color="var(--primary-color)" />
              </div>
          </div>
          <div style={{marginTop: 16, fontSize: 13, color: 'var(--text-tertiary)'}}>
             Across all ponds
          </div>
        </div>

        {/* Loss Card */}
        <div className="card" style={{ borderLeft: '4px solid var(--error-color)' }}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Mortality</span>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--error-color)', marginTop: 8 }}>
                    {data.total_loss_qty?.toLocaleString()} <span style={{fontSize: 18, color: 'var(--text-tertiary)'}}>pcs</span>
                </div>
              </div>
              <div style={{background: 'var(--error-light)', padding: 12, borderRadius: 12}}>
                <AlertTriangle size={24} color="var(--error-color)" />
              </div>
          </div>
          <div style={{marginTop: 16, fontSize: 13, color: 'var(--error-color)'}}>
             Requires attention
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Main Chart */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', marginBottom: 24}}>
            <h3 style={{margin:0, fontSize: 18}}>Production Trends</h3>
            <select className="form-input" style={{width: 'auto', marginTop: 0, padding: '4px 12px'}}>
                <option>This Year</option>
                <option>Last Year</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-lg)'}} 
                />
                <Area type="monotone" dataKey="kg" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorKg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation Box */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1px solid #FED7AA' }}>
          <div style={{display:'flex', alignItems:'center', gap: 12, marginBottom: 16}}>
            <div style={{background: 'rgba(234, 88, 12, 0.1)', padding: 8, borderRadius: 50}}>
                <Sprout color="#EA580C" size={24} />
            </div>
            <h3 style={{margin:0, color: '#9A3412', fontSize: 18}}>AI Advisor</h3>
          </div>
          <p style={{ lineHeight: '1.6', color: '#9A3412', marginBottom: 24 }}>
            {data.system_recommendation || "System is analyzing your recent harvest data to provide optimal stocking dates for the next cycle."}
          </p>
          <button className="btn" style={{width: '100%', background: 'white', color: '#EA580C', border: '1px solid #FED7AA', justifyContent: 'center'}}>
            View Full Report
          </button>
        </div>

      </div>
    </div>
  );
}
