export interface Topic {
  id: string;
  title: string;
  category: 'normativas' | 'epp' | 'prevencion' | 'ergonomia' | 'primeros-auxilios' | 'construccion' | 'quimicos' | 'electrica' | 'maquinaria' | 'capacitacion';
  description: string;
  lastUsedDate?: Date;
  usageCount: number;
  priorityScore: number; // 1-10 scale
  seasonalRelevance?: 'verano' | 'invierno' | 'all';
  regulatoryReference?: string;
  keywords: string[];
  createdDate: Date;
  isArchived: boolean;
}