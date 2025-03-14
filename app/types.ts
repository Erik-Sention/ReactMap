export type RiskLevel = 'low' | 'medium' | 'high';

export type Category = 
  | 'Anställd' 
  | 'Grupp' 
  | 'Organisation' 
  | 'Företagsledning' 
  | 'Managers LG' 
  | 'Supervisors AC';

export type Status = 'I drift' | 'I testfas' | '';

export type Importance = '+' | '++' | '+++' | '';

export interface Item {
  id: string;
  text: string;
  entity: string;
  riskLevel: RiskLevel;
  position: number;
  category: Category;
  stakeholderGroup: string;
  rating: Importance;
  lockedBy?: string;
  lockedUntil?: string;
}

export interface SystemItem {
  id: string;
  kategori: string;
  system: string;
  leverantor: string;
  status: Status;
  omdome: Importance;
}

export interface StakeholderGroup {
  id: string;
  name: string;
  position: number;
}

export interface Resource {
  id: string;
  text: string;
  category: string;
  tags: string[];
} 