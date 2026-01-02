import React from 'react';

const Ruler = ({ length, orientation = 'horizontal', scale = 1, tickSize = 50 }) => {
    const isHorizontal = orientation === 'horizontal';
    const size = length;
    const ticks = [];
    const majorTick = 100;

    // Generate ticks
    for (let i = 0; i <= size; i += tickSize) {
        const isMajor = i % majorTick === 0;
        ticks.push(
            <div
                key={i}
                style={{
                    position: 'absolute',
                    [isHorizontal ? 'left' : 'top']: i * scale,
                    [isHorizontal ? 'top' : 'left']: isMajor ? 0 : '12px',
                    width: isHorizontal ? '1px' : (isMajor ? '20px' : '8px'),
                    height: !isHorizontal ? '1px' : (isMajor ? '20px' : '8px'),
                    backgroundColor: '#9ca3af',
                    overflow: 'visible'
                }}
            >
                {isMajor && (
                    <span style={{
                        position: 'absolute',
                        fontSize: '9px',
                        color: '#6b7280',
                        [isHorizontal ? 'top' : 'left']: '2px',
                        [isHorizontal ? 'left' : 'top']: '4px',
                        fontFamily: 'monospace'
                    }}>
                        {i}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            [isHorizontal ? 'top' : 'left']: '-20px',
            [isHorizontal ? 'left' : 'top']: 0,
            width: isHorizontal ? '100%' : '20px',
            height: isHorizontal ? '20px' : '100%',
            backgroundColor: '#f3f4f6',
            borderBottom: isHorizontal ? '1px solid #e5e7eb' : 'none',
            borderRight: !isHorizontal ? '1px solid #e5e7eb' : 'none',
            overflow: 'hidden',
            zIndex: 1000,
            userSelect: 'none'
        }}>
            {ticks}
        </div>
    );
};

export default Ruler;
