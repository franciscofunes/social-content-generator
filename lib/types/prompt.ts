export interface SavedPrompt {
  id: string;
  prompt: string;
  userId: string;
  createdAt: string | null;
  updatedAt: string | null;
  category: string;
  isActive: boolean;
  deletedAt?: string | null;
}

export interface PromptSaveRequest {
  prompt: string;
  userId: string;
}

export interface PromptDeleteRequest {
  promptId: string;
  userId: string;
}

export interface PromptApiResponse {
  success: boolean;
  message?: string;
  promptId?: string;
  prompt?: SavedPrompt;
  prompts?: SavedPrompt[];
  count?: number;
  error?: string;
}