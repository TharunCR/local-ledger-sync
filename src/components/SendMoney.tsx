
import React, { useState } from 'react';
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
import { ArrowUpIcon, BluetoothIcon, NfcIcon, QrCodeIcon, PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';

const SendMoney: React.FC = () => {
  const { sendMoney, isOnline, ledgerBalance } = useUpi();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1);
  const [transferMethod, setTransferMethod] = useState<'bluetooth' | 'nfc' | 'qr'>('bluetooth');
  const [isSearching, setIsSearching] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate device search for offline modes
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setFoundDevices(['Device 1', 'Device 2', 'Device 3']);
      setIsSearching(false);
    }, 2000);
  };

  const handleDeviceClick = (device: string) => {
    setRecipient(`${device.toLowerCase().replace(' ', '')}@localupi`);
  };

  const handleSend = async () => {
    if (step === 1) {
      if (isOnline) {
        setStep(3); // Skip offline method selection, go straight to PIN
      } else {
        setStep(2); // Show offline transfer methods
      }
      return;
    }
    
    if (step === 2) {
      setStep(3); // After selecting offline method, go to PIN
      return;
    }
    
    // PIN verification and transfer (step 3)
    setIsProcessing(true);
    const success = await sendMoney(Number(amount), recipient, pin);
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
    setFoundDevices([]);
    setTransferMethod('bluetooth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-upi-blue hover:bg-blue-700">
          <ArrowUpIcon size={18} className="mr-2" /> Send Money
        </Button>
      </DialogTrigger>
      <DialogContent>
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
                  >
                    <BluetoothIcon className="mb-1" />
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
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching}
                    className="w-full"
                  >
                    {isSearching ? 'Searching...' : 'Search for Nearby Devices'}
                  </Button>
                  
                  {foundDevices.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Select a device:</p>
                      <div className="space-y-2">
                        {foundDevices.map((device, idx) => (
                          <Button 
                            key={idx}
                            variant="outline"
                            className={`w-full justify-start ${recipient === `${device.toLowerCase().replace(' ', '')}@localupi` ? 'border-blue-500' : ''}`}
                            onClick={() => handleDeviceClick(device)}
                          >
                            <PhoneIcon size={16} className="mr-2" />
                            {device}
                          </Button>
                        ))}
                      </div>
                    </div>
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
                  ? !recipient && transferMethod === 'bluetooth'
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
