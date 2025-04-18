
import React from 'react';
import { useUpi } from '@/context/UpiContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon } from 'lucide-react';

const BalanceCard: React.FC = () => {
  const { ledgerBalance, actualBalance, isOnline, syncLedger, pendingTransactions } = useUpi();

  const hasPendingTx = pendingTransactions.length > 0;
  const needsSync = ledgerBalance !== actualBalance;
  
  return (
    <Card className="w-full p-6 bg-gradient-to-br from-upi-blue to-blue-700 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-upi-yellow via-upi-green to-upi-blue"></div>
      
      <div className="mb-4">
        <p className="text-sm opacity-80">UPI ID</p>
        <p className="font-medium">user@localupi</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm opacity-80">Ledger Balance</p>
        <p className="text-2xl font-bold">₹{ledgerBalance.toLocaleString()}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm opacity-80">Actual Balance</p>
        <p className="text-2xl font-bold">₹{actualBalance.toLocaleString()}</p>
        
        {needsSync && (
          <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-full mt-1">
            {hasPendingTx ? `${pendingTransactions.length} pending transactions` : "Balances out of sync"}
          </p>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" className="bg-white/20 border-0 text-white hover:bg-white/30 flex-1 mr-2">
          <ArrowDownIcon size={18} className="mr-2" /> Receive
        </Button>
        <Button variant="outline" className="bg-white/20 border-0 text-white hover:bg-white/30 flex-1">
          <ArrowUpIcon size={18} className="mr-2" /> Send
        </Button>
      </div>
      
      {needsSync && isOnline && (
        <Button 
          onClick={syncLedger}
          variant="secondary" 
          className="mt-4 w-full bg-white/90 text-upi-blue hover:bg-white"
        >
          <RefreshCwIcon size={16} className="mr-2" /> Sync Now
        </Button>
      )}
    </Card>
  );
};

export default BalanceCard;
