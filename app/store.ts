import { create } from 'zustand';
import { Item, Category, RiskLevel, Resource, StakeholderGroup, SystemItem, Importance } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock stakeholder groups
const mockStakeholderGroups: StakeholderGroup[] = [
  {
    id: '1',
    name: 'HR',
    position: 1,
  },
  {
    id: '2',
    name: 'Företagshälsovård',
    position: 2,
  },
];

// User preferences
const userPreferences = {
  hideDeleteConfirmations: false,
};

// Mock data for the prototype
const mockItems: Item[] = [
  // HR Group
  {
    id: '1',
    text: 'A',
    entity: 'HR Department',
    riskLevel: 'low',
    position: 1,
    category: 'Anställd',
    stakeholderGroup: 'HR',
    rating: '+',
  },
  {
    id: '2',
    text: 'AA',
    entity: 'HR Department',
    riskLevel: 'medium',
    position: 1,
    category: 'Anställd',
    stakeholderGroup: 'HR',
    rating: '++',
  },
  {
    id: '3',
    text: 'AAA',
    entity: 'HR Department',
    riskLevel: 'high',
    position: 1,
    category: 'Anställd',
    stakeholderGroup: 'HR',
    rating: '+++',
  },
  
  // Företagshälsovård Group
  {
    id: '4',
    text: 'A',
    entity: 'Health Services',
    riskLevel: 'low',
    position: 1,
    category: 'Grupp',
    stakeholderGroup: 'Företagshälsovård',
    rating: '+',
  },
  {
    id: '5',
    text: 'AA',
    entity: 'Health Services',
    riskLevel: 'medium',
    position: 1,
    category: 'Grupp',
    stakeholderGroup: 'Företagshälsovård',
    rating: '++',
  },
  {
    id: '6',
    text: 'AAA',
    entity: 'Health Services',
    riskLevel: 'high',
    position: 1,
    category: 'Grupp',
    stakeholderGroup: 'Företagshälsovård',
    rating: '+++',
  },
];

// Mock system items based on the screenshot
const mockSystemItems: SystemItem[] = [
  {
    id: '1',
    kategori: 'Kvalitetslednings- system HR',
    system: '',
    leverantor: '',
    status: '',
    omdome: '',
  },
  {
    id: '2',
    kategori: 'Business Intelligence system',
    system: 'Power BI',
    leverantor: 'Microsoft',
    status: 'I drift',
    omdome: '+++',
  },
  {
    id: '3',
    kategori: 'Risk & tillbudshantering',
    system: '',
    leverantor: '',
    status: '',
    omdome: '++',
  },
  {
    id: '4',
    kategori: 'Organisationsstruktur',
    system: '',
    leverantor: '',
    status: '',
    omdome: '++',
  },
  {
    id: '5',
    kategori: 'Medarbetardatabas',
    system: '',
    leverantor: '',
    status: '',
    omdome: '++',
  },
  {
    id: '6',
    kategori: 'Sjukskrivningsdata Rapportering',
    system: 'Workday',
    leverantor: 'Workday',
    status: 'I drift',
    omdome: '++',
  },
  {
    id: '7',
    kategori: 'Arbetsmiljörapportering',
    system: 'Barium',
    leverantor: 'Egenutvecklat / Microsoft 360',
    status: 'I testfas',
    omdome: '++',
  },
  {
    id: '8',
    kategori: 'Omtankessamtal vid återkommande korttidsfrånvaro',
    system: 'Workday',
    leverantor: 'Workday',
    status: 'I drift',
    omdome: '++',
  },
  {
    id: '9',
    kategori: 'Avvikelse arbetsmiljöregistrering',
    system: 'Barium',
    leverantor: 'Egenutvecklat / Microsoft 360',
    status: 'I testfas',
    omdome: '++',
  },
  {
    id: '10',
    kategori: 'Psykosocial kartläggning',
    system: 'Apometern',
    leverantor: 'Eletive',
    status: 'I drift',
    omdome: '+++',
  },
  {
    id: '11',
    kategori: 'Hälsokartläggning',
    system: 'Apometern',
    leverantor: 'Eletive',
    status: 'I drift',
    omdome: '+++',
  },
  {
    id: '12',
    kategori: 'Engagemangsenkät',
    system: 'Apometern',
    leverantor: 'Eletive',
    status: 'I drift',
    omdome: '+++',
  },
];

