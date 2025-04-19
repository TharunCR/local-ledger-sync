import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// Define our types
type Transaction = {
  id: string;
  amount: number;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  type: "send" | "receive";
};

type UpiContextType = {
  isOnline: boolean;
  toggleOnline: () => void;
  ledgerBalance: number;
  actualBalance: number;
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  sendMoney: (amount: number, recipient: string, pin: string) => Promise<boolean>;
  receiveMoney: (amount: number, sender: string) => void;
  syncLedger: () => void;
  upiId: string;
};

const UpiContext = createContext<UpiContextType | undefined>(undefined);

export const useUpi = () => {
  const context = useContext(UpiContext);
  if (!context) {
    throw new Error("useUpi must be used within a UpiProvider");
  }
  return context;
};

export const UpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [ledgerBalance, setLedgerBalance] = useState(10000);
  const [actualBalance, setActualBalance] = useState(10000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [upiId, setUpiId] = useState("user@payzzle");
  
  const PIN = "1234"; // This would normally be securely stored/verified

  // Sync balances when coming online
  useEffect(() => {
    if (isOnline && pendingTransactions.length > 0) {
      syncLedger();
      toast.success('Transactions synced automatically');
    }
  }, [isOnline]);

  const toggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (newStatus) {
      toast.info("You are now online");
    } else {
      toast.info("You are now offline");
    }
  };

  const sendMoney = async (amount: number, recipient: string, pin: string): Promise<boolean> => {
    // Validate PIN
    if (pin !== PIN) {
      toast.error("Incorrect UPI PIN");
      return false;
    }

    // Check if amount is valid
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }

    // Check if sufficient balance in ledger
    if (ledgerBalance < amount) {
      toast.error("Insufficient balance");
      return false;
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      recipient,
      sender: upiId,
      timestamp: new Date(),
      status: isOnline ? "completed" : "pending",
      type: "send"
    };

    // Update ledger balance immediately
    setLedgerBalance(prev => prev - amount);

    if (isOnline) {
      setActualBalance(prev => prev - amount);
      setTransactions(prev => [transaction, ...prev]);
      toast.success(`₹${amount} sent to ${recipient}`);
    } else {
      setPendingTransactions(prev => [...prev, transaction]);
      toast.success(`₹${amount} will be sent when online`);
    }
    
    return true;
  };

  const receiveMoney = (amount: number, sender: string) => {
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      recipient: upiId,
      sender,
      timestamp: new Date(),
      status: isOnline ? "completed" : "pending",
      type: "receive"
    };

    // Update ledger balance immediately for all cases
    setLedgerBalance(prev => prev + amount);
    
    if (isOnline) {
      setActualBalance(prev => prev + amount);
      setTransactions(prev => [transaction, ...prev]);
      toast.success(`₹${amount} received from ${sender}`);
    } else {
      setPendingTransactions(prev => [...prev, { ...transaction, status: "pending" }]);
      toast.success(`₹${amount} will be received when online`);
    }
  };

  const syncLedger = () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    if (pendingTransactions.length === 0) {
      toast.info("No pending transactions to sync");
      return;
    }

    // Process pending transactions
    const completedTransactions = pendingTransactions.map(tx => ({
      ...tx,
      status: "completed" as const
    }));
    
    // Update actual balance to match ledger
    setActualBalance(ledgerBalance);
    
    // Move from pending to completed
    setTransactions(prev => [...completedTransactions, ...prev]);
    setPendingTransactions([]);
    
    toast.success(`Synced ${completedTransactions.length} transactions`);
  };

  // Context value
  const value = {
    isOnline,
    toggleOnline,
    ledgerBalance,
    actualBalance,
    transactions,
    pendingTransactions,
    sendMoney,
    receiveMoney,
    syncLedger,
    upiId
  };

  return <UpiContext.Provider value={value}>{children}</UpiContext.Provider>;
};
