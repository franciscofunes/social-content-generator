export interface Post {
  id: string;
  topicId: string;
  category: string;
  instagramContent: {
    text: string;
    imageUrl: string;
    hashtags: string[];
  };
  linkedinContent: {
    text: string;
    imageUrl: string;
    hashtags: string[];
  };
  isPosted: {
    instagram: boolean;
    linkedin: boolean;
  };
  postedAt?: {
    instagram?: Date;
    linkedin?: Date;
  };
  createdAt: Date;
}

export interface DailyContent {
  id: string; // Format: YYYY-MM-DD
  date: Date;
  posts: Post[];
  generationStatus: 'pending' | 'generating' | 'completed' | 'error';
  generatedAt?: Date;
  topicsUsed: string[]; // Topic IDs
}

export interface ContentHistory {
  id: string;
  month: string; // Format: YYYY-MM
  totalPosts: number;
  postsPosted: number;
  topicCoverage: { [category: string]: number };
  avgGenerationTime: number;
  createdAt: Date;
}