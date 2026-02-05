/* eslint-disable react/prop-types */
import React from 'react';

const Sidebar = ({
    entropy,
    budget,
    timeElapsed,
    onAction,
    currentMode,
    isPlaying,
    nodeCounts,
    eventLog
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
            right: 0,
            width: '320px',
            height: '100%',
            background: 'rgba(20, 20, 30, 0.95)',
            borderLeft: '2px solid #445566',
            display: 'flex',
            flexDirection: 'column',
            color: '#e0e0e0',
            fontFamily: 'Segoe UI, Roboto, sans-serif',
            boxSizing: 'border-box',
            zIndex: 100
        }}>
            {/* HEADER: ENTROPY GAUGE */}
            <div style={{ padding: '20px', borderBottom: '1px solid #445566', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#8899aa', marginBottom: '5px' }}>SYSTEM ENTROPY</div>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: getEntropyColor(entropy),
                    textShadow: '0 0 10px ' + getEntropyColor(entropy)
                }}>
                    {entropy.toFixed(2)}
                </div>
                <div style={{ width: '100%', height: '6px', background: '#333', marginTop: '10px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(100, (entropy / 10) * 100)}%`,
                        height: '100%',
                        background: getEntropyColor(entropy),
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>
            </div>

            {/* STATS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '15px' }}>
                <StatBox label="TIME" value={formatTime(timeElapsed)} />
                <StatBox label="BUDGET" value={`$${budget}`} highlight="#00ccff" />
                <StatBox label="ACTIVE" value={nodeCounts?.active || 0} />
                <StatBox label="FAILED" value={nodeCounts?.failed || 0} highlight="#ff0033" />
            </div>

            {/* EVENT LOG */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.3)', margin: '0 10px', borderRadius: '5px' }}>
                <div style={{ fontSize: '0.8rem', color: '#667788', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Event Log</div>
                {eventLog.length === 0 && <div style={{ color: '#555', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>System Stable</div>}
                {eventLog.map((event, idx) => (
                    <div key={idx} style={{
                        fontSize: '0.85rem',
                        marginBottom: '8px',
                        padding: '8px',
                        borderLeft: `3px solid ${event.type === 'critical' ? '#ff3333' : '#00ccff'}`,
                        background: 'rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ color: '#8899aa', marginRight: '5px' }}>[{formatTime(event.time)}]</span>
                        {event.message}
                    </div>
                ))}
            </div>

            {/* CONTROLS */}
            <div style={{ padding: '20px', borderTop: '1px solid #445566' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <ControlButton
                        label="📡 SENSOR ($100)"
                        active={currentMode === 'sensor'}
                        onClick={() => onAction('MODE_SENSOR')}
                        color="#00ff88"
                    />
                    <ControlButton
                        label="🔗 LINK ($50)"
                        active={currentMode === 'connect'}
                        onClick={() => onAction('MODE_CONNECT')}
                        color="#00ccff"
                        disabled // Still TODO
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button onClick={() => onAction('SAVE')} style={{ flex: 1, padding: '8px', background: '#445566', border: '1px solid #667788', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>💾 SAVE</button>
                    <button onClick={() => onAction('LOAD')} style={{ flex: 1, padding: '8px', background: '#445566', border: '1px solid #667788', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>📂 LOAD</button>
                </div>

                <button
                    onClick={() => onAction('TOGGLE_PAUSE')}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: isPlaying ? '#ddaa00' : '#44ff88',
                        color: '#000',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.3)'
                    }}>
                    {isPlaying ? '⏸ PAUSE SIMULATION' : '▶ RESUME SIMULATION'}
                </button>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, highlight }) => (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', color: '#8899aa' }}>{label}</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: highlight || '#fff' }}>{value}</div>
    </div>
);

const ControlButton = ({ label, active, onClick, color, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            flex: 1,
            padding: '10px',
            background: active ? color : 'transparent',
            color: active ? '#000' : color,
            border: `1px solid ${color}`,
            borderRadius: '5px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            fontWeight: 'bold',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
        }}
    >
        {label}
    </button>
);

export default Sidebar;
