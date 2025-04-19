
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

type BluetoothDevice = {
  id: string;
  name: string;
  connected: boolean;
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
  isBluetoothOn: boolean;
  toggleBluetooth: () => void;
  bluetoothDevices: BluetoothDevice[];
  connectToDevice: (deviceId: string) => void;
  disconnectDevice: (deviceId: string) => void;
  sendMoneyViaBluetooth: (amount: number, deviceId: string, pin: string) => Promise<boolean>;
};

// Create a context to share bluetooth state across components
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
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([
    { id: "device1", name: "Laptop B", connected: false },
    { id: "device2", name: "Mobile A", connected: false },
    { id: "device3", name: "Laptop C", connected: false }
  ]);
  
  const PIN = "1234"; // This would normally be securely stored/verified

  // Sync balances when coming online
  useEffect(() => {
    if (isOnline && pendingTransactions.length > 0) {
      syncLedger();
      toast.success('Transactions synced automatically');
    }
  }, [isOnline]);

  // Event listener to simulate receiving bluetooth toggle state from other devices
  useEffect(() => {
    // In a real app, this would be a connection to a Bluetooth API
    const handleBluetoothEvent = (event: CustomEvent) => {
      if (event.detail && event.detail.type === 'bluetooth-toggle') {
        setIsBluetoothOn(event.detail.state);
        if (event.detail.state) {
          toast.info("Bluetooth turned on by another device");
        } else {
          toast.info("Bluetooth turned off by another device");
        }
      }

      // Handle incoming money transfers via Bluetooth
      if (event.detail && event.detail.type === 'bluetooth-transfer') {
        const { amount, sender } = event.detail;
        receiveMoney(amount, sender);
        toast.success(`Received ₹${amount} via Bluetooth from ${sender}`);
      }
    };

    // Register global event listener for simulating Bluetooth communication
    window.addEventListener('bluetooth-event' as any, handleBluetoothEvent);
    
    return () => {
      window.removeEventListener('bluetooth-event' as any, handleBluetoothEvent);
    };
  }, []);

  const toggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (newStatus) {
      toast.info("You are now online");
    } else {
      toast.info("You are now offline");
    }
  };

  const toggleBluetooth = () => {
    const newBluetoothState = !isBluetoothOn;
    setIsBluetoothOn(newBluetoothState);
    
    // In a real app, this would use the Bluetooth API to toggle the device's Bluetooth
    
    // Simulate broadcasting the Bluetooth state change to other devices
    const bluetoothEvent = new CustomEvent('bluetooth-event', {
      detail: {
        type: 'bluetooth-toggle',
        state: newBluetoothState,
      }
    });
    window.dispatchEvent(bluetoothEvent);
    
    if (newBluetoothState) {
      toast.success("Bluetooth is now enabled");
    } else {
      toast.error("Bluetooth is now disabled");
      // Disconnect from all devices when turning Bluetooth off
      setBluetoothDevices(prevDevices => 
        prevDevices.map(device => ({ ...device, connected: false }))
      );
    }
  };

  const connectToDevice = (deviceId: string) => {
    if (!isBluetoothOn) {
      toast.error("Please turn on Bluetooth first");
      return;
    }

    setBluetoothDevices(prevDevices =>
      prevDevices.map(device => 
        device.id === deviceId 
          ? { ...device, connected: true }
          : device
      )
    );
    
    toast.success(`Connected to ${bluetoothDevices.find(d => d.id === deviceId)?.name}`);
  };

  const disconnectDevice = (deviceId: string) => {
    setBluetoothDevices(prevDevices =>
      prevDevices.map(device => 
        device.id === deviceId 
          ? { ...device, connected: false }
          : device
      )
    );
    
    toast.info(`Disconnected from ${bluetoothDevices.find(d => d.id === deviceId)?.name}`);
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

  const sendMoneyViaBluetooth = async (amount: number, deviceId: string, pin: string): Promise<boolean> => {
    // Validate conditions
    if (!isBluetoothOn) {
      toast.error("Please turn on Bluetooth first");
      return false;
    }
    
    if (pin !== PIN) {
      toast.error("Incorrect UPI PIN");
      return false;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }

    if (ledgerBalance < amount) {
      toast.error("Insufficient balance");
      return false;
    }

    const targetDevice = bluetoothDevices.find(device => device.id === deviceId);
    if (!targetDevice) {
      toast.error("Device not found");
      return false;
    }
    
    if (!targetDevice.connected) {
      toast.error("Please connect to the device first");
      return false;
    }

    // Create a transaction
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      recipient: `${targetDevice.name}@payzzle`,
      sender: upiId,
      timestamp: new Date(),
      status: "pending",
      type: "send"
    };

    // Update ledger balance immediately
    setLedgerBalance(prev => prev - amount);
    setPendingTransactions(prev => [...prev, transaction]);

    // Simulate sending money via Bluetooth to the other device
    const transferEvent = new CustomEvent('bluetooth-event', {
      detail: {
        type: 'bluetooth-transfer',
        amount,
        sender: upiId,
        recipient: targetDevice.name
      }
    });
    window.dispatchEvent(transferEvent);
    
    toast.success(`₹${amount} sent to ${targetDevice.name} via Bluetooth`);
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
    upiId,
    isBluetoothOn,
    toggleBluetooth,
    bluetoothDevices,
    connectToDevice,
    disconnectDevice,
    sendMoneyViaBluetooth
  };

  return <UpiContext.Provider value={value}>{children}</UpiContext.Provider>;
};