const mockResources: Resource[] = [
  {
    id: '1',
    text: 'Employee Handbook',
    category: 'Documentation',
    tags: ['policy', 'guidelines'],
  },
  {
    id: '2',
    text: 'Onboarding Process',
    category: 'Process',
    tags: ['onboarding', 'HR'],
  },
];

interface HRMapState {
  items: Item[];
  systemItems: SystemItem[];
  stakeholderGroups: StakeholderGroup[];
  resources: Resource[];
  selectedCategory: Category | null;
  searchQuery: string;
  hideDeleteConfirmations: boolean;
  
  // Actions
  setSelectedCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  addItem: (item: Omit<Item, 'id' | 'position'>) => void;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id'>>) => void;
  deleteItem: (id: string) => void;
  addStakeholderGroup: (name: string) => void;
  updateStakeholderGroup: (id: string, name: string) => void;
  deleteStakeholderGroup: (id: string) => void;
  addSystemItem: (item: Omit<SystemItem, 'id'>) => void;
  updateSystemItem: (id: string, updates: Partial<Omit<SystemItem, 'id'>>) => void;
  deleteSystemItem: (id: string) => void;
  moveSystemItem: (draggedId: string, targetId: string) => void;
  moveItemUp: (id: string) => void;
  moveItemDown: (id: string) => void;
  changeItemRiskLevel: (id: string, newRiskLevel: RiskLevel) => void;
  changeItemRating: (id: string, newRating: Importance) => void;
  setHideDeleteConfirmations: (hide: boolean) => void;
  
  // Computed
  filteredItems: () => Item[];
  getItemsByStakeholderAndRisk: (stakeholderGroup: string, riskLevel: RiskLevel) => Item[];
}

