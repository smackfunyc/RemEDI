'use client';

import { Transaction } from '@/types/transaction';
import { TransactionCard } from './transaction-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionGridProps {
  transactions: Transaction[];
  onTransactionSelect: (id: string) => void;
  selectedTransactionId: string | null;
}

export function TransactionGrid({ transactions, onTransactionSelect, selectedTransactionId }: TransactionGridProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions match your current filters.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onClick={() => onTransactionSelect(transaction.id)}
            isSelected={transaction.id === selectedTransactionId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}