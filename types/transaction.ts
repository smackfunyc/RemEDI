export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'error';
export type TransactionType = '850' | '856' | '810' | '997';
export type StakeholderType = 'shipper' | 'carrier' | '4pl' | 'receiver';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  stakeholder: StakeholderType;
  partnerName: string;
  referenceNumber: string;
  amount?: number;
  errorMessage?: string;
  createdAt: Date;
  lastUpdated: Date;
  priority: 'low' | 'medium' | 'high';
  documentCount: number;
  validationScore?: number;
}

export interface EDIError {
  id: string;
  transactionId: string;
  type: 'validation' | 'mapping' | 'format' | 'business_rule';
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  suggestedFix?: string;
  autoFixable: boolean;
}

export interface Comment {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userRole: StakeholderType;
  message: string;
  createdAt: Date;
  isResolved?: boolean;
}