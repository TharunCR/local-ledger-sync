
import React, { useState } from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';

const SendMoney: React.FC = () => {
  const { sendMoney, isOnline, ledgerBalance } = useUpi();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (step === 1) {
      if (!amount || !recipient) return;
      setStep(2);
    } else {
      const success = await sendMoney(Number(amount), recipient, pin);
      if (success) {
        resetForm();
        setIsOpen(false);
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setRecipient('');
    setPin('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
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
          <DialogTitle>{step === 1 ? "Send Money" : "Enter UPI PIN"}</DialogTitle>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">To (UPI ID)</label>
              <Input 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)} 
                placeholder="friend@upi"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
              <Input 
                value={amount} 
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} 
                placeholder="0"
                type="text"
                inputMode="numeric"
              />
              {Number(amount) > ledgerBalance && (
                <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
              )}
            </div>
            
            <div className="text-xs text-upi-darkGray mt-2">
              {!isOnline && (
                <p className="bg-amber-50 p-2 rounded text-amber-700 border border-amber-200">
                  You are offline. Transaction will be pending until you go online.
                </p>
              )}
            </div>
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
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            disabled={step === 1 ? !amount || !recipient || Number(amount) > ledgerBalance : !pin || pin.length !== 4}
          >
            {step === 1 ? "Continue" : "Pay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoney;
