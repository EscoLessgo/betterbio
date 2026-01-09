import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = () => {
            fetch('/api/dashboard')
                .then(res => res.json())
                .then(data => {
                    setData(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        };
        fetchData();
        const interval = setInterval(fetchData, 5000); // Live update every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div style={{ color: '#0f0', padding: '2rem', fontFamily: 'monospace' }}>CONNECTING_TO_MAINFRAME...</div>;
    if (!data || data.error) return <div style={{ color: 'red', padding: '2rem', fontFamily: 'monospace' }}>CONNECTION_REFUSED: {data?.error || 'NO_SIGNAL'}</div>;

    const Card = ({ title, children, color = '#2dfccc' }) => (
        <div style={{
            background: 'rgba(5, 5, 16, 0.8)',
            border: `1px solid ${color}`,
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: `0 0 10px ${color}22`
        }}>
            <h3 style={{ margin: '0 0 1rem 0', color: color, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
            {children}
        </div>
    );

    const ListRow = ({ label, sub, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
            <div>
                <div style={{ color: '#fff', fontWeight: 'bold' }}>{label}</div>
                {sub && <div style={{ color: '#666', fontSize: '0.8rem' }}>{sub}</div>}
            </div>
            <div style={{ color: '#aaa', fontWeight: 'bold' }}>{value}</div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#020205', color: '#eee', fontFamily: '"Inter", sans-serif',
            padding: '2rem', overflow: 'auto', zIndex: 9999, boxSizing: 'border-box'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(to right, #2dfccc, #d92b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        ESCO_ANALYTICS // V2
                    </h1>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2dfccc' }}>{data.stats.total_views}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>TOTAL_HITS</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d92b6b' }}>{data.stats.unique_visitors}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>UNIQUE_VISITORS</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#e8f080' }}>{data.stats.countries}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>COUNTRIES</div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <Card title="TOP CITIES" color="#d92b6b">
                        {data.top_cities?.length === 0 && <div style={{ color: '#444' }}>NO_DATA</div>}
                        {data.top_cities?.map((c, i) => (
                            <ListRow key={i} label={c.city} sub={c.country} value={c.count} />
                        ))}
                    </Card>

                    <Card title="TOP ISPs" color="#2dfccc">
                        {data.top_isps?.length === 0 && <div style={{ color: '#444' }}>NO_DATA</div>}
                        {data.top_isps?.map((isp, i) => (
                            <ListRow key={i} label={isp.isp} value={isp.count} />
                        ))}
                    </Card>

                    <Card title="BROWSERS" color="#e8f080">
                        {data.browsers?.length === 0 && <div style={{ color: '#444' }}>NO_DATA</div>}
                        {data.browsers?.map((b, i) => (
                            <ListRow key={i} label={b.browser} value={b.count} />
                        ))}
                    </Card>
                </div>

                <Card title="DETAILED ACCESS LOGS" color="#fff">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
                                <th style={{ padding: '1rem 0.5rem' }}>TIME</th>
                                <th style={{ padding: '1rem 0.5rem' }}>LOCATION</th>
                                <th style={{ padding: '1rem 0.5rem' }}>NETWORK</th>
                                <th style={{ padding: '1rem 0.5rem' }}>DEVICE</th>
                                <th style={{ padding: '1rem 0.5rem' }}>PATH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_logs?.map((log, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #111', color: '#aaa' }}>
                                    <td style={{ padding: '0.8rem 0.5rem', fontFamily: 'monospace' }}>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td style={{ padding: '0.8rem 0.5rem' }}>
                                        <div style={{ color: '#fff' }}>{log.city || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#444' }}>{log.country}</div>
                                    </td>
                                    <td style={{ padding: '0.8rem 0.5rem' }}>
                                        <div style={{ color: '#fff' }}>{log.isp || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#444' }}>{log.ip?.replace(/\d+$/, '***')}</div>
                                    </td>
                                    <td style={{ padding: '0.8rem 0.5rem' }}>
                                        <div style={{ color: '#fff' }}>{log.browser}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#444' }}>{log.os}</div>
                                    </td>
                                    <td style={{ padding: '0.8rem 0.5rem', color: '#2dfccc' }}>{log.path}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        position: 'fixed', bottom: '2rem', right: '2rem',
                        background: '#fff', color: '#000', border: 'none',
                        padding: '0.8rem 1.5rem', borderRadius: '4px',
                        fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                >
                    EXIT DASHBOARD
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
