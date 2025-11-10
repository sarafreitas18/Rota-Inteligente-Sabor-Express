import React from 'react';

interface InfoPanelProps {
    status: string;
    pointCount: number;
    clusterCount: number;
    totalDistance: number;
}

const InfoItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline bg-slate-700/50 p-3 rounded-md">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-white font-semibold text-lg">{value}</span>
    </div>
);

const InfoPanel: React.FC<InfoPanelProps> = ({ status, pointCount, clusterCount, totalDistance }) => {
    return (
        <div className="space-y-4">
            <div className="text-center p-3 bg-slate-900/50 rounded-md">
                <p className="font-semibold text-amber-400">Status</p>
                <p className="text-slate-200">{status}</p>
            </div>
            <div className="space-y-2">
                <InfoItem label="Total de Pontos" value={pointCount} />
                <InfoItem label="Total de Zonas" value={clusterCount} />
                <InfoItem label="Distância Total" value={totalDistance.toFixed(2)} />
            </div>
        </div>
    );
};

export default InfoPanel;