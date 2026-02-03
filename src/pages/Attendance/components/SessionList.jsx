import React from 'react';
import SessionCard from './SessionCard';

const SessionList = ({ sessions, type, onStart, onDelete, emptyMessage, userRole }) => {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-muted text-center py-5 border rounded-3 bg-light">
                {emptyMessage || "No sessions found."}
            </div>
        );
    }

    return (
        <div className="row g-4">
            {sessions.map((session) => (
                <SessionCard
                    key={session.uid}
                    session={session}
                    type={type}
                    onStart={onStart}
                    onDelete={onDelete}
                    userRole={userRole}
                />
            ))}
        </div>
    );
};

export default SessionList;
