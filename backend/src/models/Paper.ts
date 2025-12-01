import mongoose, { Document, Schema } from 'mongoose';

export interface IRelatedPaper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  year: number;
}

export interface IPaper extends Document {
  title: string;  
  authors: string[];
  abstract: string;
  fullText: string;
  summary: string;
  keywords: string[];
  year: number | null; // Year of publication from the paper
  uploadDate: Date; // When uploaded to system
  relatedPapers: IRelatedPaper[];
}

const RelatedPaperSchema = new Schema<IRelatedPaper>({
  title: { type: String, required: true },
  authors: [{ type: String }],
  abstract: { type: String, default: 'No abstract available' },
  url: { type: String, required: true },
  year: { type: Number },
}, { _id: false });

const PaperSchema = new Schema<IPaper>({
  title: { 
    type: String, 
    required: true,
    index: true // Index for faster searches
  },
  authors: [{ 
    type: String,
    index: true // Index for author searches
  }],
  abstract: { 
    type: String,
    default: 'Abstract not available'
  },
  fullText: { 
    type: String, 
    required: true 
  },
  summary: { 
    type: String,
    default: 'Summary being generated...'
  },
  keywords: [{ 
    type: String,
    index: true // Index for keyword searches
  }],
  year: { 
    type: Number,
    default: null,
    min: 1900,
    max: 2100,
    index: true // Index for year filtering
  },
  uploadDate: { 
    type: Date, 
    default: Date.now,
    index: true // Index for chronological queries
  },
  relatedPapers: [RelatedPaperSchema],
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Add text index for full-text search
PaperSchema.index({ 
  title: 'text', 
  abstract: 'text', 
  keywords: 'text' 
});

// Virtual property to get year or fallback to upload year
PaperSchema.virtual('displayYear').get(function() {
  return this.year || this.uploadDate.getFullYear();
});

// Ensure virtuals are included in JSON output
PaperSchema.set('toJSON', { virtuals: true });
PaperSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPaper>('Paper', PaperSchema);