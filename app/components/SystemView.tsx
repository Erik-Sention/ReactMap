import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useHRMapStore } from '../store';
import { SystemItem, Importance, Status } from '../types';
import { createPortal } from 'react-dom';

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isEditing: boolean;
  onBlur: () => void;
  autoFocus?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  onChange, 
  onKeyDown, 
  isEditing, 
  onBlur,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, autoFocus]);
  
  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className="w-full px-2 py-1 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[32px]"
      autoFocus={autoFocus}
      aria-label="Edit cell value"
      title="Edit cell value"
    />
  ) : (
    <div className="px-2 py-1 cursor-pointer hover:bg-gray-100 h-[32px] flex items-center">
      {value || '-'}
    </div>
  );
};

interface EditableSelectCellProps {
  value: string;
  options: Array<{value: string, label: string}>;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isEditing: boolean;
  onBlur: () => void;
  autoFocus?: boolean;
}

const EditableSelectCell: React.FC<EditableSelectCellProps> = ({ 
  value, 
  options,
  onChange, 
  onKeyDown, 
  isEditing, 
  onBlur,
  autoFocus = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Set isBrowser to true when component mounts
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Calculate dropdown position when it's shown
  useEffect(() => {
    if (showDropdown && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showDropdown]);
  
  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      const currentIndex = options.findIndex(option => option.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [showDropdown, options, value]);
  
  useEffect(() => {
    if (isEditing && autoFocus) {
      setShowDropdown(true);
    }
  }, [isEditing, autoFocus]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Scroll highlighted option into view
  useEffect(() => {
    if (showDropdown && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, showDropdown]);
  
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setShowDropdown(false);
  };
  
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        setShowDropdown(true);
        return;
      }
    }
    
    if (showDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionClick(options[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowDropdown(false);
          break;
        case 'Tab':
          // Let the parent handle tab navigation
          setShowDropdown(false);
          onKeyDown(e as unknown as KeyboardEvent<HTMLInputElement | HTMLSelectElement>);
          break;
        default:
          break;
      }
    } else {
      // If dropdown is not shown, let parent handle keyboard events
      onKeyDown(e as unknown as KeyboardEvent<HTMLInputElement | HTMLSelectElement>);
    }
  };
  
  const getDisplayValue = () => {
    if (value === 'I drift') return <span className="text-green-600">{value}</span>;
    if (value === 'I testfas') return <span className="text-orange-600">{value}</span>;
    if (!value) return <span>-</span>;
    return <span>{value}</span>;
  };
  
  // Create dropdown portal
  const dropdownPortal = showDropdown && isBrowser ? 
    createPortal(
      <div 
        ref={dropdownRef}
        className="fixed z-50 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            ref={(el) => { optionRefs.current[index] = el; }}
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${highlightedIndex === index ? 'bg-blue-100' : value === option.value ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleOptionClick(option.value)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            <span className="block truncate">
              {option.label}
            </span>
            {value === option.value && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>,
      document.body
    ) : null;
  
  return (
    <div className="relative" onKeyDown={handleDropdownKeyDown} tabIndex={isEditing ? 0 : -1} ref={cellRef}>
      <div 
        className="px-2 py-1 cursor-pointer hover:bg-gray-100 h-[32px] flex items-center"
        onClick={() => isEditing && setShowDropdown(!showDropdown)}
      >
        {isEditing ? (
          <div className="flex items-center justify-between w-full">
            <span>{getDisplayValue()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          getDisplayValue()
        )}
      </div>
      
      {dropdownPortal}
    </div>
  );
};

interface EditableRatingCellProps {
  value: Importance;
  onChange: (value: Importance) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isEditing: boolean;
  onBlur: () => void;
  autoFocus?: boolean;
}

const EditableRatingCell: React.FC<EditableRatingCellProps> = ({ 
  value, 
  onChange, 
  onKeyDown, 
  isEditing, 
  onBlur,
  autoFocus = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isBrowser, setIsBrowser] = useState(false);
  
  const ratingOptions = [
    { value: '', label: '-' },
    { value: '+', label: '+ (Rätt riskgrupp i rätt tid)' },
    { value: '++', label: '++ (Används i önskad utsträckning)' },
    { value: '+++', label: '+++ (Har övsedd effekt)' }
  ];
  
  // Set isBrowser to true when component mounts
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Calculate dropdown position when it's shown
  useEffect(() => {
    if (showDropdown && cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: Math.max(0, rect.left + window.scrollX - 150), // Ensure dropdown is visible
        width: 250 // Fixed width for rating dropdown
      });
    }
  }, [showDropdown]);
  
  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      const currentIndex = ratingOptions.findIndex(option => option.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [showDropdown, value]);
  
  useEffect(() => {
    if (isEditing && autoFocus) {
      setShowDropdown(true);
    }
  }, [isEditing, autoFocus]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          cellRef.current && !cellRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Scroll highlighted option into view
  useEffect(() => {
    if (showDropdown && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, showDropdown]);
  
  const handleOptionClick = (optionValue: Importance) => {
    onChange(optionValue);
    setShowDropdown(false);
  };
  
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        setShowDropdown(true);
        return;
      }
    }
    
    if (showDropdown) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < ratingOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionClick(ratingOptions[highlightedIndex].value as Importance);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowDropdown(false);
          break;
        case 'Tab':
          // Let the parent handle tab navigation
          setShowDropdown(false);
          onKeyDown(e as unknown as KeyboardEvent<HTMLInputElement | HTMLSelectElement>);
          break;
        default:
          break;
      }
    } else {
      // If dropdown is not shown, let parent handle keyboard events
      onKeyDown(e as unknown as KeyboardEvent<HTMLInputElement | HTMLSelectElement>);
    }
  };
  
  // Create dropdown portal
  const dropdownPortal = showDropdown && isBrowser ? 
    createPortal(
      <div 
        ref={dropdownRef}
        className="fixed z-50 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
      >
        {ratingOptions.map((option, index) => (
          <div
            key={option.value}
            ref={(el) => { optionRefs.current[index] = el; }}
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${highlightedIndex === index ? 'bg-blue-100' : value === option.value ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleOptionClick(option.value as Importance)}
            onMouseEnter={() => setHighlightedIndex(index)}
          >
            <div className="flex items-center">
              <span className="font-medium mr-2">{option.value || '-'}</span>
              {option.value && (
                <span className="text-gray-600 text-sm">{option.label.split('(')[1]?.replace(')', '') || ''}</span>
              )}
            </div>
            {value === option.value && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>,
      document.body
    ) : null;
  
  return (
    <div className="relative" onKeyDown={handleDropdownKeyDown} tabIndex={isEditing ? 0 : -1} ref={cellRef}>
      <div 
        className="px-2 py-1 cursor-pointer hover:bg-gray-100 h-[32px] flex items-center justify-center font-medium"
        onClick={() => isEditing && setShowDropdown(!showDropdown)}
      >
        {isEditing ? (
          <div className="flex items-center justify-between w-full">
            <span className="mx-auto">{value || '-'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 absolute right-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <span>{value || '-'}</span>
        )}
      </div>
      
      {dropdownPortal}
    </div>
  );
};

interface SystemItemRowProps {
  item: SystemItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<SystemItem, 'id'>>) => void;
  activeCell: { rowId: string, field: string } | null;
  setActiveCell: (cell: { rowId: string, field: string } | null) => void;
  onMoveItem: (draggedId: string, targetId: string) => void;
  index: number;
}

const SystemItemRow: React.FC<SystemItemRowProps> = ({ 
  item, 
  onDelete, 
  onUpdate,
  activeCell,
  setActiveCell,
  onMoveItem,
  index
}) => {
  const isEditing = (field: string) => 
    activeCell?.rowId === item.id && activeCell?.field === field;
  
  const isRowActive = activeCell?.rowId === item.id;
  const [isDragging, setIsDragging] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { hideDeleteConfirmations, setHideDeleteConfirmations } = useHRMapStore();
  
  const handleCellClick = (field: string) => {
    setActiveCell({ rowId: item.id, field });
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, field: string) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const fields = ['kategori', 'system', 'leverantor', 'status', 'omdome'];
      const currentIndex = fields.indexOf(field);
      const nextIndex = e.shiftKey 
        ? (currentIndex - 1 + fields.length) % fields.length 
        : (currentIndex + 1) % fields.length;
      
      setActiveCell({ rowId: item.id, field: fields[nextIndex] });
    } else if (e.key === 'Enter') {
      setActiveCell(null);
    } else if (e.key === 'Escape') {
      setActiveCell(null);
    }
  };
  
  // Handle status change to automatically show rating dropdown
  const handleStatusChange = (value: string) => {
    onUpdate(item.id, { status: value as Status });
    
    // If a status is selected, automatically move to the rating field
    if (value) {
      setTimeout(() => {
        setActiveCell({ rowId: item.id, field: 'omdome' });
      }, 100); // Small delay to ensure the status update is processed first
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    
    // Add a small delay to make the drag image appear
    setTimeout(() => {
      if (rowRef.current) {
        rowRef.current.style.opacity = '0.4';
      }
    }, 0);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    if (rowRef.current) {
      rowRef.current.style.opacity = '1';
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== item.id) {
      onMoveItem(draggedId, item.id);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hideDeleteConfirmations) {
      onDelete(item.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (dontShowAgain) {
      setHideDeleteConfirmations(true);
    }
    setShowDeleteConfirm(false);
    onDelete(item.id);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const statusOptions = [
    { value: '', label: '-' },
    { value: 'I drift', label: 'I drift' },
    { value: 'I testfas', label: 'I testfas' }
  ];
  
  return (
    <>
      <tr 
        ref={rowRef}
        className={`border-t border-gray-200 hover:bg-gray-50 group ${isDragging ? 'opacity-40' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <td className="py-1 px-2 text-center w-20">
          <div className="flex items-center justify-center space-x-2">
            <button 
              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none"
              aria-label="Delete item"
              title="Delete item"
              onClick={handleDeleteClick}
              tabIndex={-1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </td>
        <td className="w-1/5" onClick={() => handleCellClick('kategori')}>
          <EditableCell
            value={item.kategori}
            onChange={(value) => onUpdate(item.id, { kategori: value })}
            onKeyDown={(e) => handleKeyDown(e, 'kategori')}
            isEditing={isEditing('kategori')}
            onBlur={() => setActiveCell(null)}
            autoFocus={isEditing('kategori')}
          />
        </td>
        <td className="w-1/5" onClick={() => handleCellClick('system')}>
          <EditableCell
            value={item.system}
            onChange={(value) => onUpdate(item.id, { system: value })}
            onKeyDown={(e) => handleKeyDown(e, 'system')}
            isEditing={isEditing('system')}
            onBlur={() => setActiveCell(null)}
            autoFocus={isEditing('system')}
          />
        </td>
        <td className="w-1/5" onClick={() => handleCellClick('leverantor')}>
          <EditableCell
            value={item.leverantor}
            onChange={(value) => onUpdate(item.id, { leverantor: value })}
            onKeyDown={(e) => handleKeyDown(e, 'leverantor')}
            isEditing={isEditing('leverantor')}
            onBlur={() => setActiveCell(null)}
            autoFocus={isEditing('leverantor')}
          />
        </td>
        <td className="w-1/5" onClick={() => handleCellClick('status')}>
          <EditableSelectCell
            value={item.status}
            options={statusOptions}
            onChange={handleStatusChange}
            onKeyDown={(e) => handleKeyDown(e, 'status')}
            isEditing={isEditing('status')}
            onBlur={() => setActiveCell(null)}
            autoFocus={isEditing('status')}
          />
        </td>
        <td className="w-1/5 text-center" onClick={() => handleCellClick('omdome')}>
          <EditableRatingCell
            value={item.omdome}
            onChange={(value) => onUpdate(item.id, { omdome: value })}
            onKeyDown={(e) => handleKeyDown(e, 'omdome')}
            isEditing={isEditing('omdome')}
            onBlur={() => setActiveCell(null)}
            autoFocus={isEditing('omdome')}
          />
        </td>
      </tr>
      
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

const SystemView: React.FC = () => {
  const { systemItems, addSystemItem, updateSystemItem, deleteSystemItem, moveSystemItem } = useHRMapStore();
  const [activeCell, setActiveCell] = useState<{ rowId: string, field: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SystemItem | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  
  // Function to add a new empty item
  const handleAddNewItem = () => {
    const newEmptyItem: Omit<SystemItem, 'id'> = {
      kategori: '',
      system: '',
      leverantor: '',
      status: '' as Status,
      omdome: '',
    };
    
    // Add the empty item to the store
    addSystemItem(newEmptyItem);
    
    // Since addSystemItem doesn't return the ID, we need to find the newly added item
    // by looking for an empty kategori field in the next render cycle
    setTimeout(() => {
      const emptyItem = systemItems.find(item => 
        item.kategori === '' && 
        item.system === '' && 
        item.leverantor === '' && 
        item.status === '' && 
        item.omdome === ''
      );
      
      if (emptyItem) {
        setActiveCell({ rowId: emptyItem.id, field: 'kategori' });
      }
    }, 10);
  };
  
  const handleMoveItem = (draggedId: string, targetId: string) => {
    moveSystemItem(draggedId, targetId);
  };
  
  const requestSort = (key: keyof SystemItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Function to get sorted items
  const getSortedItems = () => {
    const sortableItems = [...systemItems];
    
    if (sortConfig.key === null) {
      return sortableItems;
    }
    
    return sortableItems.sort((a, b) => {
      const key = sortConfig.key as keyof SystemItem;
      
      // Special handling for omdöme (sort by number of + signs)
      if (key === 'omdome') {
        const aValue = (a[key] || '').length;
        const bValue = (b[key] || '').length;
        
        if (sortConfig.direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } 
      // Special handling for status (I drift comes before I testfas)
      else if (key === 'status') {
        const statusOrder: Record<Status, number> = {
          '': 0,
          'I drift': 1,
          'I testfas': 2
        };
        
        const aValue = statusOrder[a[key] as Status] || 0;
        const bValue = statusOrder[b[key] as Status] || 0;
        
        if (sortConfig.direction === 'ascending') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
      // Default string comparison for other fields
      else {
        const aValue = a[key] || '';
        const bValue = b[key] || '';
        
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });
  };
  
  const sortedItems = getSortedItems();
  
  const getSortIcon = (key: keyof SystemItem) => {
    if (sortConfig.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'ascending' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  const statusOptions = [
    { value: '', label: '-' },
    { value: 'I drift', label: 'I drift' },
    { value: 'I testfas', label: 'I testfas' }
  ];
  
  const ratingOptions = [
    { value: '', label: '-' },
    { value: '+', label: '+ (Rätt riskgrupp i rätt tid)' },
    { value: '++', label: '++ (Används i önskad utsträckning)' },
    { value: '+++', label: '+++ (Har övsedd effekt)' }
  ];
  
  return (
    <div className="py-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-3 px-2 text-center w-20">&nbsp;</th>
              <th 
                className="py-3 px-4 font-medium text-gray-700 w-1/5 cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('kategori')}
              >
                <div className="flex items-center">
                  <span>Kategori</span>
                  <span className="ml-1">{getSortIcon('kategori')}</span>
                </div>
              </th>
              <th 
                className="py-3 px-4 font-medium text-gray-700 w-1/5 cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('system')}
              >
                <div className="flex items-center">
                  <span>System</span>
                  <span className="ml-1">{getSortIcon('system')}</span>
                </div>
              </th>
              <th 
                className="py-3 px-4 font-medium text-gray-700 w-1/5 cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('leverantor')}
              >
                <div className="flex items-center">
                  <span>Leverantör</span>
                  <span className="ml-1">{getSortIcon('leverantor')}</span>
                </div>
              </th>
              <th 
                className="py-3 px-4 font-medium text-gray-700 w-1/5 cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  <span className="ml-1">{getSortIcon('status')}</span>
                </div>
              </th>
              <th 
                className="py-3 px-4 font-medium text-gray-700 text-center w-1/5 cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('omdome')}
              >
                <div className="flex items-center justify-center">
                  <span>Omdöme</span>
                  <span className="ml-1">{getSortIcon('omdome')}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <SystemItemRow 
                key={item.id} 
                item={item} 
                onDelete={deleteSystemItem} 
                onUpdate={updateSystemItem}
                activeCell={activeCell}
                setActiveCell={setActiveCell}
                onMoveItem={handleMoveItem}
                index={index}
              />
            ))}
            
            {/* Add new item button row */}
            <tr className="border-t border-gray-200 bg-gray-50 hover:bg-gray-100">
              <td colSpan={6} className="py-2 px-4">
                <button 
                  onClick={handleAddNewItem}
                  className="flex items-center text-green-600 hover:text-green-800 font-medium"
                  aria-label="Add new item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex space-x-4">
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

export default SystemView; 