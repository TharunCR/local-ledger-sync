
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import BluetoothService from '@/services/BluetoothService';

// Define our types
type Transaction = {
  id: string;
  amount: number;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  type: "send" | "receive";
  method?: "online" | "bluetooth" | "nfc" | "qr";
};

type BluetoothDevice = {
  id: string;
  name: string;
  connected: boolean;
  device?: BluetoothDevice;
};

type UpiContextType = {
  isOnline: boolean;
  toggleOnline: () => void;
  ledgerBalance: number;
  actualBalance: number;
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  sendMoney: (amount: number, recipient: string, pin: string) => Promise<boolean>;
  receiveMoney: (amount: number, sender: string, method?: "online" | "bluetooth" | "nfc" | "qr") => void;
  syncLedger: () => void;
  upiId: string;
  isBluetoothOn: boolean;
  toggleBluetooth: () => void;
  bluetoothDevices: BluetoothDevice[];
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: (deviceId: string) => void;
  sendMoneyViaBluetooth: (amount: number, deviceId: string, pin: string) => Promise<boolean>;
  scanForBluetoothDevices: () => Promise<boolean>;
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
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  
  const PIN = "1234"; // This would normally be securely stored/verified

  // Sync balances when coming online
  useEffect(() => {
    if (isOnline && pendingTransactions.length > 0) {
      syncLedger();
      toast.success('Transactions synced automatically');
    }
  }, [isOnline]);

  // Event listener for handling Bluetooth data received
  useEffect(() => {
    // This would be replaced by actual Web Bluetooth API event listeners
    // for receiving data from connected devices
    const handleDataReceived = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.type === 'bluetooth-transfer') {
        const { amount, sender } = customEvent.detail;
        receiveMoney(amount, sender, "bluetooth");
      }
    };

    // Listen for custom events (this would be replaced by actual Bluetooth events)
    window.addEventListener('bluetooth-data-received', handleDataReceived);
    
    return () => {
      window.removeEventListener('bluetooth-data-received', handleDataReceived);
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
    
    if (newBluetoothState) {
      // When turning on, we'd enable the Bluetooth adapter
      if (BluetoothService.isBluetoothAvailable()) {
        setIsBluetoothOn(true);
        toast.success("Bluetooth is now enabled");
      } else {
        toast.error("Web Bluetooth API not available in this browser");
      }
    } else {
      // When turning off, disconnect from all devices
      BluetoothService.disconnect();
      setBluetoothDevices([]);
      setIsBluetoothOn(false);
      toast.info("Bluetooth is now disabled");
    }
  };

  const scanForBluetoothDevices = async (): Promise<boolean> => {
    if (!isBluetoothOn) {
      toast.error("Please turn on Bluetooth first");
      return false;
    }

    try {
      // Request a device - this will prompt the user to select a Bluetooth device
      const device = await BluetoothService.requestDevice();
      
      if (device) {
        // Add the device to our list if it's not already there
        setBluetoothDevices(prev => {
          const existingDevice = prev.find(d => d.id === device.id);
          if (!existingDevice) {
            return [...prev, {
              id: device.id,
              name: device.name || 'Unknown Device',
              connected: false,
              device: device
            }];
          }
          return prev;
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error scanning for Bluetooth devices:", error);
      toast.error("Failed to scan for Bluetooth devices");
      return false;
    }
  };

  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    if (!isBluetoothOn) {
      toast.error("Please turn on Bluetooth first");
      return false;
    }

    const targetDevice = bluetoothDevices.find(device => device.id === deviceId);
    if (!targetDevice) {
      toast.error("Device not found");
      return false;
    }
    
    try {
      const connected = await BluetoothService.connect();
      
      if (connected) {
        // Update device connection status
        setBluetoothDevices(prevDevices =>
          prevDevices.map(device => 
            device.id === deviceId 
              ? { ...device, connected: true }
              : device
          )
        );
        
        toast.success(`Connected to ${targetDevice.name}`);
        return true;
      } else {
        toast.error(`Failed to connect to ${targetDevice.name}`);
        return false;
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
      toast.error(`Connection error: ${(error as Error).message}`);
      return false;
    }
  };

  const disconnectDevice = (deviceId: string) => {
    const device = bluetoothDevices.find(d => d.id === deviceId);
    if (device && device.connected) {
      BluetoothService.disconnect();
      
      setBluetoothDevices(prevDevices =>
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, connected: false }
            : device
        )
      );
      
      toast.info(`Disconnected from ${device.name}`);
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
      type: "send",
      method: isOnline ? "online" : undefined
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
      recipient: targetDevice.name,
      sender: upiId,
      timestamp: new Date(),
      status: "completed",
      type: "send",
      method: "bluetooth"
    };

    // Update ledger balance immediately
    setLedgerBalance(prev => prev - amount);
    setTransactions(prev => [transaction, ...prev]);
    
    // Try to send data via Bluetooth
    try {
      const transferData = {
        type: 'money-transfer',
        amount,
        sender: upiId,
        recipient: targetDevice.name,
        timestamp: new Date(),
        transactionId: transaction.id
      };
      
      const sent = await BluetoothService.sendData(transferData);
      
      if (sent) {
        toast.success(`₹${amount} sent to ${targetDevice.name} via Bluetooth`);
        return true;
      } else {
        toast.error("Failed to send money via Bluetooth");
        return false;
      }
    } catch (error) {
      console.error("Error sending money via Bluetooth:", error);
      toast.error(`Bluetooth transfer error: ${(error as Error).message}`);
      return false;
    }
  };

  const receiveMoney = (amount: number, sender: string, method: "online" | "bluetooth" | "nfc" | "qr" = "online") => {
    const transaction: Transaction = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      recipient: upiId,
      sender,
      timestamp: new Date(),
      status: isOnline ? "completed" : "pending",
      type: "receive",
      method
    };

    // Update ledger balance immediately for all cases
    setLedgerBalance(prev => prev + amount);
    
    if (isOnline || method === "bluetooth") {
      setActualBalance(prev => prev + amount);
      setTransactions(prev => [transaction, ...prev]);
      toast.success(`₹${amount} received from ${sender} ${method === "bluetooth" ? "via Bluetooth" : ""}`);
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
    sendMoneyViaBluetooth,
    scanForBluetoothDevices
  };

  return <UpiContext.Provider value={value}>{children}</UpiContext.Provider>;
};
