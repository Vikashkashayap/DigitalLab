export interface User {
  _id?: string;
  email: string;
  name: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Blog {
  _id?: string;
  title: string;
  content: string;
  metaDescription: string;
  seoKeywords: string[];
  hashtags: string[];
  heroImage?: string;
  sectionImages: string[];
  prompt: string;
  status: 'draft' | 'published';
  wordCount: number;
  estimatedReadTime: number;
  summary?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface GenerateBlogRequest {
  prompt: string;
}

export interface GenerateBlogResponse {
  blog: Blog;
  images: any[];
}

export interface BlogWithImagesResponse {
  title: string;
  metaDescription: string;
  content: string;
  images: any[];
  seoKeywords: string[];
  hashtags: string[];
  summary: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Image Generation Types
export interface GenerateImageRequest {
  prompt: string;
  model?: string;
  style?: 'realistic' | 'illustration' | 'minimal' | 'futuristic';
  size?: string;
}

export interface GeneratedImage {
  url: string;
}

export interface GenerateImageResponse {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
}