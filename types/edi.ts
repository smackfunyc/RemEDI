export interface EDIFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'uploaded' | 'processing' | 'validated' | 'sent' | 'received' | 'processed' | 'error';
  transactionType: string;
  segments: EDISegment[];
  validationResults: ValidationResult[];
  recipientId?: string;
  recipientName?: string;
  sentAt?: Date;
  processedAt?: Date;
  communicationLog: CommunicationEntry[];
}

export interface EDISegment {
  id: string;
  tag: string;
  elements: string[];
  description: string;
  isValid: boolean;
  errors?: string[];
}

export interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  segment: string;
  element?: number;
  message: string;
  suggestion?: string;
}

export interface CommunicationEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  timestamp: Date;
  type: 'status_update' | 'comment' | 'system';
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  isActive: boolean;
}