export const useHRMapStore = create<HRMapState>((set, get) => ({
  items: mockItems,
  systemItems: mockSystemItems,
  stakeholderGroups: mockStakeholderGroups,
  resources: mockResources,
  selectedCategory: null,
  searchQuery: '',
  hideDeleteConfirmations: userPreferences.hideDeleteConfirmations,
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addItem: (item) => {
    const { items, selectedCategory } = get();
    const categoryItems = items.filter(i => 
      i.category === (item.category || selectedCategory) && 
      i.stakeholderGroup === item.stakeholderGroup &&
      i.riskLevel === item.riskLevel
    );
    
    const newPosition = categoryItems.length > 0 
      ? Math.max(...categoryItems.map(i => i.position)) + 1 
      : 1;
    
    const newItem: Item = {
      id: uuidv4(),
      position: newPosition,
      ...item,
      rating: item.rating || '+', // Use provided rating or default to '+'
      category: item.category || selectedCategory as Category,
    };
    
    set({ items: [...items, newItem] });
  },
  
  updateItem: (id, updates) => {
    const { items } = get();
    set({
      items: items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },
  
  deleteItem: (id) => {
    const { items } = get();
    set({
      items: items.filter(item => item.id !== id),
    });
  },
  
  addStakeholderGroup: (name) => {
    const { stakeholderGroups } = get();
    const newGroup: StakeholderGroup = {
      id: uuidv4(),
      name,
      position: stakeholderGroups.length + 1,
    };
    
    set({ stakeholderGroups: [...stakeholderGroups, newGroup] });
  },
  
  updateStakeholderGroup: (id, name) => {
    const { stakeholderGroups, items } = get();
    
    // Find the stakeholder group to update
    const groupToUpdate = stakeholderGroups.find(group => group.id === id);
    if (!groupToUpdate) return;
    
    const oldName = groupToUpdate.name;
    
    // Update the stakeholder group name
    const updatedGroups = stakeholderGroups.map(group => 
      group.id === id ? { ...group, name } : group
    );
    
    // Update all items that belong to this stakeholder group
    const updatedItems = items.map(item => 
      item.stakeholderGroup === oldName ? { ...item, stakeholderGroup: name } : item
    );
    
    set({ 
      stakeholderGroups: updatedGroups,
      items: updatedItems
    });
  },
  
  deleteStakeholderGroup: (id) => {
    const { stakeholderGroups, items } = get();
    
    // Find the stakeholder group to delete
    const groupToDelete = stakeholderGroups.find(group => group.id === id);
    if (!groupToDelete) return;
    
    // Delete the stakeholder group
    const updatedGroups = stakeholderGroups.filter(group => group.id !== id);
    
    // Delete all items that belong to this stakeholder group
    const updatedItems = items.filter(item => item.stakeholderGroup !== groupToDelete.name);
    
    set({ 
      stakeholderGroups: updatedGroups,
      items: updatedItems
    });
  },
  
  addSystemItem: (item) => {
    const { systemItems } = get();
    const newItem: SystemItem = {
      id: uuidv4(),
      ...item,
    };
    
    set({ systemItems: [...systemItems, newItem] });
  },
  
  updateSystemItem: (id, updates) => {
    const { systemItems } = get();
    set({
      systemItems: systemItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  },
  
  deleteSystemItem: (id) => {
    const { systemItems } = get();
    set({
      systemItems: systemItems.filter(item => item.id !== id),
    });
  },
  
  moveSystemItem: (draggedId, targetId) => {
    const { systemItems } = get();
    const draggedIndex = systemItems.findIndex(item => item.id === draggedId);
    const targetIndex = systemItems.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Create a new array with the dragged item moved to the target position
    const newItems = [...systemItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    set({ systemItems: newItems });
  },
  
  moveItemUp: (id) => {
    const { items } = get();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex <= 0) return; // Already at the top
    
    const item = items[itemIndex];
    const prevItem = items[itemIndex - 1];
    
    // Only swap if they're in the same category, stakeholder group, and risk level
    if (
      item.category === prevItem.category &&
      item.stakeholderGroup === prevItem.stakeholderGroup &&
      item.riskLevel === prevItem.riskLevel
    ) {
      // Swap positions
      const updatedItems = [...items];
      updatedItems[itemIndex] = { ...item, position: prevItem.position };
      updatedItems[itemIndex - 1] = { ...prevItem, position: item.position };
      
      set({ items: updatedItems });
    }
  },
  
  moveItemDown: (id) => {
    const { items } = get();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex === -1 || itemIndex >= items.length - 1) return; // Not found or already at the bottom
    
    const item = items[itemIndex];
    const nextItem = items[itemIndex + 1];
    
    // Only swap if they're in the same category, stakeholder group, and risk level
    if (
      item.category === nextItem.category &&
      item.stakeholderGroup === nextItem.stakeholderGroup &&
      item.riskLevel === nextItem.riskLevel
    ) {
      // Swap positions
      const updatedItems = [...items];
      updatedItems[itemIndex] = { ...item, position: nextItem.position };
      updatedItems[itemIndex + 1] = { ...nextItem, position: item.position };
      
      set({ items: updatedItems });
    }
  },
  
  changeItemRiskLevel: (id, newRiskLevel) => {
    const { items } = get();
    const item = items.find(i => i.id === id);
    
    if (!item) return;
    
    // Get the highest position in the new risk level for this stakeholder group and category
    const sameGroupItems = items.filter(i => 
      i.stakeholderGroup === item.stakeholderGroup &&
      i.category === item.category &&
      i.riskLevel === newRiskLevel
    );
    
    const newPosition = sameGroupItems.length > 0
      ? Math.max(...sameGroupItems.map(i => i.position)) + 1
      : 1;
    
    set({
      items: items.map(i => 
        i.id === id ? { ...i, riskLevel: newRiskLevel, position: newPosition } : i
      ),
    });
  },
  
  changeItemRating: (id, newRating) => {
    const { items } = get();
    
    set({
      items: items.map(i => 
        i.id === id ? { ...i, rating: newRating } : i
      ),
    });
  },
  
  setHideDeleteConfirmations: (hide: boolean) => {
    set({ hideDeleteConfirmations: hide });
  },
  
  filteredItems: () => {
    const { items, selectedCategory, searchQuery } = get();
    
    return items
      .filter(item => !selectedCategory || item.category === selectedCategory)
      .filter(item => 
        !searchQuery || 
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.stakeholderGroup.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.position - b.position);
  },
  
  getItemsByStakeholderAndRisk: (stakeholderGroup, riskLevel) => {
    const { items, selectedCategory } = get();
    
    return items
      .filter(item => item.stakeholderGroup === stakeholderGroup)
      .filter(item => item.riskLevel === riskLevel)
      .filter(item => !selectedCategory || item.category === selectedCategory)
      .sort((a, b) => a.position - b.position);
  },
})); 