export interface BastidoresModel {
  id: number;
  title: string;
  description: string | null;
  image_path: string;
  date: string;
  link: string | null;
  language: 'pt' | 'en';  // Restringindo a linguagem para português ou inglês
  category: 'startup' | 'award' | 'research' | 'dataset' | 'collaboration';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}