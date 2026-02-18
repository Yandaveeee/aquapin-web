import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ArrowLeft, Fish, Scale, Droplets, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PondDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pond, setPond] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pondRes, historyRes] = await Promise.all([
          client.get(`/api/ponds/${id}`),
          client.get(`/api/history/${id}`)
        ]);
        setPond(pondRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Error fetching pond details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!pond) return <div>Pond not found</div>;

  const chartData = [...history].reverse().map(item => ({
    date: item.harvest_date,
    revenue: item.revenue,
    weight: item.total_weight_kg
  }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate('/map')} className="btn" style={{ padding: 8, background: 'white', border: '1px solid var(--border-color)' }}>
          <ArrowLeft size={20} color="var(--text-secondary)" />
        </button>
        <div>
          <h1 className="page-header" style={{ marginBottom: 4 }}>{pond.name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{pond.location_desc || "No location description"}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
            <span className="btn btn-success" style={{fontSize: 12, padding: '4px 12px', borderRadius: 20}}>
                {pond.total_fish > 0 ? 'Active' : 'Empty'}
            </span>
        </div>
      </div>

      <div className="card-grid" style={{marginBottom: 24}}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase'}}>Current Stock</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-color)', marginTop: 8 }}>
                    {pond.total_fish?.toLocaleString() || 0} pcs
                </div>
              </div>
              <Fish size={24} color="var(--primary-color)" />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase'}}>Last Stocked</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success-color)', marginTop: 8 }}>
                   {pond.last_stocked_at ? new Date(pond.last_stocked_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <Calendar size={24} color="var(--success-color)" />
          </div>
        </div>
        
         <div className="card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
              <div>
                <span style={{fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase'}}>Species</span>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning-color)', marginTop: 8 }}>
                   {pond.current_fish_type || "None"}
                </div>
              </div>
              <Droplets size={24} color="var(--warning-color)" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        <div className="card">
            <h3 style={{marginBottom: 20, fontSize: 18}}>Harvest History</h3>
            {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-tertiary)', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="var(--success-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)'}}>
                    No harvest history available yet.
                </div>
            )}
        </div>

        <div className="card">
            <h3 style={{marginBottom: 20, fontSize: 18}}>Recent Logs</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                {history.length > 0 ? history.slice(0, 5).map((item, index) => (
                    <div key={index} style={{ 
                        paddingBottom: 12, 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{fontWeight: 600, fontSize: 14}}>{new Date(item.harvest_date).toLocaleDateString()}</div>
                            <div style={{fontSize: 12, color: 'var(--text-tertiary)'}}>{item.fry_type} • {item.total_weight_kg}kg</div>
                        </div>
                        <div style={{fontWeight: 700, color: 'var(--success-color)', fontSize: 14}}>
                            +₱{item.revenue.toLocaleString()}
                        </div>
                    </div>
                )) : (
                    <div style={{color: 'var(--text-tertiary)', fontStyle: 'italic', fontSize: 14}}>No recent records</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
