export type CourseCardData = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
  enrolled_at?: string | null;
  price?: number | string;
  original_price?: number;
  discount_percent?: number;
  is_free: boolean;
  duration_minutes: number;
  category?: string | { name: string } | null;
  instructor?: string | { name: string } | null;
  progress_percentage?: number;
};
