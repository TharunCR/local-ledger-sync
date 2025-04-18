
import React from 'react';
import SendMoney from './SendMoney';
import ReceiveMoney from './ReceiveMoney';

const QuickActions: React.FC = () => {
  return (
    <div className="py-4">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="flex space-x-3">
        <div className="flex-1">
          <SendMoney />
        </div>
        <div className="flex-1">
          <ReceiveMoney />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
