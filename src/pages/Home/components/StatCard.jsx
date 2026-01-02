import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-info">
                    <p className="stat-title">{title}</p>
                    <h3 className="stat-value">{value}</h3>
                </div>
                <div className={`stat-icon-container`} style={{ backgroundColor: `${color}20`, color: color }}>
                    <Icon size={24} />
                </div>
            </div>
            {(trend || trendValue) && (
                <div className="stat-footer">
                    <span className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
                        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {trendValue}
                    </span>
                    <span className="stat-trend-label">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
