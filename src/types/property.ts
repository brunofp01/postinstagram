export interface Property {
  id: string;
  created_at: string;
  user_id: string;
  source_url: string;
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2: number;
  description: string;
  instagram_caption: string;
  hashtags: string;
  images: string[];
  cover_image_url: string;
}

export type PropertyFormData = Omit<Property, 'id' | 'created_at' | 'user_id'>;

export interface ScrapedProperty {
  title: string;
  neighborhood: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  area_m2: number;
  description: string;
  imageUrls: string[];
}
