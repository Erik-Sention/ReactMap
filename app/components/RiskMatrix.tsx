import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useHRMapStore } from '../store';
import { RiskLevel, Importance, Item } from '../types';

interface RiskItemProps {
  item: Item;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeRiskLevel: (newRiskLevel: RiskLevel) => void;
  onChangeRating: (newRating: Importance) => void;
  onDelete: () => void;
}

const RiskItem: React.FC<RiskItemProps> = ({ 
  item, 
  onMoveUp, 
  onMoveDown, 
  onChangeRiskLevel,
  onChangeRating,
  onDelete
}) => {
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const [highlightedRating, setHighlightedRating] = useState<number>(0);
  const dragRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ratingButtonRef = useRef<HTMLButtonElement>(null);
  const ratingMenuRef = useRef<HTMLDivElement>(null);
  const { hideDeleteConfirmations, setHideDeleteConfirmations, updateItem } = useHRMapStore();
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Focus rating button when rating menu is opened
  useEffect(() => {
    if (showRatingMenu && ratingButtonRef.current) {
      ratingButtonRef.current.focus();
    }
  }, [showRatingMenu]);
  
  // Handle click outside rating menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ratingMenuRef.current && 
        !ratingMenuRef.current.contains(event.target as Node) &&
        ratingButtonRef.current &&
        !ratingButtonRef.current.contains(event.target as Node)
      ) {
        setShowRatingMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // Add a small delay to make the drag image appear
    setTimeout(() => {
      if (dragRef.current) {
        dragRef.current.style.opacity = '0.4';
      }
    }, 0);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragRef.current) {
      dragRef.current.style.opacity = '1';
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the click from affecting the parent elements
    e.stopPropagation();
    
    if (hideDeleteConfirmations) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (dontShowAgain) {
      setHideDeleteConfirmations(true);
    }
    setShowDeleteConfirm(false);
    onDelete();
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDontShowAgain(false);
  };
  
  const handleItemClick = (e: React.MouseEvent) => {
    // Only handle clicks on the main div, not on buttons or menus
    if (
      e.target === e.currentTarget || 
      (e.target as HTMLElement).closest('.item-text-container')
    ) {
      // Start editing mode
      setIsEditing(true);
      setEditedText(item.text);
    }
  };
  
  const handleSaveEdit = () => {
    if (editedText.trim() !== '') {
      updateItem(item.id, { text: editedText });
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(item.text);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Save the current text edit
      if (editedText.trim() !== '') {
        updateItem(item.id, { text: editedText });
      }
      // Exit edit mode for text
      setIsEditing(false);
      // Open the rating menu
      setShowRatingMenu(true);
    }
  };
  
  const handleRatingButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (showRatingMenu) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setHighlightedRating(prev => (prev + 1) % ratingOptions.length);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setHighlightedRating(prev => (prev - 1 + ratingOptions.length) % ratingOptions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onChangeRating(ratingOptions[highlightedRating].value);
        setShowRatingMenu(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowRatingMenu(false);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setShowRatingMenu(false);
      }
    }
  };
  
  const ratingOptions: Array<{value: Importance, description: string}> = [
    { value: '+', description: 'Rätt riskgrupp i rätt tid' },
    { value: '++', description: 'Används i önskad utsträckning' },
    { value: '+++', description: 'Har övsedd effekt' }
  ];
  
  return (
    <>
      <div 
        ref={dragRef}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleItemClick}
        className={`flex items-center justify-between bg-white rounded-md shadow-sm p-3 mb-2 ${isDragging ? 'opacity-40' : ''} group cursor-pointer`}
      >
        <div className="flex items-center flex-grow item-text-container">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCancelEdit}
              className="w-full px-2 py-1 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              autoFocus
              aria-label="Edit item text"
              title="Edit item text"
              placeholder="Enter item text"
            />
          ) : (
            <span>{item.text}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
                className="text-green-500 hover:text-green-700 focus:outline-none"
                title="Save changes"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                title="Cancel editing"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <button 
                  ref={ratingButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRatingMenu(!showRatingMenu);
                  }}
                  onKeyDown={handleRatingButtonKeyDown}
                  className="text-gray-600 font-medium hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                  aria-label="Change rating"
                  title="Change rating"
                  tabIndex={0}
                >
                  {item.rating}
                </button>
                
                {showRatingMenu && (
                  <div 
                    ref={ratingMenuRef}
                    className="absolute right-0 mt-1 bg-white shadow-md rounded-md py-1 z-10 w-64"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ratingOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeRating(option.value);
                          setShowRatingMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          item.rating === option.value ? 'bg-gray-100' : 
                          index === highlightedRating ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{option.value}</span>
                          <span className="text-gray-600 text-xs">{option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleDeleteClick}
                className="text-red-400 hover:text-red-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Delete item"
                title="Delete item"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Close the dialog when clicking the backdrop
            if (e.target === e.currentTarget) {
              handleCancelDelete();
            }
            // Prevent clicks from reaching elements behind the dialog
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-4">Delete Item</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Do not show this confirmation again</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface AddItemButtonProps {
  onClick: () => void;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-200"
      aria-label="Add new item"
      title="Add new item"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

interface RiskColumnProps {
  title: string;
  color: string;
  bgColor: string;
  riskLevel: RiskLevel;
  items: Item[];
  onAddItem: (riskLevel: RiskLevel, text: string, rating: Importance) => void;
  onMoveItemUp: (id: string) => void;
  onMoveItemDown: (id: string) => void;
  onChangeRiskLevel: (id: string, newRiskLevel: RiskLevel) => void;
  onChangeRating: (id: string, newRating: Importance) => void;
  onDeleteItem: (id: string) => void;
}

const RiskColumn: React.FC<RiskColumnProps> = ({
  title,
  color,
  bgColor,
  riskLevel,
  items,
  onAddItem,
  onMoveItemUp,
  onMoveItemDown,
  onChangeRiskLevel,
  onChangeRating,
  onDeleteItem
}) => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [activeField, setActiveField] = useState<'text' | 'rating' | null>(null);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [selectedRating, setSelectedRating] = useState<Importance>('+');
  const inputRef = useRef<HTMLInputElement>(null);
  const ratingButtonRef = useRef<HTMLButtonElement>(null);
  const ratingMenuRef = useRef<HTMLDivElement>(null);
  
  // Focus input when adding item starts
  useEffect(() => {
    if (isAddingItem && activeField === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingItem, activeField]);
  
  // Focus rating button when switching to rating field
  useEffect(() => {
    if (isAddingItem && activeField === 'rating' && ratingButtonRef.current) {
      ratingButtonRef.current.focus();
      setShowRatingMenu(true);
    }
  }, [isAddingItem, activeField]);
  
  // Handle click outside rating menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ratingMenuRef.current && 
        !ratingMenuRef.current.contains(event.target as Node) &&
        ratingButtonRef.current &&
        !ratingButtonRef.current.contains(event.target as Node)
      ) {
        setShowRatingMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleStartAddingItem = () => {
    setIsAddingItem(true);
    setActiveField('text');
    setNewItemText('');
    setSelectedRating('+');
  };
  
  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    onAddItem(riskLevel, newItemText, selectedRating);
    resetAddItemState();
  };
  
  const resetAddItemState = () => {
    setIsAddingItem(false);
    setActiveField(null);
    setNewItemText('');
    setShowRatingMenu(false);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      resetAddItemState();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeField === 'text') {
        if (newItemText.trim()) {
          setActiveField('rating');
        }
      } else if (activeField === 'rating') {
        handleAddItem();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (activeField === 'text') {
        setActiveField('rating');
      } else if (activeField === 'rating' && !e.shiftKey) {
        handleAddItem();
      } else if (activeField === 'rating' && e.shiftKey) {
        setActiveField('text');
      }
    }
  };
  
  const handleRatingSelect = (rating: Importance) => {
    setSelectedRating(rating);
    setShowRatingMenu(false);
    
    // Small delay to allow the UI to update before adding the item
    setTimeout(() => {
      if (newItemText.trim()) {
        onAddItem(riskLevel, newItemText, rating);
        resetAddItemState();
      }
    }, 100);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    onChangeRiskLevel(itemId, riskLevel);
  };
  
  const ratingOptions: Array<{value: Importance, description: string}> = [
    { value: '+', description: 'Rätt riskgrupp i rätt tid' },
    { value: '++', description: 'Används i önskad utsträckning' },
    { value: '+++', description: 'Har övsedd effekt' }
  ];
  
  return (
    <div 
      className={`${bgColor} rounded-lg p-4`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center mb-4">
        <span className={`w-3 h-3 ${color} rounded-full mr-2`}></span>
        <h3 className="font-medium">{title}</h3>
      </div>
      
      <div className="mb-4">
        {items.map(item => (
          <RiskItem 
            key={item.id} 
            item={item}
            onMoveUp={() => onMoveItemUp(item.id)}
            onMoveDown={() => onMoveItemDown(item.id)}
            onChangeRiskLevel={(newRiskLevel) => onChangeRiskLevel(item.id, newRiskLevel)}
            onChangeRating={(newRating) => onChangeRating(item.id, newRating)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </div>
      
      {isAddingItem ? (
        <div className="bg-white rounded-md shadow-sm p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-grow mr-4">
              {activeField === 'text' ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                  placeholder="Enter item text"
                  autoFocus
                />
              ) : (
                <div 
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                  onClick={() => setActiveField('text')}
                >
                  {newItemText}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                ref={ratingButtonRef}
                onClick={() => {
                  setActiveField('rating');
                  setShowRatingMenu(!showRatingMenu);
                }}
                onKeyDown={handleKeyDown}
                className={`text-gray-600 font-medium hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded ${activeField === 'rating' ? 'bg-blue-100' : ''}`}
                aria-label="Select rating"
                title="Select rating"
              >
                {selectedRating}
              </button>
              
              {showRatingMenu && (
                <div 
                  ref={ratingMenuRef}
                  className="absolute right-0 mt-1 bg-white shadow-md rounded-md py-1 z-10 w-64"
                >
                  {ratingOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleRatingSelect(option.value)}
                      className={`block w-full text-left px-4 py-2 text-sm ${selectedRating === option.value ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{option.value}</span>
                        <span className="text-gray-600 text-xs">{option.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex ml-2">
              <button 
                onClick={resetAddItemState}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                aria-label="Cancel"
                title="Cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <AddItemButton onClick={handleStartAddingItem} />
        </div>
      )}
    </div>
  );
};

interface StakeholderSectionProps {
  title: string;
  id: string;
}

const StakeholderSection: React.FC<StakeholderSectionProps> = ({ title, id }) => {
  const { 
    getItemsByStakeholderAndRisk, 
    addItem, 
    deleteItem,
    moveItemUp,
    moveItemDown,
    changeItemRiskLevel,
    changeItemRating,
    selectedCategory,
    updateStakeholderGroup,
    deleteStakeholderGroup
  } = useHRMapStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const lowRiskItems = getItemsByStakeholderAndRisk(title, 'low');
  const mediumRiskItems = getItemsByStakeholderAndRisk(title, 'medium');
  const highRiskItems = getItemsByStakeholderAndRisk(title, 'high');
  
  const handleAddItem = (riskLevel: RiskLevel, text: string, rating: Importance = '+') => {
    if (!text) return;
    
    addItem({
      text: text,
      entity: title,
      riskLevel: riskLevel,
      stakeholderGroup: title,
      category: selectedCategory || 'Anställd', // Use selected category or default
      rating: rating, // Use the provided rating
    });
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
    // Focus the input field after it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  
  const handleSaveClick = () => {
    if (newTitle.trim() !== '') {
      updateStakeholderGroup(id, newTitle);
      setIsEditing(false);
    }
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    deleteStakeholderGroup(id);
    setShowDeleteConfirm(false);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    } else if (e.key === 'Escape') {
      setNewTitle(title);
      setIsEditing(false);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {isEditing ? (
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-xl font-semibold px-2 py-1 border border-gray-300 rounded-md mr-2"
              aria-label="Edit stakeholder group name"
            />
            <button 
              onClick={handleSaveClick}
              className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm"
              aria-label="Save stakeholder group name"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setNewTitle(title);
                setIsEditing(false);
              }}
              className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteClick}
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm"
              aria-label="Delete stakeholder group"
            >
              Delete
            </button>
          </div>
        ) : (
          <div 
            className="flex items-center relative group cursor-pointer px-3 py-2 -mx-3 rounded hover:bg-gray-50 min-w-[200px]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <h2 className="text-xl font-semibold">{title}</h2>
            {isHovering && (
              <button 
                onClick={handleEditClick}
                className="ml-3 text-gray-500 hover:text-gray-700"
                aria-label="Edit stakeholder group name"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Stakeholder Group</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete "{title}"? This will also delete all items associated with this stakeholder group. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-6">
        {/* Low Risk Column */}
        <RiskColumn
          title="Ej risk"
          color="bg-green-500"
          bgColor="bg-green-50"
          riskLevel="low"
          items={lowRiskItems}
          onAddItem={handleAddItem}
          onMoveItemUp={moveItemUp}
          onMoveItemDown={moveItemDown}
          onChangeRiskLevel={changeItemRiskLevel}
          onChangeRating={changeItemRating}
          onDeleteItem={deleteItem}
        />
        
        {/* Medium Risk Column */}
        <RiskColumn
          title="Risk"
          color="bg-yellow-500"
          bgColor="bg-yellow-50"
          riskLevel="medium"
          items={mediumRiskItems}
          onAddItem={handleAddItem}
          onMoveItemUp={moveItemUp}
          onMoveItemDown={moveItemDown}
          onChangeRiskLevel={changeItemRiskLevel}
          onChangeRating={changeItemRating}
          onDeleteItem={deleteItem}
        />
        
        {/* High Risk Column */}
        <RiskColumn
          title="Hög risk"
          color="bg-red-500"
          bgColor="bg-red-50"
          riskLevel="high"
          items={highRiskItems}
          onAddItem={handleAddItem}
          onMoveItemUp={moveItemUp}
          onMoveItemDown={moveItemDown}
          onChangeRiskLevel={changeItemRiskLevel}
          onChangeRating={changeItemRating}
          onDeleteItem={deleteItem}
        />
      </div>
      
      <div className="flex space-x-4 mt-4">
        <div className="flex items-center text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-md">
          <span className="mr-1 font-medium">+</span> Rätt riskgrupp i rätt tid
        </div>
        <div className="flex items-center text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-md">
          <span className="mr-1 font-medium">++</span> Används i önskad utsträckning
        </div>
        <div className="flex items-center text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-md">
          <span className="mr-1 font-medium">+++</span> Har övsedd effekt
        </div>
      </div>
    </div>
  );
};

const RiskMatrix: React.FC = () => {
  const { stakeholderGroups, addStakeholderGroup } = useHRMapStore();
  const [showAddStakeholderForm, setShowAddStakeholderForm] = useState(false);
  const [newStakeholderName, setNewStakeholderName] = useState('');
  
  const handleAddStakeholderGroup = () => {
    if (!newStakeholderName) return;
    
    addStakeholderGroup(newStakeholderName);
    setNewStakeholderName('');
    setShowAddStakeholderForm(false);
  };
  
  return (
    <div className="py-6">
      {stakeholderGroups.map(group => (
        <StakeholderSection key={group.id} title={group.name} id={group.id} />
      ))}
      
      {showAddStakeholderForm ? (
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <h3 className="text-lg font-medium mb-3">Add New Stakeholder Group</h3>
          <input
            type="text"
            value={newStakeholderName}
            onChange={(e) => setNewStakeholderName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            placeholder="Enter stakeholder group name"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setShowAddStakeholderForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddStakeholderGroup}
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
            >
              Add Group
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddStakeholderForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Stakeholder Group
        </button>
      )}
    </div>
  );
};

export default RiskMatrix; 