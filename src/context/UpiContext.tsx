
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
  const [upiId, setUpiId] = useState("user@localupi");
  
  const PIN = "1234"; // This would normally be securely stored/verified

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

    // If online, update actual balance too
    if (isOnline) {
      setActualBalance(prev => prev - amount);
      setTransactions(prev => [transaction, ...prev]);
      toast.success(`₹${amount} sent to ${recipient}`);
    } else {
      // Save to pending transactions if offline
      setPendingTransactions(prev => [...prev, transaction]);
      toast.success(`₹${amount} will be sent when online`);
    }
    
    return true;
  };

  const receiveMoney = (amount: number, sender: string) => {
    // Create transaction
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      recipient: upiId,
      sender,
      timestamp: new Date(),
      status: "completed",
      type: "receive"
    };

    // Update balances
    setLedgerBalance(prev => prev + amount);
    if (isOnline) {
      setActualBalance(prev => prev + amount);
    }
    
    // Add to transactions
    setTransactions(prev => [transaction, ...prev]);
    toast.success(`₹${amount} received from ${sender}`);
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
    
    // Update actual balance
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
