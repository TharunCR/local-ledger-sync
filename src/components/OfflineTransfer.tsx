
import React, { useState } from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BluetoothIcon, NfcIcon, QrCodeIcon, PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';

const OfflineTransfer: React.FC = () => {
  const { sendMoney, receiveMoney, upiId } = useUpi();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1);
  const [transferMethod, setTransferMethod] = useState<'bluetooth' | 'nfc' | 'qr'>('bluetooth');
  const [isSearching, setIsSearching] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate device search
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setFoundDevices(['Device 1', 'Device 2', 'Device 3']);
      setIsSearching(false);
    }, 2000);
  };

  // Simulate transfer process
  const handleTransfer = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    if (step === 2) {
      setIsProcessing(true);
      
      setTimeout(async () => {
        const success = await sendMoney(Number(amount), recipient, pin);
        setIsProcessing(false);
        
        if (success) {
          toast.success(`Offline transfer of ₹${amount} initiated via ${transferMethod}`);
          resetForm();
          setIsOpen(false);
        }
      }, 2000);
    }
  };
  
  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setPin('');
    setStep(1);
    setIsSearching(false);
    setFoundDevices([]);
  };

  const handleDeviceClick = (device: string) => {
    setRecipient(`${device.toLowerCase().replace(' ', '')}@localupi`);
  };

  const handleReceiveViaNFC = () => {
    toast.info("Ready to receive payment. Place devices back-to-back");
    setTimeout(() => {
      receiveMoney(100, "device@localupi");
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-purple-400 text-purple-700 hover:bg-purple-50">
          <PhoneIcon size={18} className="mr-2" /> Offline Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Offline Money Transfer</DialogTitle>
          <DialogDescription>
            Send or receive money without internet using Bluetooth, NFC, or QR code
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Money</TabsTrigger>
            <TabsTrigger value="receive">Receive Money</TabsTrigger>
          </TabsList>
          
          <TabsContent value="send">
            {step === 1 ? (
              <div className="space-y-4 py-4">
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
                  <div className="mt-4">
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
            ) : (
              <div className="space-y-4 py-4">
                <p className="text-center">
                  Sending ₹{amount} to {recipient}
                </p>
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
            
            <div className="flex justify-end space-x-2 mt-2">
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsOpen(false);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleTransfer} 
                disabled={
                  step === 1 
                    ? !amount || 
                      (transferMethod === 'bluetooth' && !recipient) || 
                      isSearching
                    : !pin || pin.length !== 4 || isProcessing
                }
              >
                {step === 1 ? "Continue" : "Transfer"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="receive">
            <div className="space-y-4 py-4">
              <Tabs defaultValue="bluetooth">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="bluetooth">Bluetooth</TabsTrigger>
                  <TabsTrigger value="nfc">NFC</TabsTrigger>
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bluetooth" className="pt-4">
                  <div className="text-center">
                    <BluetoothIcon size={48} className="mx-auto mb-4 text-blue-600" />
                    <p className="mb-3">Make your device discoverable</p>
                    <Button className="w-full">Make Discoverable</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="nfc" className="pt-4">
                  <div className="text-center">
                    <NfcIcon size={48} className="mx-auto mb-4 text-blue-600" />
                    <p className="mb-3">Place devices back-to-back to receive payment</p>
                    <Button className="w-full" onClick={handleReceiveViaNFC}>
                      Activate NFC Receiver
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="qr" className="pt-4">
                  <div className="text-center">
                    <div className="bg-white mx-auto w-48 h-48 flex items-center justify-center rounded-lg shadow-sm mb-4 border-2">
                      <QrCodeIcon size={120} className="text-upi-blue" />
                    </div>
                    <p className="text-sm">Your UPI ID: {upiId}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OfflineTransfer;
