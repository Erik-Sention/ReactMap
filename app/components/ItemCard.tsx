import React, { useState } from 'react';
import { Item, RiskLevel } from '../types';
import { useHRMapStore } from '../store';

interface ItemCardProps {
  item: Item;
  index: number;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const { updateItem, deleteItem, hideDeleteConfirmations, setHideDeleteConfirmations } = useHRMapStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.text);
  const [editedEntity, setEditedEntity] = useState(item.entity);
  const [editedRiskLevel, setEditedRiskLevel] = useState<RiskLevel>(item.riskLevel);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const handleSave = () => {
    updateItem(item.id, {
      text: editedText,
      entity: editedEntity,
      riskLevel: editedRiskLevel,
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedText(item.text);
    setEditedEntity(item.entity);
    setEditedRiskLevel(item.riskLevel);
    setIsEditing(false);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hideDeleteConfirmations) {
      deleteItem(item.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (dontShowAgain) {
      setHideDeleteConfirmations(true);
    }
    deleteItem(item.id);
    setShowDeleteConfirm(false);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  const getRiskBadgeClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      default:
        return 'risk-low';
    }
  };
  
  return (
    <div className="card mb-4 hover:shadow-lg transition-shadow duration-200">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor={`item-text-${item.id}`} className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Text
            </label>
            <input
              id={`item-text-${item.id}`}
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Item text"
              placeholder="Enter item text"
            />
          </div>
          
          <div>
            <label htmlFor={`item-entity-${item.id}`} className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Entity
            </label>
            <input
              id={`item-entity-${item.id}`}
              type="text"
              value={editedEntity}
              onChange={(e) => setEditedEntity(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Item entity"
              placeholder="Enter entity name"
            />
          </div>
          
          <div>
            <label htmlFor={`item-risk-${item.id}`} className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Risk Level
            </label>
            <select
              id={`item-risk-${item.id}`}
              value={editedRiskLevel}
              onChange={(e) => setEditedRiskLevel(e.target.value as RiskLevel)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Risk level"
              title="Select risk level"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{item.text}</h3>
            <span className={`risk-badge ${getRiskBadgeClass(item.riskLevel)}`}>
              {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
            </span>
          </div>
          
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Entity: {item.entity}
          </p>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </>
      )}
      
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
    </div>
  );
};

export default ItemCard; 