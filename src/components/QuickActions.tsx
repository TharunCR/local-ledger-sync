
import React from 'react';
import SendMoney from './SendMoney';
import ReceiveMoney from './ReceiveMoney';

const QuickActions: React.FC = () => {
  return (
    <div className="py-4">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SendMoney />
        </div>
        <div>
          <ReceiveMoney />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
