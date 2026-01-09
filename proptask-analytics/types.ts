export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: number;
  status: TaskStatus;
  priority: TaskPriority;
  location?: string; // Specific room/area
  address?: string;  // Building/Street address
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  priority: TaskPriority;
  suggestedAction?: string;
}