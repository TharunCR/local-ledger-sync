
import React from 'react';
import { useUpi } from '@/context/UpiContext';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionList: React.FC = () => {
  const { transactions, pendingTransactions } = useUpi();
  
  const allTransactions = [...pendingTransactions, ...transactions];

  if (allTransactions.length === 0) {
    return (
      <div className="py-8 text-center text-upi-darkGray">
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {allTransactions.map((tx) => (
        <div 
          key={tx.id} 
          className={`p-4 border-b flex items-center justify-between ${
            tx.status === "pending" ? "bg-amber-50" : ""
          }`}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              tx.type === "send" ? "bg-red-100" : "bg-green-100"
            }`}>
              {tx.type === "send" ? (
                <ArrowUpIcon className="text-upi-red" size={20} />
              ) : (
                <ArrowDownIcon className="text-upi-green" size={20} />
              )}
            </div>
            <div>
              <p className="font-medium">
                {tx.type === "send" ? tx.recipient : tx.sender}
              </p>
              <p className="text-xs text-upi-darkGray flex items-center">
                {format(new Date(tx.timestamp), 'dd MMM, hh:mm a')}
                {tx.status === "pending" && (
                  <span className="flex items-center ml-2 text-amber-600">
                    <ClockIcon size={12} className="mr-1" /> Pending
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className={`text-right ${
            tx.type === "send" ? "text-upi-red" : "text-upi-green"
          }`}>
            <p className="font-medium">
              {tx.type === "send" ? "-" : "+"}₹{tx.amount}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
