import React from 'react';
import { useHRMapStore } from '../store';
import { Category } from '../types';

const Header: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useHRMapStore();
  
  // Define all categories including System
  const categories: (Category | 'System')[] = [
    'Anställd',
    'Grupp',
    'Organisation',
    'Företagsledning',
    'Managers LG',
    'Supervisors AC',
    'System'
  ];
  
  const handleCategoryClick = (category: Category | 'System') => {
    if (category === 'System') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };
  
  return (
    <header className="bg-white shadow-md py-2 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold text-gray-800">SENTION Kartläggning</h1>
          </div>
          
          {/* Category tabs */}
          <div className="flex items-center space-x-1 flex-grow justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-2 text-sm font-medium ${
                  (category === 'System' && selectedCategory === null) || 
                  (category !== 'System' && selectedCategory === category)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* User actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button className="flex items-center text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Användarhantering
            </button>
            
            <button className="flex items-center text-sm font-medium text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 