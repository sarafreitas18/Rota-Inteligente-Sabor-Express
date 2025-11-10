
export interface Point {
  x: number;
  y: number;
}

export interface DeliveryPoint extends Point {
  id: number;
  clusterId?: number;
}

export interface Centroid extends Point {
  id: number;
}

export interface Cluster {
  id: number;
  centroid: Centroid;
  points: DeliveryPoint[];
}

export interface Route {
  clusterId: number;
  path: Point[];
  distance: number;
}
