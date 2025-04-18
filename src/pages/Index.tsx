
import React from 'react';
import { UpiProvider } from '@/context/UpiContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import QuickActions from '@/components/QuickActions';
import TransactionList from '@/components/TransactionList';

const Index = () => {
  return (
    <UpiProvider>
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        <Header />
        
        <main className="pb-24 px-4">
          <div className="space-y-4">
            <BalanceCard />
            <QuickActions />
            
            <div>
              <h2 className="text-lg font-medium mb-2">Transactions</h2>
              <div className="bg-white rounded-lg shadow-sm">
                <TransactionList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </UpiProvider>
  );
};

export default Index;
