// ===== INTERFACES PARA COMUNICAÇÃO COM API =====

// Base interface para responses da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Interface para paginação
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ===== HERO CONTENT =====
export interface HeroContent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== PROTÓTIPOS/LABS =====
export interface Prototype {
  id: number;
  slug: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ===== BASTIDORES/NEWS =====
export interface BehindScenesPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content?: string;
  category: 'startup' | 'award' | 'research' | 'dataset' | 'collaboration';
  image_url: string;
  published_at: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// ===== USER PROFILE =====
export interface UserProfile {
  id: number;
  name: string;
  title: string;
  bio: string;
  profile_image_url: string;
  years_experience: number;
  projects_completed: number;
  social_links: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

// ===== ERROR HANDLING =====
export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: string;
}

// ===== REQUEST FILTERS =====
export interface PrototypeFilters {
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  technology?: string;
  search?: string;
}

export interface BehindScenesFilters {
  category?: 'startup' | 'award' | 'research' | 'dataset' | 'collaboration';
  featured?: boolean;
  search?: string;
  year?: number;
}