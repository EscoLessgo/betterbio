import React, { useEffect, useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from 'react-tooltip';

// GeoJSON for the world map
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [zoom, setZoom] = useState(1);

    // Auth & Fetch
    const login = async () => {
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem('admin_token', token);
                setIsAuthenticated(true);
                fetchData(token);
            } else {
                alert('ACCESS_DENIED');
            }
        } catch (e) { alert('SYSTEM_ERROR'); }
    };

    const fetchData = (token) => {
        setLoading(true);
        const t = token || localStorage.getItem('admin_token');
        fetch(`/api/dashboard${filter ? `?filter=${filter}` : ''}`, {
            headers: { 'Authorization': `Bearer ${t}` }
        })
            .then(res => {
                if (res.status === 401) {
                    setIsAuthenticated(false);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setData(data);
                    setIsAuthenticated(true);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) fetchData(token);
    }, [filter]);

    // Deletion Logic
    const deleteLogs = async (all = false) => {
        if (!confirm(all ? 'PURGE ALL DATA?' : `DELETE ${selectedLogs.length} LOGS?`)) return;

        const token = localStorage.getItem('admin_token');
        const res = await fetch('/api/logs', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids: selectedLogs, all })
        });

        if (res.ok) {
            setSelectedLogs([]);
            fetchData(token);
        }
    };

    const toggleSelect = (id) => {
        setSelectedLogs(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // --- RENDER HELPERS ---
    const popScale = useMemo(() => scaleLinear().domain([0, 50]).range([2, 10]), []);

    if (!isAuthenticated) return (
        <div style={{ height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h1 style={{ color: '#d92b6b', fontFamily: 'monospace', marginBottom: '1rem' }}>SECURE_GATEWAY</h1>
            <input
                type="password"
                placeholder="ACCESS_CODE"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={{ background: '#111', border: '1px solid #d92b6b', padding: '1rem', color: '#fff', fontSize: '1.2rem', textAlign: 'center', outline: 'none' }}
            />
            <button onClick={login} style={{ marginTop: '1rem', background: '#d92b6b', border: 'none', padding: '0.5rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}>ENTER</button>
        </div>
    );

    if (loading && !data) return <div style={{ color: '#0f0', padding: '2rem', fontFamily: 'monospace' }}>UPDATING_STREAMS...</div>;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#020205', color: '#eee', fontFamily: '"Inter", sans-serif',
            padding: '2rem', overflow: 'auto', zIndex: 9999
        }}>
            {/* TOOLTIP */}
            <Tooltip id="geo-tooltip" style={{ backgroundColor: "#d92b6b", color: "#fff", zIndex: 10000 }} />

            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2dfccc', margin: 0 }}>ESCO_ANALYTICS // PRO</h1>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Authorization: LEVEL_5</div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            placeholder="FILTER_STREAMS..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{ background: '#111', border: '1px solid #333', padding: '0.5rem 1rem', color: '#fff', borderRadius: '4px' }}
                        />
                        <button onClick={() => fetchData()} style={{ background: '#333', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>REFRESH</button>
                    </div>
                </header>

                {/* VISUALS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

                    {/* MAP VISUALIZER */}
                    <div style={{ background: '#0a0a12', border: '1px solid #333', borderRadius: '8px', padding: '1rem', height: '400px', position: 'relative', overflow: 'hidden' }}>
                        <h3 style={{ position: 'absolute', top: '1rem', left: '1rem', color: '#666', fontSize: '0.8rem', margin: 0, zIndex: 10 }}>GLOBAL_HEATMAP (SCROLL TO ZOOM)</h3>
                        <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: '100%', height: '100%' }}>
                            <ZoomableGroup zoom={1} minZoom={0.5} maxZoom={10} onMove={({ k }) => setZoom(k)}>
                                <Geographies geography={GEO_URL}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill="#1a1a24"
                                                stroke="#000"
                                                strokeWidth={0.5}
                                                data-tooltip-id="geo-tooltip"
                                                data-tooltip-content={geo.properties.name}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: "#2a2a35", outline: "none" },
                                                    pressed: { outline: "none" },
                                                }}
                                            />
                                        ))
                                    }
                                </Geographies>
                                {data?.map_points?.map((point, i) => (
                                    <Marker
                                        key={i}
                                        coordinates={[point.lon, point.lat]}
                                        data-tooltip-id="geo-tooltip"
                                        data-tooltip-content={`${point.city}, ${point.country} (${point.count} Hits)`}
                                    >
                                        <circle
                                            r={popScale(point.count) / Math.sqrt(Math.max(1, zoom))}
                                            fill="#d92b6b"
                                            stroke="#fff"
                                            strokeWidth={1 / zoom}
                                            style={{ opacity: 0.8, cursor: 'pointer' }}
                                        />
                                        {zoom > 2 && (
                                            <text
                                                textAnchor="middle"
                                                y={-10 / zoom}
                                                style={{ fontFamily: "Arial", fill: "#fff", fontSize: Math.max(4, 10 / zoom), pointerEvents: 'none' }}
                                            >
                                                {point.city}
                                            </text>
                                        )}
                                    </Marker>
                                ))}
                            </ZoomableGroup>
                        </ComposableMap>
                    </div>

                    {/* STATS PANEL */}
                    <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ background: '#0a0a12', border: '1px solid #2dfccc', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2dfccc' }}>{data?.stats?.total_views}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>TOTAL_INTERACTIONS</div>
                        </div>
                        <div style={{ background: '#0a0a12', border: '1px solid #d92b6b', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#d92b6b' }}>{data?.stats?.unique_visitors}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>UNIQUE_SIGNALS</div>
                        </div>
                        <div style={{ background: '#0a0a12', border: '1px solid #e8f080', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e8f080' }}>{data?.stats?.countries}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>ACTIVE_REGIONS</div>
                        </div>
                    </div>
                </div>

                {/* LOGS CONTROL */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>DATA_LOGS</h3>
                    {selectedLogs.length > 0 && (
                        <button onClick={() => deleteLogs()} style={{ background: '#d92b6b', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                            DELETE SELECTED ({selectedLogs.length})
                        </button>
                    )}
                    <button onClick={() => deleteLogs(true)} style={{ background: 'transparent', border: '1px solid #444', color: '#666', padding: '0.5rem 1rem', cursor: 'pointer', marginLeft: 'auto' }}>
                        PURGE ALL
                    </button>
                </div>

                {/* TABLE */}
                <div style={{ background: '#0a0a12', border: '1px solid #333', borderRadius: '8px', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead style={{ background: '#111', color: '#888', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem', width: '40px' }}>
                                    <input type="checkbox" onChange={(e) => {
                                        if (e.target.checked) setSelectedLogs(data?.recent_logs.map(l => l.id));
                                        else setSelectedLogs([]);
                                    }} />
                                </th>
                                <th style={{ padding: '1rem' }}>TIMESTAMP</th>
                                <th style={{ padding: '1rem' }}>LOCATION</th>
                                <th style={{ padding: '1rem' }}>IDENTITY</th>
                                <th style={{ padding: '1rem' }}>TARGET</th>
                                <th style={{ padding: '1rem' }}>META</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.recent_logs?.map((log) => (
                                <tr key={log.id} style={{ borderTop: '1px solid #222', color: '#ccc', background: selectedLogs.includes(log.id) ? 'rgba(217, 43, 107, 0.1)' : 'transparent' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedLogs.includes(log.id)}
                                            onChange={() => toggleSelect(log.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem', color: '#666' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{log.city}</span>, {log.country}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ color: '#2dfccc' }}>{log.browser}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#555' }}>{log.os} / {log.device}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#444' }}>{log.isp} - {log.ip?.replace(/\d+$/, '***')}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#e8f080' }}>
                                        {log.path}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#555' }}>
                                        {log.screen}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* EXIT */}
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        position: 'fixed', bottom: '2rem', right: '2rem',
                        background: '#fff', color: '#000', border: 'none',
                        padding: '1rem 2rem', borderRadius: '50px',
                        fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                >
                    EXIT
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
