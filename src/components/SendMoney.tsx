
import React, { useState, useEffect } from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpIcon, 
  BluetoothIcon, 
  BluetoothConnectedIcon, 
  BluetoothOffIcon,
  BluetoothSearchingIcon,
  NfcIcon, 
  QrCodeIcon, 
  PhoneIcon,
  CheckCircle2Icon,
  XCircleIcon
} from 'lucide-react';
import { toast } from 'sonner';

const SendMoney: React.FC = () => {
  const { 
    sendMoney, 
    isOnline, 
    ledgerBalance, 
    isBluetoothOn,
    bluetoothDevices,
    connectToDevice,
    disconnectDevice,
    sendMoneyViaBluetooth
  } = useUpi();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1);
  const [transferMethod, setTransferMethod] = useState<'bluetooth' | 'nfc' | 'qr'>('bluetooth');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    if (!isBluetoothOn) {
      toast.error("Please enable Bluetooth first");
      return;
    }
    
    setIsSearching(true);
    
    // Simulate device discovery process
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    connectToDevice(deviceId);
  };

  const handleDeviceDisconnect = (deviceId: string) => {
    disconnectDevice(deviceId);
    if (selectedDevice === deviceId) {
      setSelectedDevice(null);
    }
  };

  const handleSend = async () => {
    if (step === 1) {
      if (isOnline) {
        setStep(3);
      } else {
        setStep(2);
      }
      return;
    }
    
    if (step === 2) {
      setStep(3);
      return;
    }
    
    setIsProcessing(true);
    
    let success;
    
    // Use different sending method based on online status and transfer method
    if (!isOnline && transferMethod === 'bluetooth' && selectedDevice) {
      success = await sendMoneyViaBluetooth(Number(amount), selectedDevice, pin);
    } else {
      success = await sendMoney(Number(amount), recipient, pin);
    }
    
    setIsProcessing(false);
    
    if (success) {
      const message = isOnline 
        ? `₹${amount} sent to ${recipient}`
        : `Offline transfer of ₹${amount} initiated via ${transferMethod}`;
      toast.success(message);
      resetForm();
      setIsOpen(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setPin('');
    setStep(1);
    setIsSearching(false);
    setSelectedDevice(null);
    setTransferMethod('bluetooth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-upi-blue hover:bg-blue-700">
          <ArrowUpIcon size={18} className="mr-2" /> Send Money
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Money {!isOnline && '(Offline Mode)'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
                <Input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="0"
                  type="text"
                  inputMode="numeric"
                />
              </div>
              {isOnline && (
                <div>
                  <label className="text-sm font-medium mb-1 block">To (UPI ID)</label>
                  <Input 
                    value={recipient} 
                    onChange={(e) => setRecipient(e.target.value)} 
                    placeholder="friend@upi"
                  />
                </div>
              )}
            </div>
          )}
          
          {!isOnline && step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Transfer Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={transferMethod === 'bluetooth' ? 'default' : 'outline'}
                    className="flex flex-col items-center py-3"
                    onClick={() => setTransferMethod('bluetooth')}
                    disabled={!isBluetoothOn}
                  >
                    {isBluetoothOn ? (
                      <BluetoothIcon className="mb-1" />
                    ) : (
                      <BluetoothOffIcon className="mb-1 text-gray-400" />
                    )}
                    <span className="text-xs">Bluetooth</span>
                  </Button>
                  <Button
                    type="button"
                    variant={transferMethod === 'nfc' ? 'default' : 'outline'}
                    className="flex flex-col items-center py-3"
                    onClick={() => setTransferMethod('nfc')}
                  >
                    <NfcIcon className="mb-1" />
                    <span className="text-xs">NFC</span>
                  </Button>
                  <Button
                    type="button"
                    variant={transferMethod === 'qr' ? 'default' : 'outline'}
                    className="flex flex-col items-center py-3"
                    onClick={() => setTransferMethod('qr')}
                  >
                    <QrCodeIcon className="mb-1" />
                    <span className="text-xs">QR</span>
                  </Button>
                </div>
              </div>
              
              {transferMethod === 'bluetooth' && (
                <div>
                  {!isBluetoothOn ? (
                    <div className="text-center py-3">
                      <BluetoothOffIcon size={40} className="mx-auto mb-2 text-gray-400" />
                      <p>Please enable Bluetooth in the header to use this feature</p>
                    </div>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSearch} 
                        disabled={isSearching}
                        className="w-full"
                      >
                        {isSearching ? (
                          <>
                            <BluetoothSearchingIcon className="animate-pulse mr-2" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <BluetoothIcon className="mr-2" />
                            Scan for Nearby Devices
                          </>
                        )}
                      </Button>
                      
                      {bluetoothDevices.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Available Devices:</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {bluetoothDevices.map((device) => (
                              <div 
                                key={device.id}
                                className={`border rounded-md p-3 flex justify-between items-center
                                  ${device.connected ? 'border-blue-500' : 'border-gray-200'}`}
                              >
                                <div className="flex items-center">
                                  {device.connected ? (
                                    <BluetoothConnectedIcon size={18} className="mr-2 text-blue-500" />
                                  ) : (
                                    <BluetoothIcon size={18} className="mr-2 text-gray-500" />
                                  )}
                                  <span>{device.name}</span>
                                </div>
                                {device.connected ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeviceDisconnect(device.id)}
                                    className="text-xs"
                                  >
                                    <XCircleIcon size={14} className="mr-1" />
                                    Disconnect
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeviceSelect(device.id)}
                                    className="text-xs"
                                  >
                                    <CheckCircle2Icon size={14} className="mr-1" />
                                    Select
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {transferMethod === 'nfc' && (
                <div className="text-center py-4">
                  <NfcIcon size={64} className="mx-auto mb-4 text-upi-blue" />
                  <p className="mb-2">Place devices back-to-back to transfer</p>
                  <p className="text-sm text-gray-500">Enter amount and tap to start</p>
                </div>
              )}
              
              {transferMethod === 'qr' && (
                <div className="text-center py-4">
                  <div className="bg-white mx-auto w-48 h-48 flex items-center justify-center rounded-lg shadow-sm mb-3 border-2">
                    <QrCodeIcon size={120} className="text-upi-blue" />
                  </div>
                  <p className="text-sm">Show this QR to recipient</p>
                </div>
              )}
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Enter 4-digit UPI PIN</label>
                <Input 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="****" 
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                />
              </div>
              
              {isProcessing && (
                <div className="text-center py-2">
                  <div className="animate-pulse">Processing transfer...</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => {
            resetForm();
            setIsOpen(false);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={
              step === 1 
                ? !amount || (isOnline && !recipient) 
                : step === 2
                  ? (transferMethod === 'bluetooth' && (!isBluetoothOn || !selectedDevice))
                  : !pin || pin.length !== 4 || isProcessing
            }
          >
            {step === 3 ? "Send" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoney;
