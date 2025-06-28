'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { TransactionGrid } from '@/components/transactions/transaction-grid';
import { TransactionFilters } from '@/components/transactions/transaction-filters';
import { RealtimeIndicator } from '@/components/dashboard/realtime-indicator';
import { CollaborationPanel } from '@/components/collaboration/collaboration-panel';
import { mockTransactions, generateMockTransaction } from '@/lib/mock-data';
import { Transaction } from '@/types/transaction';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    stakeholder: 'all',
  });
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  // Initialize transactions on client-side only
  useEffect(() => {
    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTimeActive || transactions.length === 0) return;

    const interval = setInterval(() => {
      const shouldAddNew = Math.random() > 0.7;
      const shouldUpdateExisting = Math.random() > 0.5;

      setTransactions(prev => {
        let updated = [...prev];

        if (shouldAddNew) {
          updated = [generateMockTransaction(), ...updated.slice(0, 49)];
        }

        if (shouldUpdateExisting && updated.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(updated.length, 10));
          const statuses = ['pending', 'processing', 'completed', 'error'] as const;
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          
          updated[randomIndex] = {
            ...updated[randomIndex],
            status: newStatus,
            lastUpdated: new Date(),
          };
        }

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeActive, transactions.length]);

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (selectedFilters.status !== 'all') {
      filtered = filtered.filter(t => t.status === selectedFilters.status);
    }

    if (selectedFilters.type !== 'all') {
      filtered = filtered.filter(t => t.type === selectedFilters.type);
    }

    if (selectedFilters.stakeholder !== 'all') {
      filtered = filtered.filter(t => t.stakeholder === selectedFilters.stakeholder);
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedFilters]);

  const selectedTransaction = selectedTransactionId 
    ? transactions.find(t => t.id === selectedTransactionId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader />
        
        <div className="flex justify-between items-center">
          <DashboardStats transactions={transactions} />
          <RealtimeIndicator 
            isActive={isRealTimeActive}
            onToggle={setIsRealTimeActive}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
            <TransactionFilters
              filters={selectedFilters}
              onFiltersChange={setSelectedFilters}
              transactionCount={filteredTransactions.length}
            />
            
            <TransactionGrid
              transactions={filteredTransactions}
              onTransactionSelect={setSelectedTransactionId}
              selectedTransactionId={selectedTransactionId}
            />
          </div>

          <div className="xl:col-span-1">
            <CollaborationPanel
              selectedTransaction={selectedTransaction}
              onTransactionSelect={setSelectedTransactionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}