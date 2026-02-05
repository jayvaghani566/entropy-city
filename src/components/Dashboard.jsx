/* eslint-disable react/prop-types */
import React from 'react';

const Dashboard = ({
    entropy,
    budget,
    timeElapsed,
    onAction,
    currentMode,
    isPlaying,
    nodeCounts
}) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getEntropyColor = (val) => {
        if (val < 5) return '#00ff88'; // Green
        if (val < 7) return '#ffcc00'; // Yellow
        return '#ff0033'; // Red
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Allow clicks to pass through to canvas
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px',
            boxSizing: 'border-box',
            zIndex: 10,
            color: 'white',
            fontFamily: 'Segoe UI, sans-serif'
        }}>
            {/* TOP BAR */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.8)',
                padding: '10px 20px',
                borderRadius: '10px',
                pointerEvents: 'auto',
                backdropFilter: 'blur(5px)',
                border: '1px solid #333'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>ENTROPY</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getEntropyColor(entropy) }}>
                        {entropy.toFixed(3)}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>TIME</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(timeElapsed)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>BUDGET</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ccff' }}>${budget}</div>
                </div>
            </div>

            {/* BOTTOM CONTROL PANEL */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '15px',
                pointerEvents: 'auto'
            }}>
                <button
                    onClick={() => onAction('TOGGLE_PAUSE')}
                    style={btnStyle(false)}
                >
                    {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>

                <button
                    onClick={() => onAction('MODE_SENSOR')}
                    style={btnStyle(currentMode === 'sensor')}
                >
                    📡 PLACE SENSOR ($100)
                </button>

                <button
                    onClick={() => onAction('MODE_CONNECT')}
                    style={btnStyle(currentMode === 'connect')}
                    disabled // Not implemented in MVP click handler yet
                >
                    🔗 CONNECT ($50)
                </button>
            </div>

            {/* SIDE STATS */}
            <div style={{
                position: 'absolute',
                right: '20px',
                top: '100px',
                background: 'rgba(0,0,0,0.8)',
                padding: '15px',
                borderRadius: '10px',
                pointerEvents: 'auto',
                fontSize: '0.9rem',
                border: '1px solid #333'
            }}>
                <h4>SYSTEM STATUS</h4>
                <div>Active: {nodeCounts?.active || 0}</div>
                <div>Unknown: {nodeCounts?.unknown || 0}</div>
                <div>Failed: {nodeCounts?.failed || 0}</div>
            </div>
        </div>
    );
};

const btnStyle = (active) => ({
    background: active ? '#00ccff' : '#222',
    color: active ? '#000' : '#fff',
    border: '1px solid #444',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
});

export default Dashboard;
