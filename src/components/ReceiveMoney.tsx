
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
import { ArrowDownIcon, QrCodeIcon, CopyIcon, CheckIcon } from 'lucide-react';

const ReceiveMoney: React.FC = () => {
  const { upiId, receiveMoney } = useUpi();
  const [amount, setAmount] = useState('');
  const [sender, setSender] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSimulateReceive = () => {
    if (!amount || !sender) return;
    receiveMoney(Number(amount), sender);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-upi-blue text-upi-blue hover:bg-upi-lightBlue">
          <ArrowDownIcon size={18} className="mr-2" /> Receive Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-upi-gray p-4 rounded-lg text-center">
            <div className="bg-white mx-auto w-48 h-48 flex items-center justify-center rounded-lg shadow-sm mb-3">
              <QrCodeIcon size={120} className="text-upi-blue" />
            </div>
            <div className="flex items-center justify-center mt-2">
              <p className="text-sm font-medium">{upiId}</p>
              <button onClick={copyUpiId} className="ml-2 p-1">
                {copied ? <CheckIcon size={14} className="text-upi-green" /> : <CopyIcon size={14} />}
              </button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Simulate Receiving Money</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">From (UPI ID)</label>
                <Input 
                  value={sender} 
                  onChange={(e) => setSender(e.target.value)} 
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
              </div>
              <Button 
                onClick={handleSimulateReceive} 
                disabled={!amount || !sender || Number(amount) <= 0}
                className="w-full"
              >
                Simulate Receive
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveMoney;
