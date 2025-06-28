'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import { formatDistanceToNow } from 'date-fns';
import { Clock, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
  isSelected: boolean;
}

export function TransactionCard({ transaction, onClick, isSelected }: TransactionCardProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'status-pending',
      processing: 'status-processing',
      completed: 'status-completed',
      error: 'status-error',
    };
    return variants[status as keyof typeof variants] || 'status-pending';
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      '850': 'Purchase Order',
      '856': 'Ship Notice',
      '810': 'Invoice',
      '997': 'Acknowledgment',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case 'medium':
        return <TrendingUp className="h-3 w-3 text-yellow-400" />;
      default:
        return <Clock className="h-3 w-3 text-blue-400" />;
    }
  };

  return (
    <Card 
      className={cn(
        "transaction-card cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs border", getStatusBadge(transaction.status))}>
              {transaction.status.toUpperCase()}
            </Badge>
            {getPriorityIcon(transaction.priority)}
          </div>
          <Badge variant="outline" className="text-xs">
            {transaction.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-sm">{getTransactionTypeLabel(transaction.type)}</h3>
          <p className="text-xs text-muted-foreground">{transaction.partnerName}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs">
            <span className="text-muted-foreground">Ref:</span> {transaction.referenceNumber}
          </p>
          {transaction.amount && (
            <p className="text-xs">
              <span className="text-muted-foreground">Amount:</span> ${transaction.amount.toLocaleString()}
            </p>
          )}
        </div>

        {transaction.errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
            <p className="text-xs text-red-400">{transaction.errorMessage}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>{transaction.documentCount} docs</span>
          </div>
          <span>{formatDistanceToNow(transaction.lastUpdated, { addSuffix: true })}</span>
        </div>

        {transaction.validationScore && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Validation Score</span>
            <Badge 
              variant={transaction.validationScore >= 90 ? "default" : "secondary"}
              className="text-xs"
            >
              {transaction.validationScore}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}