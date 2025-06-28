import { Recipient } from '@/types/edi';

export const mockRecipients: Recipient[] = [
  {
    id: 'rec_1',
    name: 'John Smith',
    email: 'john.smith@walmart.com',
    company: 'Walmart Distribution',
    role: 'EDI Coordinator',
    isActive: true
  },
  {
    id: 'rec_2',
    name: 'Sarah Johnson',
    email: 'sarah.j@amazon.com',
    company: 'Amazon Logistics',
    role: 'Supply Chain Manager',
    isActive: true
  },
  {
    id: 'rec_3',
    name: 'Mike Chen',
    email: 'mchen@target.com',
    company: 'Target Supply Chain',
    role: 'EDI Specialist',
    isActive: true
  },
  {
    id: 'rec_4',
    name: 'Lisa Rodriguez',
    email: 'l.rodriguez@homedepot.com',
    company: 'Home Depot Freight',
    role: 'Logistics Coordinator',
    isActive: true
  },
  {
    id: 'rec_5',
    name: 'David Park',
    email: 'dpark@fedex.com',
    company: 'FedEx Ground',
    role: 'Operations Manager',
    isActive: true
  }
];