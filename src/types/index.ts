// src/types/index.ts
export interface Member {
  id: string;
  name: string;
  role: string;
  balance: number;
  loans: Loan[];
}

export interface Contribution {
  id: string;
  member: string;
  amount: number;
  timestamp: number;
  txId: string;
  type?: string;
}

export interface Loan {
  id: string;
  member: string;
  amount: number;
  status: string;
  reason: string;
}

export interface SavingsGoal {
  target: number;
  current: number;
}

export interface ChamaData {
  totalBalance: number;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  savingsGoals: {
    landPurchase: SavingsGoal;
  };
}
