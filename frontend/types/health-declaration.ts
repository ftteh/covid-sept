export interface HealthDeclaration {
  id: string;
  name: string;
  temperature: number;
  hasSymptoms: boolean;
  symptoms?: string | null;
  hasContact: boolean;
  contactDetails?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthDeclarationDto {
  name: string;
  temperature: number;
  hasSymptoms: boolean;
  symptoms?: string;
  hasContact: boolean;
  contactDetails?: string;
}

export interface UpdateHealthDeclarationDto {
  name?: string;
  temperature?: number;
  hasSymptoms?: boolean;
  symptoms?: string;
  hasContact?: boolean;
  contactDetails?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HealthDeclarationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  todaySubmissions: number;
}

export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode?: number;
} 