
import { DeliveryPoint, Point, Cluster, Centroid, Route } from '../types';

const MAX_KMEANS_ITERATIONS = 50;

// Helper function to calculate Euclidean distance
const calculateDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// --- K-Means Clustering ---

const initializeCentroids = (points: DeliveryPoint[], k: number): Centroid[] => {
    const shuffled = [...points].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, k).map((point, i) => ({
        id: i,
        x: point.x,
        y: point.y,
    }));
};

const assignPointsToClusters = (points: DeliveryPoint[], centroids: Centroid[]): { points: DeliveryPoint[], hasChanged: boolean } => {
    let hasChanged = false;
    const updatedPoints = points.map(point => {
        let minDistance = Infinity;
        let closestClusterId = -1;

        centroids.forEach(centroid => {
            const distance = calculateDistance(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                closestClusterId = centroid.id;
            }
        });

        if (point.clusterId !== closestClusterId) {
            hasChanged = true;
        }

        return { ...point, clusterId: closestClusterId };
    });

    return { points: updatedPoints, hasChanged };
};

const updateCentroids = (points: DeliveryPoint[], k: number): Centroid[] => {
    const newCentroids: Centroid[] = [];
    for (let i = 0; i < k; i++) {
        const clusterPoints = points.filter(p => p.clusterId === i);
        if (clusterPoints.length > 0) {
            const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
            const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
            newCentroids.push({ id: i, x: sumX / clusterPoints.length, y: sumY / clusterPoints.length });
        } else {
            // Handle empty cluster: re-initialize centroid randomly (or from furthest point)
            // For simplicity, we'll just push a random point. A more robust solution might be needed.
            const randomPoint = points[Math.floor(Math.random() * points.length)];
            newCentroids.push({ id: i, x: randomPoint.x, y: randomPoint.y });
        }
    }
    return newCentroids;
};

export const runKMeans = (points: DeliveryPoint[], k: number): { clusters: Cluster[], points: DeliveryPoint[] } => {
    let centroids = initializeCentroids(points, k);
    // Fix: Explicitly type `clusteredPoints` as `DeliveryPoint[]` to solve a type inference issue.
    // The inferred type was too narrow, preventing assignment of points with numeric `clusterId`s later in the loop.
    let clusteredPoints: DeliveryPoint[] = points.map(p => ({ ...p, clusterId: undefined }));
    
    for (let i = 0; i < MAX_KMEANS_ITERATIONS; i++) {
        const { points: newClusteredPoints, hasChanged } = assignPointsToClusters(clusteredPoints, centroids);
        clusteredPoints = newClusteredPoints;

        if (!hasChanged) {
            break;
        }

        centroids = updateCentroids(clusteredPoints, k);
    }
    
    const finalClusters: Cluster[] = centroids.map(centroid => ({
        id: centroid.id,
        centroid: centroid,
        points: clusteredPoints.filter(p => p.clusterId === centroid.id)
    }));

    return { clusters: finalClusters, points: clusteredPoints };
};


// --- Nearest Neighbor Heuristic for TSP ---

const findNearestNeighborRoute = (points: Point[], startPoint: Point): { path: Point[], distance: number } => {
    if (points.length === 0) {
        return { path: [startPoint, startPoint], distance: 0 };
    }

    let unvisited = [...points];
    let currentPoint = startPoint;
    const path: Point[] = [startPoint];
    let totalDistance = 0;

    while (unvisited.length > 0) {
        let nearestPoint: Point | null = null;
        let minDistance = Infinity;
        let nearestIndex = -1;

        unvisited.forEach((point, index) => {
            const distance = calculateDistance(currentPoint, point);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
                nearestIndex = index;
            }
        });

        if (nearestPoint) {
            totalDistance += minDistance;
            currentPoint = nearestPoint;
            path.push(nearestPoint);
            unvisited.splice(nearestIndex, 1);
        }
    }

    // Return to start point
    totalDistance += calculateDistance(currentPoint, startPoint);
    path.push(startPoint);

    return { path, distance: totalDistance };
};

export const runNearestNeighborForEachCluster = (clusters: Cluster[], depot: Point): { routes: Route[], totalDistance: number } => {
    let grandTotalDistance = 0;
    const allRoutes: Route[] = clusters.map(cluster => {
        const { path, distance } = findNearestNeighborRoute(cluster.points, depot);
        grandTotalDistance += distance;
        return {
            clusterId: cluster.id,
            path: path,
            distance: distance,
        };
    });

    return { routes: allRoutes, totalDistance: grandTotalDistance };
};
