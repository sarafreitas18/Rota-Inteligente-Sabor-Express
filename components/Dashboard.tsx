import React from 'react';
import { Route } from '../types';
import { CLUSTER_COLORS } from '../constants';

interface DashboardProps {
    routes: Route[];
}

const DashboardCard: React.FC<{ route: Route }> = ({ route }) => {
    const color = CLUSTER_COLORS[route.clusterId % CLUSTER_COLORS.length];
    // Subtract 2 because the path includes the start and end depot points
    const deliveryCount = route.path.length > 2 ? route.path.length - 2 : 0;

    return (
        <div className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-4">
            <div className="w-2 h-12 rounded-full" style={{ backgroundColor: color }}></div>
            <div className="flex-grow">
                <h4 className="font-bold text-white">Entregador {route.clusterId + 1}</h4>
                <div className="flex justify-between text-sm text-slate-300">
                    <span>Entregas:</span>
                    <span className="font-semibold">{deliveryCount}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                    <span>Distância:</span>
                    <span className="font-semibold">{route.distance.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

const BarChart: React.FC<{ routes: Route[] }> = ({ routes }) => {
    const maxDistance = Math.max(...routes.map(r => r.distance), 0);

    return (
        <div className="p-4 bg-slate-700/50 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3 text-center">Distância por Entregador</h4>
            <div className="flex justify-around h-32 w-full gap-2 border-b border-slate-600 pb-2">
                {routes
                    .sort((a, b) => a.clusterId - b.clusterId)
                    .map(route => {
                        const barHeight = maxDistance > 0 ? (route.distance / maxDistance) * 100 : 0;
                        const color = CLUSTER_COLORS[route.clusterId % CLUSTER_COLORS.length];
                        return (
                            <div key={route.clusterId} className="flex flex-col items-center flex-1 text-center justify-end" title={`Distância: ${route.distance.toFixed(2)}`}>
                                <div
                                    className="w-full max-w-[20px] rounded-t-sm"
                                    style={{
                                        height: `${barHeight}%`,
                                        backgroundColor: color,
                                        transition: 'height 0.5s ease-out'
                                    }}
                                ></div>
                                <span className="text-xs mt-1 text-slate-400">E{route.clusterId + 1}</span>
                            </div>
                        );
                 })}
            </div>
        </div>
    );
}


const Dashboard: React.FC<DashboardProps> = ({ routes }) => {
    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-white border-b border-slate-600 pb-2">
                Dashboard de Otimização
            </h3>

            <BarChart routes={routes} />
            
            <h4 className="text-base font-semibold text-white pt-2">
                Detalhes das Rotas
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                 {routes
                    .sort((a, b) => a.clusterId - b.clusterId)
                    .map(route => (
                        <DashboardCard key={route.clusterId} route={route} />
                 ))}
            </div>
        </div>
    );
};

export default Dashboard;