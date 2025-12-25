import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
    maxlength: 160,
  },
  seoKeywords: [{
    type: String,
    trim: true,
  }],
  hashtags: [{
    type: String,
    trim: true,
  }],
  heroImage: {
    type: String,
    trim: true,
  },
  sectionImages: [{
    type: String,
    trim: true,
  }],
  prompt: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  estimatedReadTime: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Calculate word count and read time before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;

    // Estimate read time (average 200 words per minute)
    this.estimatedReadTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
