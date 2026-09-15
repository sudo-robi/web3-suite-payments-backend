import { z } from 'zod';

// Stream Types
export const CreateStreamSchema = z.object({
  sender: z.string().startsWith('G', 'Must be a valid Stellar public key'),
  receiver: z.string().startsWith('G', 'Must be a valid Stellar public key'),
  amountPerSecond: z.string().regex(/^\d+$/, 'Must be a positive integer string'),
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive(),
});

export type CreateStreamInput = z.infer<typeof CreateStreamSchema>;

export interface Stream {
  id: string;
  sender: string;
  receiver: string;
  amountPerSecond: string;
  startTime: number;
  endTime: number;
  totalStreamed: string;
  withdrawn: string;
  isActive: boolean;
  isPaused: boolean;
  pauseTime: number | null;
  cumulativePauseDuration: number;
  createdAt: number;
}

// Invoice Types
export const InvoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  amount: z.string().regex(/^\d+$/, 'Must be a positive integer string'),
  quantity: z.number().int().positive().max(10000),
});

export const CreateInvoiceSchema = z.object({
  issuer: z.string().startsWith('G', 'Must be a valid Stellar public key'),
  recipient: z.string().startsWith('G', 'Must be a valid Stellar public key'),
  items: z.array(InvoiceItemSchema).min(1).max(50),
  dueDate: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export interface InvoiceItem {
  description: string;
  amount: string;
  quantity: number;
}

export interface Invoice {
  id: string;
  issuer: string;
  recipient: string;
  items: InvoiceItem[];
  totalAmount: string;
  dueDate: number;
  issuedDate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  paidAt: number | null;
  paymentTx: string | null;
}

// Subscription Types
export const CreatePlanSchema = z.object({
  creator: z.string().startsWith('G', 'Must be a valid Stellar public key'),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  amount: z.string().regex(/^\d+$/, 'Must be a positive integer string'),
  billingInterval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  intervalCount: z.number().int().positive().max(12),
  maxSubscribers: z.number().int().positive().optional(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

export const SubscribeSchema = z.object({
  planId: z.string(),
  subscriber: z.string().startsWith('G', 'Must be a valid Stellar public key'),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: string;
  billingInterval: string;
  intervalCount: number;
  maxSubscribers: number | null;
  currentSubscribers: number;
  creator: string;
  isActive: boolean;
  createdAt: number;
}

export interface Subscription {
  id: string;
  planId: string;
  subscriber: string;
  merchant: string;
  startDate: number;
  nextBillingDate: number;
  totalPaid: string;
  billingCount: number;
  isActive: boolean;
  cancelledAt: number | null;
  createdAt: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Network Types
export type StellarNetwork = 'testnet' | 'mainnet' | 'futurenet';
