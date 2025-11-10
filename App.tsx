import React, { useState, useMemo, useRef, useCallback } from 'react';
import Map from './components/Map';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import Dashboard from './components/Dashboard';
import { DeliveryPoint, Cluster, Route, Point } from './types';
import { runKMeans, runNearestNeighborForEachCluster } from './services/optimizationService';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';

const SIMULATION_SPEED = 150; // pixels per second

const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const getPositionOnPath = (path: Point[], distanceToTravel: number): Point => {
    if (!path || path.length === 0) return { x: 0, y: 0 };
    
    let distanceCovered = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const start = path[i];
        const end = path[i + 1];
        const segmentLength = calculateDistance(start, end);

        if (distanceCovered + segmentLength >= distanceToTravel) {
            const distanceIntoSegment = distanceToTravel - distanceCovered;
            const fraction = distanceIntoSegment / segmentLength;
            if (isNaN(fraction) || !isFinite(fraction)) return start;
            
            return {
                x: start.x + (end.x - start.x) * fraction,
                y: start.y + (end.y - start.y) * fraction,
            };
        }
        distanceCovered += segmentLength;
    }
    return path[path.length - 1];
};


const App: React.FC = () => {
    const [numPoints, setNumPoints] = useState<number>(50);
    const [numClusters, setNumClusters] = useState<number>(5);
    const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [status, setStatus] = useState<string>('Pronto para iniciar');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [truckPositions, setTruckPositions] = useState<Point[]>([]);

    const requestRef = useRef<number>();
    const startTimeRef = useRef<number>();

    const depot: Point = useMemo(() => ({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 }), []);

    const resetState = () => {
        setClusters([]);
        setRoutes([]);
        setTotalDistance(0);
        setIsSimulating(false);
        setTruckPositions([]);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    };

    const handleGeneratePoints = () => {
        setIsLoading(true);
        setStatus('Gerando pontos de entrega...');
        resetState();

        setTimeout(() => {
            const newPoints: DeliveryPoint[] = Array.from({ length: numPoints }, (_, i) => ({
                id: i,
                x: Math.random() * (MAP_WIDTH - 20) + 10,
                y: Math.random() * (MAP_HEIGHT - 20) + 10,
            }));
            setDeliveryPoints(newPoints);
            setStatus('Pontos de entrega gerados. Pronto para agrupar.');
            setIsLoading(false);
        }, 500);
    };

    const handleClusterPoints = () => {
        if (deliveryPoints.length === 0) {
            alert('Por favor, gere os pontos de entrega primeiro.');
            return;
        }
        setIsLoading(true);
        setStatus('Agrupando pontos em zonas...');
        resetState();

        setTimeout(() => {
            const { clusters: newClusters, points: updatedPoints } = runKMeans(deliveryPoints, numClusters);
            setClusters(newClusters);
            setDeliveryPoints(updatedPoints);
            setStatus('Agrupamento concluído. Pronto para calcular rotas.');
            setIsLoading(false);
        }, 500);
    };

    const handleCalculateRoutes = () => {
        if (clusters.length === 0) {
            alert('Por favor, agrupe os pontos primeiro.');
            return;
        }
        setIsLoading(true);
        setStatus('Calculando rotas otimizadas...');

        setTimeout(() => {
            const { routes: newRoutes, totalDistance: newTotalDistance } = runNearestNeighborForEachCluster(clusters, depot);
            setRoutes(newRoutes);
            setTotalDistance(newTotalDistance);
            setStatus('Otimização de rotas concluída. Pronto para simular.');
            setIsLoading(false);
        }, 500);
    };

    const animate = useCallback((timestamp: number) => {
        if (startTimeRef.current === undefined) {
            startTimeRef.current = timestamp;
        }
        const elapsed = timestamp - startTimeRef.current;
        const totalDuration = Math.max(...routes.map(r => r.distance)) / SIMULATION_SPEED * 1000;

        const newTruckPositions = routes.map(route => {
            const distanceToTravel = (elapsed / 1000) * SIMULATION_SPEED;
            return getPositionOnPath(route.path, distanceToTravel);
        });
        
        setTruckPositions(newTruckPositions);

        if (elapsed < totalDuration) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setStatus('Simulação concluída.');
            setIsSimulating(false);
            setTruckPositions(routes.map(() => depot));
        }
    }, [routes, depot]);

    const handleStartSimulation = () => {
        if (routes.length === 0) {
            alert('Calcule as rotas primeiro.');
            return;
        }
        setIsSimulating(true);
        setStatus('Simulando entregas...');
        setTruckPositions(routes.map(() => depot));
        startTimeRef.current = undefined;
        requestRef.current = requestAnimationFrame(animate);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-200 font-sans">
            <header className="w-full max-w-7xl text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-amber-400">Rota Inteligente: Sabor Express</h1>
                <p className="text-lg text-slate-400 mt-2">Otimizador de Rotas de Entrega com IA</p>
            </header>
            
            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/3 bg-slate-800 p-6 rounded-lg shadow-2xl flex flex-col gap-6">
                    <Controls
                        numPoints={numPoints}
                        setNumPoints={setNumPoints}
                        numClusters={numClusters}
                        setNumClusters={setNumClusters}
                        onGenerate={handleGeneratePoints}
                        onCluster={handleClusterPoints}
                        onCalculate={handleCalculateRoutes}
                        onSimulate={handleStartSimulation}
                        isLoading={isLoading || isSimulating}
                        canCluster={deliveryPoints.length > 0}
                        canCalculate={clusters.length > 0}
                        canSimulate={routes.length > 0}
                    />
                    <InfoPanel
                        status={status}
                        pointCount={deliveryPoints.length}
                        clusterCount={clusters.length}
                        totalDistance={totalDistance}
                    />
                    {routes.length > 0 && <Dashboard routes={routes} />}
                </div>

                <main className="lg:w-2/3 bg-slate-800 p-2 rounded-lg shadow-2xl aspect-w-4 aspect-h-3 lg:aspect-w-16 lg:aspect-h-9 flex items-center justify-center">
                    <Map
                        depot={depot}
                        deliveryPoints={deliveryPoints}
                        routes={routes}
                        truckPositions={truckPositions}
                    />
                </main>
            </div>
             <footer className="w-full max-w-7xl text-center mt-6 text-slate-500 text-sm">
                <p>Distâncias são euclidianas. As rotas são aproximações usando a heurística do Vizinho Mais Próximo.</p>
            </footer>
        </div>
    );
};

export default App;