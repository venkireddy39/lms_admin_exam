import React from 'react';
import { Layers, Clock, Activity, CheckCircle, Trash2 } from 'lucide-react';
import StatCard from '../../../components/common/StatCard';

const BatchStats = ({ stats }) => {
    return (
        <div className="row g-4 mb-4">
            <div className="col-12 col-md-6 col-xl-2">
                <StatCard
                    title="Total Batches"
                    value={stats.total}
                    icon={Layers}
                    iconBg="#F1F5F9"
                    iconColor="#475569"
                />
            </div>
            <div className="col-12 col-md-6 col-xl-2">
                <StatCard
                    title="Upcoming"
                    value={stats.upcoming}
                    icon={Clock}
                    iconBg="#eff6ff"
                    iconColor="#3b82f6"
                />
            </div>
            <div className="col-12 col-md-6 col-xl-2">
                <StatCard
                    title="Ongoing"
                    value={stats.ongoing}
                    icon={Activity}
                    iconBg="#f0fdf4"
                    iconColor="#16a34a"
                />
            </div>
            <div className="col-12 col-md-6 col-xl-2">
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    iconBg="#f8fafc"
                    iconColor="#94a3b8"
                />
            </div>
            <div className="col-12 col-md-6 col-xl-2">
                <StatCard
                    title="Deleted"
                    value={stats.deleted || 0}
                    icon={Trash2}
                    iconBg="#fef2f2"
                    iconColor="#dc2626"
                />
            </div>
        </div>
    );
};

export default BatchStats;
