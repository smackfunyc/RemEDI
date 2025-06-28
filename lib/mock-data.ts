import { Transaction, TransactionStatus, TransactionType, StakeholderType } from '@/types/transaction';

const partners = [
  'Walmart Distribution', 'Amazon Logistics', 'Target Supply Chain', 'Home Depot Freight',
  'FedEx Ground', 'UPS Supply Chain', 'DHL Express', 'USPS Commercial',
  'Kroger Logistics', 'Costco Wholesale', 'Best Buy Distribution', 'Lowes Transport'
];

const transactionTypes: TransactionType[] = ['850', '856', '810', '997'];
const statuses: TransactionStatus[] = ['pending', 'processing', 'completed', 'error'];
const stakeholders: StakeholderType[] = ['shipper', 'carrier', '4pl', 'receiver'];

export function generateMockTransaction(): Transaction {
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const stakeholder = stakeholders[Math.floor(Math.random() * stakeholders.length)];
  const partner = partners[Math.floor(Math.random() * partners.length)];
  
  const baseDate = new Date();
  const createdAt = new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  const lastUpdated = new Date(createdAt.getTime() + Math.random() * (baseDate.getTime() - createdAt.getTime()));

  return {
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    status,
    stakeholder,
    partnerName: partner,
    referenceNumber: `${type}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    amount: type === '810' ? Math.floor(Math.random() * 50000) + 1000 : undefined,
    errorMessage: status === 'error' ? 'Invalid product code in line item 3' : undefined,
    createdAt,
    lastUpdated,
    priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
    documentCount: Math.floor(Math.random() * 5) + 1,
    validationScore: Math.floor(Math.random() * 30) + 70,
  };
}

export const mockTransactions: Transaction[] = Array.from(
  { length: 25 },
  () => generateMockTransaction()
).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());