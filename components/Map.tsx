import React from 'react';
import { DeliveryPoint, Point, Route } from '../types';
import { CLUSTER_COLORS, MAP_WIDTH, MAP_HEIGHT } from '../constants';

interface MapProps {
    depot: Point;
    deliveryPoints: DeliveryPoint[];
    routes: Route[];
    truckPositions: Point[];
}

const DepotIcon: React.FC<{ point: Point }> = ({ point }) => (
    <g transform={`translate(${point.x}, ${point.y})`}>
        <circle cx="0" cy="0" r="10" fill="#FBBF24" stroke="#0F172A" strokeWidth="2" />
        <path d="M-5 -5 L 5 5 M-5 5 L 5 -5" stroke="#0F172A" strokeWidth="2" />
    </g>
);

const TruckIcon: React.FC<{ point: Point, color: string }> = ({ point, color }) => (
    <circle 
        cx={point.x} 
        cy={point.y} 
        r="6" 
        fill={color} 
        stroke="#FFFFFF" 
        strokeWidth="2"
        style={{ transition: 'cx 0.1s linear, cy 0.1s linear' }}
    />
);

const DeliveryPointCircle: React.FC<{ point: DeliveryPoint }> = ({ point }) => {
    const color = point.clusterId !== undefined ? CLUSTER_COLORS[point.clusterId % CLUSTER_COLORS.length] : '#64748B'; // Slate 500
    return (
        <g>
            <circle cx={point.x} cy={point.y} r="4" fill={color} />
            <text
                x={point.x + 6}
                y={point.y + 4}
                fontSize="10px"
                fill="#FFFFFF"
                fontWeight="bold"
                textAnchor="start"
                style={{ pointerEvents: 'none', textShadow: '0 0 2px black' }}
            >
                {point.id}
            </text>
        </g>
    );
};

const RouteLine: React.FC<{ route: Route }> = ({ route }) => {
    const color = CLUSTER_COLORS[route.clusterId % CLUSTER_COLORS.length];
    const pathData = route.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    
    return (
        <path
            d={pathData}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ transition: 'd 0.3s ease-in-out' }}
        />
    );
};

const Map: React.FC<MapProps> = ({ depot, deliveryPoints, routes, truckPositions }) => {
    return (
        <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-full bg-slate-700 rounded-md"
        >
            {/* Background grid */}
            <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="0.5"/>
                </pattern>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)"/>
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {routes.map((route) => (
                <RouteLine key={route.clusterId} route={route} />
            ))}

            {deliveryPoints.map((point) => (
                <DeliveryPointCircle key={point.id} point={point} />
            ))}

            <DepotIcon point={depot} />

            {truckPositions.map((pos, index) => (
                 <TruckIcon 
                    key={index} 
                    point={pos} 
                    color={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                 />
            ))}
        </svg>
    );
};

export default Map;