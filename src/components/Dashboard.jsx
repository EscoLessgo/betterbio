import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ color: '#0f0', padding: '2rem', fontFamily: 'monospace' }}>CONNECTING_TO_MAINFRAME...</div>;
    if (!data || data.error) return <div style={{ color: 'red', padding: '2rem', fontFamily: 'monospace' }}>CONNECTION_REFUSED: {data?.error || 'NO_SIGNAL'}</div>;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#050510',
            color: '#2dfccc',
            fontFamily: '"Courier New", monospace',
            padding: '2rem',
            overflow: 'auto',
            zIndex: 9999
        }}>
            <h1 style={{ borderBottom: '2px solid #2dfccc', paddingBottom: '1rem' }}>ESCO_NET // ANALYTICS_HIVE</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ border: '1px solid #d92b6b', padding: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#d92b6b' }}>TOTAL_HITS</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{data.stats.total_views}</div>
                </div>
                <div style={{ border: '1px solid #e8f080', padding: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#e8f080' }}>UNIQUE_NODES</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{data.stats.unique_devices}</div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{ color: '#fff' }}>NODE_TRAFFIC</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '0.5rem' }}>TARGET_ID</th>
                                <th style={{ padding: '0.5rem' }}>INTERACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_pages?.map((p, i) => (
                                <tr key={i} style={{ background: i % 2 ? 'rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '0.5rem', color: '#2dfccc' }}>
                                        {p.path.replace('/node/', '').toUpperCase()}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{p.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2 style={{ color: '#fff' }}>LIVE_FEED</h2>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '0.5rem' }}>TIMESTAMP</th>
                                <th style={{ padding: '0.5rem' }}>ACTION</th>
                                <th style={{ padding: '0.5rem' }}>TERMINAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_logs?.map((log, i) => (
                                <tr key={i} style={{ color: '#aaa' }}>
                                    <td style={{ padding: '0.5rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td style={{ padding: '0.5rem', color: '#fff' }}>
                                        {log.path.replace('/node/', '> ')}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{log.screen}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button
                onClick={() => window.location.href = '/'}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: '#2dfccc',
                    color: '#000',
                    border: 'none',
                    padding: '1rem 2rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                EXIT_CONSOLE
            </button>
        </div>
    );
};

export default Dashboard;
