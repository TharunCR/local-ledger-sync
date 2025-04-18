
import React, { useEffect } from 'react';
import { useUpi } from '@/context/UpiContext';
import { Card } from '@/components/ui/card';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';

const BalanceCard: React.FC = () => {
  const { ledgerBalance, actualBalance, isOnline, syncLedger, pendingTransactions } = useUpi();

  const hasPendingTx = pendingTransactions.length > 0;
  const needsSync = ledgerBalance !== actualBalance;
  
  // Automatically sync when online and there are pending transactions
  useEffect(() => {
    if (isOnline && hasPendingTx) {
      syncLedger();
      toast.success('Transactions synced automatically');
    }
  }, [isOnline, hasPendingTx, syncLedger]);

  return (
    <Card className="w-full p-6 bg-gradient-to-br from-upi-blue to-blue-700 text-white relative overflow-hidden rounded-lg shadow-md">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-upi-yellow via-upi-green to-upi-blue"></div>
      
      <div className="mb-4">
        <p className="text-sm opacity-80">Actual Balance</p>
        <p className="text-3xl font-bold mb-2">₹{actualBalance.toLocaleString()}</p>
        
        {needsSync && (
          <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-full mt-1">
            {hasPendingTx ? `${pendingTransactions.length} pending transactions` : "Balances out of sync"}
          </p>
        )}
      </div>
      
      <div>
        <p className="text-sm opacity-80">Ledger Balance</p>
        <p className="text-xl font-medium">₹{ledgerBalance.toLocaleString()}</p>
      </div>
    </Card>
  );
};

export default BalanceCard;
