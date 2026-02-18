import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Polygon, DrawingManager } from '@react-google-maps/api';
import { Map, Save, Trash2, Plus } from 'lucide-react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)'
};

const defaultCenter = { lat: 18.25, lng: 121.9 };

export default function MapManager() {
  const [ponds, setPonds] = useState([]);
  const [newPondPath, setNewPondPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pondName, setPondName] = useState('');
  const drawingManagerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPonds();
  }, []);

  const fetchPonds = async () => {
    try {
      const response = await client.get('/api/ponds/');
      setPonds(response.data);
    } catch (error) {
      console.error("Error fetching ponds:", error);
    }
  };

  const onPolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const coordinates = [];
    for (let i = 0; i < path.getLength(); i++) {
        coordinates.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
    }
    setNewPondPath(coordinates);
    setIsDrawing(false);
    polygon.setMap(null);
  };

  const savePond = async () => {
    if (newPondPath.length < 3) return alert("Invalid shape.");
    if (!pondName.trim()) return alert("Enter a name.");

    try {
      const payload = {
        name: pondName,
        location_desc: "Mapped via Web",
        coordinates: newPondPath.map(p => [p.lat, p.lng]),
        image_base64: null
      };
      await client.post('/api/ponds/', payload);
      setNewPondPath([]);
      setPondName('');
      fetchPonds();
    } catch (error) {
      alert("Error saving pond.");
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
        <h1 className="page-header" style={{margin: 0}}>Pond Map</h1>
        
        {newPondPath.length > 0 ? (
          <div className="card" style={{padding: 8, display: 'flex', gap: 8, alignItems: 'center'}}>
            <input 
              className="form-input" 
              placeholder="Pond Name" 
              value={pondName}
              onChange={(e) => setPondName(e.target.value)}
              style={{marginTop: 0, width: 200}}
            />
            <button className="btn btn-success" onClick={savePond}><Save size={18}/> Save</button>
            <button className="btn btn-danger" onClick={() => setNewPondPath([])}><Trash2 size={18}/></button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsDrawing(true)} disabled={isDrawing}>
            <Plus size={18}/> {isDrawing ? "Drawing..." : "New Pond"}
          </button>
        )}
      </div>

      <LoadScript googleMapsApiKey="AIzaSyAQLaqGh3Kz-09Yha-k1ICvKFuzEDohIlM" libraries={['drawing']}>
        <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={14} mapTypeId="hybrid">
          {ponds.map((pond) => (
            <Polygon
              key={pond.id}
              paths={pond.coordinates.map(c => ({ lat: c[0], lng: c[1] }))}
              options={{ fillColor: "#10B981", fillOpacity: 0.4, strokeColor: "white", strokeWeight: 2 }}
              onClick={() => navigate(`/pond/${pond.id}`)}
            />
          ))}
          
          {newPondPath.length > 0 && (
             <Polygon paths={newPondPath} options={{ fillColor: "#007AFF", fillOpacity: 0.5, strokeColor: "white", strokeWeight: 2 }} />
          )}

          {isDrawing && (
            <DrawingManager
              onLoad={manager => drawingManagerRef.current = manager}
              onPolygonComplete={onPolygonComplete}
              drawingMode="polygon"
              options={{ drawingControl: false, polygonOptions: { fillColor: '#007AFF', fillOpacity: 0.5, editable: true, zIndex: 1 } }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
