'use client';

import React from 'react';
import Header from './components/Header';
import RiskMatrix from './components/RiskMatrix';
import SystemView from './components/SystemView';
import { useHRMapStore } from './store';

export default function Home() {
  const { selectedCategory } = useHRMapStore();
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {selectedCategory === null ? (
          <SystemView />
        ) : (
          <RiskMatrix />
        )}
      </div>
    </main>
  );
} 